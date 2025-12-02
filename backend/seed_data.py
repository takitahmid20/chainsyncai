"""
Seed script to populate database with realistic data for AI/ML features
Run: python manage.py shell < seed_data.py
"""

import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chainsync.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import ProductCategory, Product, ProductImage
from orders.models import Order, OrderItem, Cart, CartItem
from inventory.models import InventoryLog
from retailers.models import RetailerProfile
from suppliers.models import SupplierProfile

User = get_user_model()

print("\n" + "="*70)
print("🌱 SEEDING DATABASE WITH REALISTIC DATA FOR AI/ML")
print("="*70)

# ============================================================================
# CONFIGURATION
# ============================================================================

NUM_SUPPLIERS = 15  # Additional suppliers
NUM_RETAILERS = 20  # Additional retailers
PRODUCTS_PER_SUPPLIER = 30  # Products per supplier
ORDERS_PER_RETAILER = 50  # Historical orders per retailer

# Product data templates
PRODUCT_TEMPLATES = {
    'Food & Beverage': [
        {'name': 'Premium Basmati Rice', 'unit': 'kg', 'base_price': 850, 'brand': 'Premium Gold'},
        {'name': 'Sunflower Oil', 'unit': 'liter', 'base_price': 180, 'brand': 'Golden Sun'},
        {'name': 'Whole Wheat Flour', 'unit': 'kg', 'base_price': 65, 'brand': 'Fresh Mill'},
        {'name': 'Red Lentils', 'unit': 'kg', 'base_price': 120, 'brand': 'Organic Valley'},
        {'name': 'Sugar', 'unit': 'kg', 'base_price': 75, 'brand': 'Sweet Crystal'},
        {'name': 'Salt', 'unit': 'kg', 'base_price': 25, 'brand': 'Pure White'},
        {'name': 'Black Pepper', 'unit': 'kg', 'base_price': 450, 'brand': 'Spice King'},
        {'name': 'Turmeric Powder', 'unit': 'kg', 'base_price': 280, 'brand': 'Golden Spice'},
        {'name': 'Tea Bags', 'unit': 'box', 'base_price': 350, 'brand': 'Premium Blend'},
        {'name': 'Coffee Powder', 'unit': 'kg', 'base_price': 750, 'brand': 'Rich Aroma'},
        {'name': 'Biscuits', 'unit': 'pack', 'base_price': 45, 'brand': 'Crispy Delight'},
        {'name': 'Chocolate Bar', 'unit': 'piece', 'base_price': 85, 'brand': 'Cocoa Dream'},
        {'name': 'Instant Noodles', 'unit': 'pack', 'base_price': 35, 'brand': 'Quick Meal'},
        {'name': 'Tomato Ketchup', 'unit': 'bottle', 'base_price': 120, 'brand': 'Red Flavor'},
        {'name': 'Soy Sauce', 'unit': 'bottle', 'base_price': 95, 'brand': 'Asian Taste'},
    ],
    'Electronics': [
        {'name': 'LED Bulb 9W', 'unit': 'piece', 'base_price': 250, 'brand': 'BrightLight'},
        {'name': 'USB Cable Type-C', 'unit': 'piece', 'base_price': 180, 'brand': 'TechConnect'},
        {'name': 'Power Bank 10000mAh', 'unit': 'piece', 'base_price': 1200, 'brand': 'PowerPlus'},
        {'name': 'Bluetooth Speaker', 'unit': 'piece', 'base_price': 1850, 'brand': 'SoundWave'},
        {'name': 'Phone Case', 'unit': 'piece', 'base_price': 350, 'brand': 'SafeGuard'},
        {'name': 'Screen Protector', 'unit': 'piece', 'base_price': 250, 'brand': 'ClearView'},
        {'name': 'Earphones', 'unit': 'piece', 'base_price': 450, 'brand': 'AudioMax'},
        {'name': 'Memory Card 64GB', 'unit': 'piece', 'base_price': 850, 'brand': 'DataStore'},
        {'name': 'USB Flash Drive 32GB', 'unit': 'piece', 'base_price': 550, 'brand': 'QuickDrive'},
        {'name': 'Mobile Stand', 'unit': 'piece', 'base_price': 180, 'brand': 'StandPro'},
    ],
    'Pharmacy': [
        {'name': 'Paracetamol 500mg', 'unit': 'pack', 'base_price': 8, 'brand': 'MediCare'},
        {'name': 'Vitamin C Tablets', 'unit': 'bottle', 'base_price': 280, 'brand': 'HealthPlus'},
        {'name': 'Hand Sanitizer 500ml', 'unit': 'bottle', 'base_price': 180, 'brand': 'GermFree'},
        {'name': 'Face Mask (Pack of 50)', 'unit': 'box', 'base_price': 450, 'brand': 'SafeMask'},
        {'name': 'Antiseptic Cream', 'unit': 'tube', 'base_price': 95, 'brand': 'HealFast'},
        {'name': 'Bandage Roll', 'unit': 'piece', 'base_price': 35, 'brand': 'FirstAid'},
        {'name': 'Cotton Wool', 'unit': 'pack', 'base_price': 65, 'brand': 'SoftCare'},
        {'name': 'Thermometer Digital', 'unit': 'piece', 'base_price': 350, 'brand': 'TempCheck'},
        {'name': 'Pain Relief Spray', 'unit': 'bottle', 'base_price': 280, 'brand': 'QuickRelief'},
        {'name': 'Calcium Tablets', 'unit': 'bottle', 'base_price': 320, 'brand': 'BoneStrong'},
    ],
    'Grocery': [
        {'name': 'Potato', 'unit': 'kg', 'base_price': 35, 'brand': 'Fresh Farm'},
        {'name': 'Onion', 'unit': 'kg', 'base_price': 45, 'brand': 'Fresh Farm'},
        {'name': 'Tomato', 'unit': 'kg', 'base_price': 55, 'brand': 'Fresh Farm'},
        {'name': 'Carrot', 'unit': 'kg', 'base_price': 65, 'brand': 'Fresh Farm'},
        {'name': 'Cucumber', 'unit': 'kg', 'base_price': 40, 'brand': 'Fresh Farm'},
        {'name': 'Eggs (Dozen)', 'unit': 'dozen', 'base_price': 145, 'brand': 'Farm Fresh'},
        {'name': 'Milk 1L', 'unit': 'liter', 'base_price': 85, 'brand': 'Pure Dairy'},
        {'name': 'Bread', 'unit': 'piece', 'base_price': 45, 'brand': 'Daily Bread'},
        {'name': 'Butter', 'unit': 'pack', 'base_price': 280, 'brand': 'Creamy Gold'},
        {'name': 'Cheese Slice', 'unit': 'pack', 'base_price': 320, 'brand': 'Tasty Cheese'},
    ],
    'Personal Care': [
        {'name': 'Shampoo 400ml', 'unit': 'bottle', 'base_price': 380, 'brand': 'SilkyHair'},
        {'name': 'Soap Bar', 'unit': 'piece', 'base_price': 45, 'brand': 'FreshClean'},
        {'name': 'Toothpaste', 'unit': 'tube', 'base_price': 120, 'brand': 'WhiteSmile'},
        {'name': 'Toothbrush', 'unit': 'piece', 'base_price': 65, 'brand': 'DentalCare'},
        {'name': 'Body Lotion', 'unit': 'bottle', 'base_price': 280, 'brand': 'SoftSkin'},
        {'name': 'Face Wash', 'unit': 'tube', 'base_price': 250, 'brand': 'GlowFace'},
        {'name': 'Deodorant', 'unit': 'bottle', 'base_price': 220, 'brand': 'FreshScent'},
        {'name': 'Hair Oil', 'unit': 'bottle', 'base_price': 180, 'brand': 'StrongRoots'},
        {'name': 'Razor', 'unit': 'piece', 'base_price': 85, 'brand': 'SmoothShave'},
        {'name': 'Tissue Paper', 'unit': 'pack', 'base_price': 95, 'brand': 'SoftTouch'},
    ],
    'Household': [
        {'name': 'Laundry Detergent 1kg', 'unit': 'kg', 'base_price': 250, 'brand': 'CleanWash'},
        {'name': 'Dish Soap', 'unit': 'bottle', 'base_price': 120, 'brand': 'SparkleClean'},
        {'name': 'Floor Cleaner', 'unit': 'bottle', 'base_price': 180, 'brand': 'ShineFloor'},
        {'name': 'Toilet Cleaner', 'unit': 'bottle', 'base_price': 150, 'brand': 'FreshToilet'},
        {'name': 'Garbage Bags (Pack of 30)', 'unit': 'pack', 'base_price': 180, 'brand': 'StrongBag'},
        {'name': 'Napkins (Pack of 100)', 'unit': 'pack', 'base_price': 95, 'brand': 'SoftNapkin'},
        {'name': 'Air Freshener', 'unit': 'bottle', 'base_price': 220, 'brand': 'FreshAir'},
        {'name': 'Mosquito Coil', 'unit': 'pack', 'base_price': 85, 'brand': 'BugAway'},
        {'name': 'Candles (Pack of 10)', 'unit': 'pack', 'base_price': 150, 'brand': 'BrightLight'},
        {'name': 'Match Box', 'unit': 'box', 'base_price': 15, 'brand': 'QuickLight'},
    ],
}

