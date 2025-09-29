import json
import base64
from typing import Dict, Any, List, Optional
import pandas as pd
from io import BytesIO
import re

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Парсит Excel файлы с каталогом канцтоваров и возвращает структурированные данные
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
        
        # Read Excel file
        df = pd.read_excel(BytesIO(file_bytes))
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Map common column variations to standard names
        column_mapping = {
            'наименование': 'name',
            'название': 'name', 
            'товар': 'name',
            'продукт': 'name',
            'цена': 'price',
            'стоимость': 'price',
            'прайс': 'price',
            'категория': 'category',
            'группа': 'category',
            'раздел': 'category',
            'описание': 'description',
            'комментарий': 'description',
            'артикул': 'sku',
            'код': 'sku',
            'остаток': 'stock',
            'количество': 'stock',
            'наличие': 'inStock',
            'в наличии': 'inStock',
            'фото': 'image',
            'изображение': 'image',
            'картинка': 'image'
        }
        
        # Normalize column names
        normalized_columns = {}
        for col in df.columns:
            col_lower = col.lower().strip()
            for key, value in column_mapping.items():
                if key in col_lower:
                    normalized_columns[col] = value
                    break
            else:
                normalized_columns[col] = col_lower.replace(' ', '_')
        
        df = df.rename(columns=normalized_columns)
        
        # Process products
        products = []
        for idx, row in df.iterrows():
            # Skip empty rows
            if row.isna().all():
                continue
                
            product = {
                'id': f"excel_{idx}",
                'name': str(row.get('name', f'Товар {idx+1}')).strip(),
                'price': parse_price(row.get('price', 0)),
                'category': str(row.get('category', 'Без категории')).strip(),
                'description': str(row.get('description', '')).strip(),
                'sku': str(row.get('sku', '')).strip(),
                'inStock': parse_stock_status(row.get('inStock', row.get('stock', True))),
                'stock': parse_stock_quantity(row.get('stock', 0)),
                'image': parse_image_url(row.get('image', ''))
            }
            
            # Add extra fields from Excel
            extra_fields = {}
            for col, value in row.items():
                if col not in ['name', 'price', 'category', 'description', 'sku', 'inStock', 'stock', 'image']:
                    if pd.notna(value) and str(value).strip():
                        extra_fields[col] = str(value).strip()
            
            if extra_fields:
                product['extra_fields'] = extra_fields
            
            products.append(product)
        
        # Get categories for filtering
        categories = sorted(list(set([p['category'] for p in products if p['category']])))
        
        result = {
            'products': products,
            'categories': categories,
            'total_products': len(products),
            'filename': filename,
            'columns_found': list(df.columns),
            'processed_at': context.request_id
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
                'error': f'Error parsing Excel file: {str(e)}',
                'request_id': context.request_id
            })
        }

def parse_price(price_value) -> float:
    """Parse price from various formats"""
    if pd.isna(price_value):
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

def parse_stock_status(stock_value) -> bool:
    """Parse stock availability from various formats"""
    if pd.isna(stock_value):
        return True
    
    stock_str = str(stock_value).lower().strip()
    
    # Check for negative indicators
    negative_indicators = ['нет', 'отсутствует', 'недоступно', 'закончился', 'false', '0', 'no', 'out']
    if any(indicator in stock_str for indicator in negative_indicators):
        return False
    
    # Check for positive indicators
    positive_indicators = ['да', 'есть', 'в наличии', 'доступно', 'true', 'yes', 'available']
    if any(indicator in stock_str for indicator in positive_indicators):
        return True
    
    # Try to parse as number
    try:
        num = float(stock_str.replace(',', '.'))
        return num > 0
    except (ValueError, TypeError):
        return True

def parse_stock_quantity(stock_value) -> int:
    """Parse stock quantity from various formats"""
    if pd.isna(stock_value):
        return 999
    
    stock_str = str(stock_value).strip()
    # Extract numbers
    numbers = re.findall(r'\d+', stock_str)
    
    if numbers:
        return int(numbers[0])
    
    return 999

def parse_image_url(image_value) -> str:
    """Parse image URL or return placeholder"""
    if pd.isna(image_value):
        return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'
    
    image_str = str(image_value).strip()
    
    # Check if it's a valid URL
    if image_str.startswith(('http://', 'https://', '/')) and len(image_str) > 4:
        return image_str
    
    # If it's a filename, try to construct URL
    if '.' in image_str and len(image_str) > 3:
        return f'/images/{image_str}'
    
    return '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg'