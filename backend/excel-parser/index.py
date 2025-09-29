import json
import base64
from typing import Dict, Any, List, Optional
import csv
from io import StringIO, BytesIO
import re

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Парсит Excel файлы с каталогом канцтоваров со специальными ценами и скидками
    Args: event - dict с httpMethod, body содержащий base64 файл
          context - объект с request_id, function_name  
    Returns: JSON с товарами для каталога с обработкой специальных цен
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        file_data = body_data.get('fileData', '')
        filename = body_data.get('filename', '')
        
        if not file_data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No file data provided'})
            }
        
        # Decode base64 file
        file_bytes = base64.b64decode(file_data.split(',')[-1])
        
        # Try to parse as CSV first (simpler approach)
        try:
            # Try different encodings
            content = None
            for encoding in ['utf-8', 'cp1251', 'windows-1251']:
                try:
                    content = file_bytes.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if not content:
                content = file_bytes.decode('utf-8', errors='ignore')
            
            # Parse CSV
            csv_reader = csv.DictReader(StringIO(content), delimiter='\t')
            rows = list(csv_reader)
            
        except Exception:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Could not parse file. Please ensure it\'s a valid Excel/CSV file.'})
            }
        
        # Process products based on your column structure
        products = []
        categories = set()
        
        for idx, row in enumerate(rows):
            if not row or not any(row.values()):
                continue
                
            # Map your specific columns
            article = clean_text(row.get('Артикул', ''))
            brand = clean_text(row.get('Бренд', ''))
            name = clean_text(row.get('Наименование ', '') or row.get('Наименование', ''))
            unit = clean_text(row.get('Ед. (единицы измерения)', ''))
            recommended_price = parse_price(row.get('Цена (Рекомендуемая)', 0))
            dealer_price = parse_price(row.get('Цена дилер (по которой идет рассчет)', 0))
            special_offer = clean_text(row.get('Акция!!!', ''))
            discount_percent = clean_text(row.get('% скидки', ''))
            special_price = parse_price(row.get('Специальная цена!!!', ''))
            package = clean_text(row.get('Упаковка (сколько единиц товара в большой коробке/средней коробки/малой коробки)', ''))
            barcode = clean_text(row.get('Штрих-код', ''))
            photo = clean_text(row.get('Фото', ''))
            
            if not name:
                continue
            
            # Determine final price logic
            has_special_pricing = bool(
                (special_offer and special_offer not in ['', 'Новинка!!!']) or
                discount_percent or
                special_price > 0
            )
            
            # Calculate prices
            if special_price > 0:
                final_price = special_price
                base_price = dealer_price or recommended_price
            elif special_offer and special_offer not in ['', 'Новинка!!!']:
                final_price = parse_price(special_offer)
                base_price = dealer_price or recommended_price
            elif discount_percent:
                discount_val = parse_price(discount_percent)
                if discount_val > 0:
                    if discount_val > 100:  # Assume it's a price, not percentage
                        final_price = discount_val
                    else:  # It's a percentage
                        base = dealer_price or recommended_price
                        final_price = base * (1 - discount_val / 100)
                    base_price = dealer_price or recommended_price
                else:
                    final_price = dealer_price or recommended_price
                    base_price = final_price
            else:
                final_price = dealer_price or recommended_price
                base_price = final_price
            
            # Determine category from brand
            category = brand if brand else 'Канцтовары'
            categories.add(category)
            
            # Process image
            image_url = process_image_path(photo)
            
            product = {
                'id': f"item_{idx}",
                'name': name,
                'article': article,
                'brand': brand,
                'category': category,
                'price': round(final_price, 2),
                'basePrice': round(base_price, 2),
                'recommendedPrice': round(recommended_price, 2),
                'unit': unit,
                'package': package,
                'barcode': barcode,
                'image': image_url,
                'inStock': True,
                'hasSpecialPricing': has_special_pricing,
                'specialOffer': special_offer,
                'discountPercent': discount_percent,
                'specialPrice': special_price if special_price > 0 else None,
                'description': f"{brand} {name}".strip()
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
            'body': json.dumps(result, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка обработки файла: {str(e)}',
                'request_id': context.request_id
            }, ensure_ascii=False)
        }

def clean_text(value) -> str:
    """Clean text value"""
    if not value or str(value).strip() in ['nan', 'None', '']:
        return ''
    return str(value).strip()

def parse_price(price_value) -> float:
    """Parse price from various formats"""
    if not price_value or str(price_value).strip() in ['', 'nan', 'None']:
        return 0.0
    
    price_str = str(price_value).strip()
    # Remove currency symbols and spaces
    price_str = re.sub(r'[₽$€\s,]', '', price_str)
    # Replace comma with dot for decimal
    price_str = price_str.replace(',', '.')
    
    try:
        return float(price_str)
    except (ValueError, TypeError):
        return 0.0

def process_image_path(photo_path: str) -> str:
    """Process image path from Excel"""
    if not photo_path or photo_path.strip() == '':
        return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'
    
    photo_path = photo_path.strip()
    
    # If it's already a URL, return as is
    if photo_path.startswith(('http://', 'https://')):
        return photo_path
    
    # If it's a relative path, make it absolute
    if photo_path.startswith('/'):
        return photo_path
    
    # If it's just a filename, assume it's in images folder
    if '.' in photo_path:
        return f'/images/{photo_path}'
    
    # Default fallback
    return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'