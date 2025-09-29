import json
import base64
from typing import Dict, Any, List
import csv
from io import StringIO
import re

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Парсит CSV/TSV файлы с каталогом канцтоваров
    Args: event - dict с httpMethod, body содержащий base64 файл
          context - объект с request_id, function_name  
    Returns: JSON с товарами для каталога
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        file_data = body_data.get('fileData', '')
        filename = body_data.get('filename', '')
        
        if not file_data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'No file data provided'}),
                'isBase64Encoded': False
            }
        
        # Decode base64 file
        try:
            # Remove data URL prefix if present
            if ',' in file_data:
                file_data = file_data.split(',', 1)[1]
            
            file_bytes = base64.b64decode(file_data)
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False, 
                    'error': f'Ошибка декодирования файла: {str(e)}'
                }),
                'isBase64Encoded': False
            }
        
        # Try different encodings
        content = None
        for encoding in ['utf-8', 'cp1251', 'windows-1251', 'utf-16']:
            try:
                content = file_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        
        if not content:
            content = file_bytes.decode('utf-8', errors='ignore')
        
        # Detect delimiter (tab or comma)
        delimiter = '\t' if '\t' in content else ','
        
        # Parse CSV/TSV
        try:
            csv_reader = csv.DictReader(StringIO(content), delimiter=delimiter)
            rows = list(csv_reader)
            
            # Get column names for debugging
            column_names = list(csv_reader.fieldnames) if csv_reader.fieldnames else []
            
        except Exception as e:
            # Include first few lines of content for debugging
            preview = content[:500] if len(content) > 500 else content
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': f'Ошибка парсинга файла: {str(e)}',
                    'debug_info': {
                        'delimiter': delimiter,
                        'content_preview': preview,
                        'content_length': len(content)
                    }
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        if not rows:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Файл пустой или не содержит данных',
                    'debug_info': {
                        'column_names': column_names,
                        'rows_count': len(rows),
                        'delimiter': delimiter
                    }
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Process products
        products = []
        categories = set()
        
        for idx, row in enumerate(rows):
            if not row or not any(row.values()):
                continue
                
            # Get values with flexible column matching
            article = get_column_value(row, ['Артикул', 'артикул', 'Article'])
            brand = get_column_value(row, ['Бренд', 'бренд', 'Brand'])
            name = get_column_value(row, ['Наименование', 'наименование', 'Name'])
            unit = get_column_value(row, ['Ед.', 'Ед. (единицы измерения)', 'единицы измерения', 'Unit'])
            recommended_price = parse_price(get_column_value(row, ['Цена (Рекомендуемая)', 'рекомендуемая цена', 'Recommended Price']))
            dealer_price = parse_price(get_column_value(row, ['Цена дилер', 'Цена дилер (по которой идет рассчет)', 'дилерская цена', 'Dealer Price']))
            special_offer = get_column_value(row, ['Акция!!!', 'акция', 'Special Offer'])
            discount_percent = get_column_value(row, ['% скидки', 'процент скидки', 'Discount %'])
            special_price = parse_price(get_column_value(row, ['Специальная цена!!!', 'специальная цена', 'Special Price']))
            package = get_column_value(row, ['Упаковка', 'упаковка', 'Package'])
            barcode = get_column_value(row, ['Штрих-код', 'штрихкод', 'Barcode'])
            photo = get_column_value(row, ['Фото', 'фото', 'Photo', 'Image'])
            
            if not name:
                continue
            
            # Determine pricing logic
            has_special_pricing = bool(
                (special_offer and special_offer.strip() and special_offer.strip() not in ['', 'Новинка!!!']) or
                (discount_percent and discount_percent.strip()) or
                special_price > 0
            )
            
            # Calculate final price
            if special_price > 0:
                final_price = special_price
                base_price = dealer_price or recommended_price
            elif special_offer and special_offer.strip() and special_offer.strip() not in ['', 'Новинка!!!']:
                final_price = parse_price(special_offer) or dealer_price or recommended_price
                base_price = dealer_price or recommended_price
            elif discount_percent and discount_percent.strip():
                discount_val = parse_price(discount_percent)
                if discount_val > 0:
                    base = dealer_price or recommended_price
                    if discount_val > 100:  # Assume it's a fixed price
                        final_price = discount_val
                    else:  # It's a percentage
                        final_price = base * (1 - discount_val / 100)
                    base_price = base
                else:
                    final_price = dealer_price or recommended_price
                    base_price = final_price
            else:
                final_price = dealer_price or recommended_price
                base_price = final_price
            
            # Category from brand or default
            category = brand.strip() if brand and brand.strip() else 'Канцтовары'
            categories.add(category)
            
            product = {
                'id': f"item_{idx}",
                'name': name.strip(),
                'article': article.strip() if article else '',
                'brand': brand.strip() if brand else '',
                'category': category,
                'price': round(final_price, 2),
                'basePrice': round(base_price, 2),
                'recommendedPrice': round(recommended_price, 2),
                'unit': unit.strip() if unit else '',
                'package': package.strip() if package else '',
                'barcode': barcode.strip() if barcode else '',
                'image': process_image_path(photo),
                'inStock': True,
                'hasSpecialPricing': has_special_pricing,
                'specialOffer': special_offer.strip() if special_offer else '',
                'discountPercent': discount_percent.strip() if discount_percent else '',
                'specialPrice': special_price if special_price > 0 else None,
                'description': f"{brand} {name}".strip() if brand else name.strip()
            }
            
            products.append(product)
        
        categories_list = sorted(list(categories))
        
        result = {
            'success': True,
            'products': products,
            'categories': categories_list,
            'total_products': len(products),
            'filename': filename,
            'processed_at': context.request_id,
            'message': f'Обработано {len(products)} товаров из {len(categories_list)} категорий'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Внутренняя ошибка сервера: {str(e)}',
                'request_id': context.request_id
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

def get_column_value(row: Dict[str, str], possible_names: List[str]) -> str:
    """Get value from row by trying different column names"""
    for name in possible_names:
        # Exact match
        if name in row:
            return row[name] or ''
        
        # Case insensitive match
        for key in row.keys():
            if key.lower().strip() == name.lower().strip():
                return row[key] or ''
    
    return ''

def parse_price(price_value: str) -> float:
    """Parse price from string"""
    if not price_value or not price_value.strip():
        return 0.0
    
    price_str = str(price_value).strip()
    # Remove currency symbols, spaces, and commas used as thousands separator
    price_str = re.sub(r'[₽$€\s]', '', price_str)
    # Replace comma with dot for decimal (but be careful with thousands separator)
    if price_str.count(',') == 1 and price_str.count('.') == 0:
        # Single comma, likely decimal separator
        price_str = price_str.replace(',', '.')
    elif ',' in price_str and '.' in price_str:
        # Both comma and dot, comma is thousands separator
        price_str = price_str.replace(',', '')
    
    try:
        return float(price_str)
    except (ValueError, TypeError):
        return 0.0

def process_image_path(photo_path: str) -> str:
    """Process image path from file"""
    if not photo_path or not photo_path.strip():
        return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'
    
    photo_path = photo_path.strip()
    
    # If it's a URL, return as is
    if photo_path.startswith(('http://', 'https://')):
        return photo_path
    
    # If it's a relative path, keep it
    if photo_path.startswith('/'):
        return photo_path
    
    # If it's just a filename, assume it's in images folder
    if '.' in photo_path:
        return f'/images/{photo_path}'
    
    # Default fallback
    return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'