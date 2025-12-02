"""
Script to create sample products in production database
Run this with: flyctl ssh console -C "python create_sample_products.py"
"""
import django
import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, ProductCategory
from users.models import User

def create_sample_products():
    # Get or create supplier
    supplier = User.objects.filter(user_type='supplier').first()
    
    if not supplier:
        print("No supplier found! Creating a test supplier...")
        supplier = User.objects.create_user(
            email='supplier@chainsync.com',
            password='123456',
            user_type='supplier',
            is_verified=True
        )
        print(f"Created supplier: {supplier.email}")
    else:
        print(f"Using existing supplier: {supplier.email}")
    
    # Get or create category
    category, created = ProductCategory.objects.get_or_create(
        name='Groceries',
        defaults={'description': 'Daily grocery items'}
    )
    
    # Sample products to create
    products_data = [
        {'name': 'Rice - Miniket 1kg', 'price': 65, 'stock': 500, 'sku': 'RICE-001'},
        {'name': 'Milk - Aarong 500ml', 'price': 55, 'stock': 200, 'sku': 'MILK-001'},
        {'name': 'Bread - 400g', 'price': 40, 'stock': 150, 'sku': 'BREAD-001'},
        {'name': 'Coca Cola 250ml', 'price': 30, 'stock': 300, 'sku': 'COKE-001'},
        {'name': 'Sugar - 1kg', 'price': 70, 'stock': 250, 'sku': 'SUGAR-001'},
        {'name': 'Eggs - 12 pcs', 'price': 120, 'stock': 180, 'sku': 'EGGS-001'},
        {'name': 'Potato - 1kg', 'price': 35, 'stock': 400, 'sku': 'POTATO-001'},
        {'name': 'Onion - 1kg', 'price': 45, 'stock': 350, 'sku': 'ONION-001'},
        {'name': 'Tomato - 1kg', 'price': 50, 'stock': 200, 'sku': 'TOMATO-001'},
        {'name': 'Cooking Oil - 1L', 'price': 180, 'stock': 150, 'sku': 'OIL-001'},
    ]
    
    created_count = 0
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults={
                'supplier': supplier,
                'name': product_data['name'],
                'description': f"High quality {product_data['name']}",
                'category': category,
                'price': product_data['price'],
                'stock_quantity': product_data['stock'],
                'minimum_order_quantity': 1,
                'unit': 'piece',
                'status': 'active'
            }
        )
        if created:
            created_count += 1
            print(f"✓ Created: {product.name} (ID: {product.id})")
        else:
            print(f"- Exists: {product.name} (ID: {product.id})")
    
    print(f"\n{'='*50}")
    print(f"Summary: Created {created_count} new products")
    print(f"Total products in database: {Product.objects.count()}")
    print(f"{'='*50}")

if __name__ == '__main__':
    create_sample_products()
