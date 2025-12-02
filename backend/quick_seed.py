"""
Quick seed script - creates sample data for AI/ML testing
Run: python manage.py shell < quick_seed.py
"""
import os, django, random
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chainsync.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import ProductCategory, Product
from orders.models import Order, OrderItem
from inventory.models import InventoryLog

User = get_user_model()

print("\n🌱 Quick Seeding Database...")

# Get existing users
suppliers = list(User.objects.filter(user_type='supplier').exclude(supplier_profile__isnull=True))
retailers = list(User.objects.filter(user_type='retailer').exclude(retailer_profile__isnull=True))

print(f"Found {len(suppliers)} suppliers and {len(retailers)} retailers")

# Product templates
TEMPLATES = {
    'Food & Beverage': [
        ('Premium Rice', 'kg', 850), ('Sunflower Oil', 'liter', 180), ('Wheat Flour', 'kg', 65),
        ('Lentils', 'kg', 120), ('Sugar', 'kg', 75), ('Salt', 'kg', 25), ('Tea', 'box', 350),
    ],
    'Electronics': [
        ('LED Bulb', 'piece', 250), ('USB Cable', 'piece', 180), ('Power Bank', 'piece', 1200),
        ('Speaker', 'piece', 1850), ('Phone Case', 'piece', 350),
    ],
    'Pharmacy': [
        ('Paracetamol', 'pack', 8), ('Vitamin C', 'bottle', 280), ('Sanitizer', 'bottle', 180),
        ('Face Mask', 'box', 450), ('Bandage', 'piece', 35),
    ],
    'Grocery': [
        ('Potato', 'kg', 35), ('Onion', 'kg', 45), ('Tomato', 'kg', 55),
        ('Eggs', 'dozen', 145), ('Milk', 'liter', 85),
    ],
}

categories = {cat.name: cat for cat in ProductCategory.objects.all()}

# Create products
print("\n📦 Creating products...")
all_products = []

for supplier in suppliers[:5]:  # Use first 5 suppliers
    for cat_name, templates in TEMPLATES.items():
        if cat_name not in categories:
            continue
        
        for name, unit, price in templates:
            stock = random.choice([10, 50, 100, 250, 500, 1000, 2000])
            status = 'out_of_stock' if stock == 0 else 'active'
            discount = price * 0.9 if random.random() < 0.3 else None
            
            product = Product.objects.create(
                supplier=supplier,
                category=categories[cat_name],
                name=f"{name} - {supplier.supplier_profile.business_name[:20]}",
                description=f"Quality {name}",
                price=Decimal(str(price)),
                discount_price=Decimal(str(round(discount, 2))) if discount else None,
                unit=unit,
                stock_quantity=stock,
                minimum_order_quantity=random.choice([1, 5, 10]),
                brand=random.choice(['BrandA', 'BrandB', 'BrandC']),
                status=status,
                is_featured=random.random() < 0.2,
            )
            all_products.append(product)

print(f"Created {len(all_products)} products")

# Create historical orders
print("\n📋 Creating orders...")
statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'pending']

total_orders = 0
for retailer in retailers[:10]:  # First 10 retailers
    for _ in range(30):  # 30 orders each
        supplier = random.choice(suppliers)
        supplier_products = [p for p in all_products if p.supplier == supplier and p.status == 'active']
        
        if not supplier_products:
            continue
        
        # Pick 1-5 products
        order_products = random.sample(supplier_products, k=min(random.randint(1, 5), len(supplier_products)))
        
        subtotal = Decimal('0')
        items_data = []
        
        for product in order_products:
            qty = random.randint(product.minimum_order_quantity, product.minimum_order_quantity * 5)
            price = product.discount_price or product.price
            item_total = price * qty
            subtotal += item_total
            items_data.append({'product': product, 'qty': qty, 'price': price, 'total': item_total})
        
        tax = subtotal * Decimal('0.05')
        delivery = Decimal(str(random.choice([0, 50, 100])))
        total = subtotal + tax + delivery
        
        status = random.choice(statuses)
        created = timezone.now() - timedelta(days=random.randint(1, 180))
        
        order = Order.objects.create(
            retailer=retailer,
            supplier=supplier,
            status=status,
            subtotal=subtotal,
            tax=tax,
            delivery_fee=delivery,
            total_amount=total,
            delivery_address=retailer.retailer_profile.shop_address,
            delivery_contact=f"017{random.randint(10000000, 99999999)}",
        )
        order.created_at = created
        
        if status in ['accepted', 'processing', 'on_the_way', 'delivered']:
            order.accepted_at = created + timedelta(hours=random.randint(1, 24))
        if status == 'delivered':
            order.delivered_at = created + timedelta(days=random.randint(2, 7))
        
        order.save()
        
        # Create order items
        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                product_name=item['product'].name,
                product_price=item['price'],
                quantity=item['qty'],
                subtotal=item['total']
            )
        
        total_orders += 1

print(f"Created {total_orders} orders")

# Summary
print("\n" + "="*60)
print("📊 SUMMARY")
print("="*60)
print(f"Products: {Product.objects.count()}")
print(f"Active: {Product.objects.filter(status='active').count()}")
print(f"Orders: {Order.objects.count()}")
print(f"Delivered: {Order.objects.filter(status='delivered').count()}")
print(f"Cancelled: {Order.objects.filter(status='cancelled').count()}")
print("="*60)
print("✅ Seeding Complete!\n")