BUSINESS_NAMES = [
    'ABC Wholesale Distributors', 'Prime Supply Co.', 'Metro Trading House',
    'Golden Gate Suppliers', 'Swift Commerce Ltd.', 'Elite Distribution Network',
    'Eastern Traders', 'Western Supply Chain', 'Northern Wholesale Hub',
    'Southern Distribution Co.', 'Central Market Suppliers', 'Diamond Trading',
    'Pearl Wholesale', 'Crown Distributors', 'Royal Supply Solutions',
]

RETAILER_NAMES = [
    'Quick Mart', 'Super Store', 'Daily Needs Shop', 'Fresh Bazaar',
    'City Center Store', 'Corner Shop', 'Village Mart', 'Express Store',
    'Smart Shop', 'Mega Retail', 'Prime Shop', 'Local Bazaar',
    'Downtown Store', 'Uptown Mart', 'Midtown Shop', 'East End Store',
    'West Side Mart', 'North Plaza Shop', 'South Market', 'Central Bazaar',
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def random_phone():
    return f"017{random.randint(10000000, 99999999)}"

def random_address():
    areas = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']
    streets = ['Road', 'Street', 'Avenue', 'Lane', 'Plaza', 'Market']
    return f"{random.randint(1, 200)} {random.choice(streets)}, {random.choice(areas)} {random.randint(1000, 9999)}"

def random_date_between(start_days_ago, end_days_ago):
    """Generate random datetime between start_days_ago and end_days_ago from now"""
    end = datetime.now() - timedelta(days=end_days_ago)
    start = datetime.now() - timedelta(days=start_days_ago)
    time_delta = start - end
    random_days = random.random() * time_delta.total_seconds()
    return end + timedelta(seconds=random_days)

def weighted_choice(choices, weights):
    """Choose from choices with given weights"""
    return random.choices(choices, weights=weights, k=1)[0]

# ============================================================================
# CREATE SUPPLIERS
# ============================================================================

print("\n📦 Creating Suppliers...")
suppliers = []

# Get existing suppliers with profiles
existing_suppliers = User.objects.filter(user_type='supplier').exclude(supplier_profile__isnull=True)
suppliers.extend(list(existing_suppliers))

for i in range(NUM_SUPPLIERS):
    email = f"supplier{i+10}@chainsync.com"
    
    # Skip if exists
    if User.objects.filter(email=email).exists():
        continue
    
    user = User.objects.create_user(
        email=email,
        password='123456',
        user_type='supplier',
        is_verified=True
    )
    
    SupplierProfile.objects.create(
        user=user,
        business_name=BUSINESS_NAMES[i % len(BUSINESS_NAMES)] + f" #{i+1}",
        supplier_type=random.choice(['wholesaler', 'distributor', 'manufacturer']),
        business_address=random_address(),
        main_product_category=random.choice(['Food & Beverage', 'Electronics', 'Pharmacy', 'Grocery', 'Personal Care', 'Household']),
        is_profile_complete=True
    )
    
    suppliers.append(user)
    print(f"  ✅ Created: {email}")

print(f"✅ Total Suppliers: {len(suppliers)}")

# ============================================================================
# CREATE RETAILERS
# ============================================================================

print("\n🏪 Creating Retailers...")
retailers = []

# Get existing retailers with profiles
existing_retailers = User.objects.filter(user_type='retailer').exclude(retailer_profile__isnull=True)
retailers.extend(list(existing_retailers))

for i in range(NUM_RETAILERS):
    email = f"retailer{i+10}@chainsync.com"
    
    # Skip if exists
    if User.objects.filter(email=email).exists():
        continue
    
    user = User.objects.create_user(
        email=email,
        password='123456',
        user_type='retailer',
        is_verified=True
    )
    
    RetailerProfile.objects.create(
        user=user,
        shop_name=RETAILER_NAMES[i % len(RETAILER_NAMES)] + f" #{i+1}",
        owner_name=f"Owner {i+1}",
        shop_address=random_address(),
        business_category=random.choice(['grocery', 'pharmacy', 'cosmetics', 'electronics', 'general_store', 'online']),
        is_profile_complete=True
    )
    
    retailers.append(user)
    print(f"  ✅ Created: {email}")

print(f"✅ Total Retailers: {len(retailers)}")

# ============================================================================
# CREATE PRODUCTS FOR EACH SUPPLIER
# ============================================================================

print("\n📦 Creating Products...")
all_products = []

categories = list(ProductCategory.objects.all())

for supplier in suppliers:
    supplier_products = []
    
    # Each supplier gets products from 2-4 random categories
    supplier_categories = random.sample(categories, k=random.randint(2, min(4, len(categories))))
    
    products_created = 0
    for category in supplier_categories:
        if category.name not in PRODUCT_TEMPLATES:
            continue
            
        templates = PRODUCT_TEMPLATES[category.name]
        num_products = PRODUCTS_PER_SUPPLIER // len(supplier_categories)
        
        for _ in range(num_products):
            template = random.choice(templates)
            
            # Add variation to product name
            variation = random.choice(['Premium', 'Standard', 'Economy', 'Deluxe', 'Super'])
            product_name = f"{variation} {template['name']}"
            
            # Price variation (±20%)
            price_variation = random.uniform(0.8, 1.2)
            base_price = template['base_price'] * price_variation
            
            # Discount (30% chance)
            discount_price = None
            if random.random() < 0.3:
                discount_price = base_price * random.uniform(0.85, 0.95)
            
            # Stock quantity - varied distribution
            stock_weights = [0.1, 0.2, 0.4, 0.2, 0.1]  # Low, medium-low, medium, medium-high, high
            stock_ranges = [(0, 50), (50, 150), (150, 500), (500, 1000), (1000, 5000)]
            stock_range = weighted_choice(stock_ranges, stock_weights)
            stock = random.randint(*stock_range)
            
            # Status based on stock
            if stock == 0:
                status = 'out_of_stock'
            elif random.random() < 0.9:
                status = 'active'
            else:
                status = 'inactive'
            
            # Minimum order quantity
            moq = random.choice([1, 5, 10, 20, 50])
            
            product = Product.objects.create(
                supplier=supplier,
                category=category,
                name=product_name,
                description=f"High quality {template['name']} from {supplier.supplier_profile.business_name}",
                price=Decimal(str(round(base_price, 2))),
                discount_price=Decimal(str(round(discount_price, 2))) if discount_price else None,
                unit=template['unit'],
                stock_quantity=stock,
                minimum_order_quantity=moq,
                brand=template['brand'],
                status=status,
                is_featured=random.random() < 0.15,  # 15% featured
            )
            
            supplier_products.append(product)
            all_products.append(product)
            products_created += 1
    
    print(f"  ✅ Supplier {supplier.email}: {products_created} products")

print(f"✅ Total Products Created: {len(all_products)}")

# ============================================================================
# CREATE HISTORICAL ORDERS (for AI/ML training)
# ============================================================================

print("\n📊 Creating Historical Orders...")

ORDER_STATUSES = ['pending', 'accepted', 'processing', 'on_the_way', 'delivered', 'cancelled']
STATUS_WEIGHTS = [0.05, 0.05, 0.05, 0.10, 0.70, 0.05]  # Most orders delivered

total_orders = 0

for retailer in retailers:
    retailer_orders = []
    
    # Create historical orders over past 180 days
    for _ in range(ORDERS_PER_RETAILER):
        # Pick random supplier
        supplier = random.choice(suppliers)
        
        # Get supplier's products
        supplier_products = list(Product.objects.filter(supplier=supplier, status='active'))
        if not supplier_products:
            continue
        
        # Order creation date (random in past 180 days)
        created_at = random_date_between(180, 0)
        
        # Pick 1-8 products for this order
        num_items = random.randint(1, 8)
        order_products = random.sample(supplier_products, k=min(num_items, len(supplier_products)))
        
        # Calculate order totals
        subtotal = Decimal('0.00')
        order_items_data = []
        
        for product in order_products:
            quantity = random.randint(product.minimum_order_quantity, product.minimum_order_quantity * 10)
            price = product.discount_price if product.discount_price else product.price
            item_subtotal = price * quantity
            subtotal += item_subtotal
            
            order_items_data.append({
                'product': product,
                'quantity': quantity,
                'price': price,
                'subtotal': item_subtotal
            })
        
        # Random tax and delivery fee
        tax = subtotal * Decimal('0.05')  # 5% tax
        delivery_fee = Decimal(str(random.choice([0, 50, 100, 150])))
        total = subtotal + tax + delivery_fee
        
        # Order status (weighted)
        status = weighted_choice(ORDER_STATUSES, STATUS_WEIGHTS)
        
        # Create order
        order = Order.objects.create(
            retailer=retailer,
            supplier=supplier,
            status=status,
            subtotal=subtotal,
            tax=tax,
            delivery_fee=delivery_fee,
            total_amount=total,
            delivery_address=retailer.retailer_profile.shop_address,
            delivery_contact=random_phone(),
            delivery_notes=f"Order #{random.randint(1000, 9999)}"
        )
        
        # Override created_at
        order.created_at = created_at
        
        # Set timestamps based on status
        if status in ['accepted', 'processing', 'on_the_way', 'delivered']:
            order.accepted_at = created_at + timedelta(hours=random.randint(1, 24))
        
        if status == 'delivered':
            order.delivered_at = created_at + timedelta(days=random.randint(2, 7))
        
        order.save()
        
        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                product_name=item_data['product'].name,
                product_price=item_data['price'],
                quantity=item_data['quantity'],
                subtotal=item_data['subtotal']
            )
        
        # Create inventory logs for delivered orders
        if status == 'delivered':
            for item_data in order_items_data:
                InventoryLog.objects.create(
                    product=item_data['product'],
                    change_type='order_placed',
                    quantity_change=-item_data['quantity'],
                    reason=f"Order {order.order_number}",
                    performed_by=supplier
                )
        
        retailer_orders.append(order)
        total_orders += 1
    
    print(f"  ✅ Retailer {retailer.email}: {len(retailer_orders)} orders")

print(f"✅ Total Orders Created: {total_orders}")

# ============================================================================
# SUMMARY STATISTICS
# ============================================================================

print("\n" + "="*70)
print("📊 DATABASE SEEDING COMPLETE - SUMMARY")
print("="*70)

print(f"\n👥 Users:")
print(f"   Suppliers: {User.objects.filter(user_type='supplier').count()}")
print(f"   Retailers: {User.objects.filter(user_type='retailer').count()}")

print(f"\n📦 Products:")
print(f"   Total Products: {Product.objects.count()}")
print(f"   Active: {Product.objects.filter(status='active').count()}")
print(f"   Out of Stock: {Product.objects.filter(status='out_of_stock').count()}")
print(f"   Low Stock (<100): {Product.objects.filter(stock_quantity__lt=100).count()}")
print(f"   High Stock (>1000): {Product.objects.filter(stock_quantity__gt=1000).count()}")

print(f"\n📋 Orders:")
print(f"   Total Orders: {Order.objects.count()}")
for status_choice in ORDER_STATUSES:
    count = Order.objects.filter(status=status_choice).count()
    print(f"   {status_choice.title()}: {count}")

print(f"\n💰 Order Value:")
total_revenue = Order.objects.filter(status='delivered').aggregate(
    total=django.db.models.Sum('total_amount')
)['total'] or Decimal('0.00')
print(f"   Total Revenue (Delivered): ৳{total_revenue:,.2f}")

avg_order = Order.objects.aggregate(
    avg=django.db.models.Avg('total_amount')
)['avg'] or Decimal('0.00')
print(f"   Average Order Value: ৳{avg_order:,.2f}")

print(f"\n📊 Inventory Logs: {InventoryLog.objects.count()}")

print("\n" + "="*70)
print("✅ Data is ready for AI/ML Features:")
print("   • Demand Forecasting")
print("   • Auto-Reorder Recommendations")
print("   • Product Recommendations")
print("   • Sales Trend Analysis")
print("   • Inventory Optimization")
print("="*70 + "\n")
