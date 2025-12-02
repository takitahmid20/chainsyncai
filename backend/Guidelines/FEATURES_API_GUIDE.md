# ChainSync API - Complete Feature Documentation

## 🚀 New Features Implemented

### 1. Product & Inventory System ✅
### 2. Retailer Catalog & Browsing ✅  
### 3. Shopping Cart System ✅
### 4. Order Management System ✅

---

## 📦 PRODUCT & INVENTORY SYSTEM

### Supplier - Create Product
**POST** `/api/products/supplier/products/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "name": "Premium Basmati Rice",
    "description": "High quality aged basmati rice",
    "category": 1,
    "price": "850.00",
    "discount_price": "800.00",
    "unit": "kg",
    "stock_quantity": 500,
    "minimum_order_quantity": 5,
    "brand": "Premium Gold",
    "status": "active"
}
```

**Response (201):**
```json
{
    "id": 1,
    "name": "Premium Basmati Rice",
    "slug": "premium-basmati-rice",
    "description": "High quality aged basmati rice",
    "category": 1,
    "category_name": "Food & Beverage",
    "price": "850.00",
    "discount_price": "800.00",
    "discount_percentage": 6,
    "unit": "kg",
    "stock_quantity": 500,
    "minimum_order_quantity": 5,
    "sku": null,
    "brand": "Premium Gold",
    "status": "active",
    "is_featured": false,
    "supplier_name": "XYZ Distributors Ltd.",
    "images": [],
    "is_available": true,
    "created_at": "2025-11-25T05:00:00Z",
    "updated_at": "2025-11-25T05:00:00Z"
}
```

---

### Supplier - List My Products
**GET** `/api/products/supplier/products/`

**Headers:**
```
Authorization: Bearer YOUR_SUPPLIER_ACCESS_TOKEN
```

**Query Parameters:**
- `category` - Filter by category ID
- `status` - Filter by status (active/inactive/out_of_stock)
- `search` - Search in name, description, SKU
- `ordering` - Sort by: created_at, price, stock_quantity

**Example:**
```
GET /api/products/supplier/products/?status=active&ordering=-created_at
```

---

### Supplier - Update Product
**PUT** `/api/products/supplier/products/1/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body (can update any field):**
```json
{
    "price": "900.00",
    "stock_quantity": 450,
    "status": "active"
}
```

---

### Supplier - Upload Product Image
**POST** `/api/products/supplier/products/1/images/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `image` - Image file
- `is_primary` - "true" or "false"

**Example (curl):**
```bash
curl -X POST http://127.0.0.1:8000/api/products/supplier/products/1/images/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "is_primary=true"
```

---

### Supplier - Delete Product
**DELETE** `/api/products/supplier/products/1/`

---

## 🛒 RETAILER - BROWSE PRODUCTS

### List All Available Products
**GET** `/api/products/retailer/products/`

**Headers:**
```
Authorization: Bearer YOUR_RETAILER_ACCESS_TOKEN
```

**Query Parameters:**
- `category` - Filter by category ID
- `supplier` - Filter by supplier ID
- `search` - Search in name, description, brand
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `category_slug` - Filter by category slug
- `ordering` - Sort by: created_at, price, name

**Example:**
```
GET /api/products/retailer/products/?category=1&min_price=500&max_price=1000&ordering=price
```

**Response (200):**
```json
{
    "count": 25,
    "next": "http://127.0.0.1:8000/api/products/retailer/products/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Premium Basmati Rice",
            "slug": "premium-basmati-rice",
            "category_name": "Food & Beverage",
            "price": "850.00",
            "discount_price": "800.00",
            "discount_percentage": 6,
            "unit": "kg",
            "stock_quantity": 500,
            "status": "active",
            "supplier_name": "XYZ Distributors Ltd.",
            "primary_image": "http://127.0.0.1:8000/media/products/2025/11/rice.jpg",
            "is_featured": false
        }
    ]
}
```

---

### Get Product Details
**GET** `/api/products/retailer/products/premium-basmati-rice/`

**Headers:**
```
Authorization: Bearer YOUR_RETAILER_ACCESS_TOKEN
```

**Response:** Full product details with all images

---

### Get Product Categories
**GET** `/api/products/categories/`

**Response:**
```json
[
    {
        "id": 1,
        "name": "Food & Beverage",
        "slug": "food-beverage",
        "description": "Food and beverage products"
    }
]
```

---

## 🛍️ SHOPPING CART SYSTEM

### Get Cart
**GET** `/api/orders/cart/`

**Headers:**
```
Authorization: Bearer YOUR_RETAILER_ACCESS_TOKEN
```

**Response (200):**
```json
{
    "id": 1,
    "items": [
        {
            "id": 1,
            "product": 1,
            "quantity": 10,
            "subtotal": "8000.00",
            "product_details": {
                "id": 1,
                "name": "Premium Basmati Rice",
                "price": "850.00",
                "discount_price": "800.00",
                "unit": "kg"
            },
            "created_at": "2025-11-25T05:10:00Z"
        }
    ],
    "total_items": 1,
    "total_amount": "8000.00",
    "created_at": "2025-11-25T05:00:00Z",
    "updated_at": "2025-11-25T05:10:00Z"
}
```

---

### Add Item to Cart
**POST** `/api/orders/cart/items/`

**Headers:**
```
Authorization: Bearer YOUR_RETAILER_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "product": 1,
    "quantity": 10
}
```

**Response (201):**
```json
{
    "message": "Item added to cart",
    "cart_item": {
        "id": 1,
        "product": 1,
        "quantity": 10,
        "subtotal": "8000.00",
        "product_details": {...}
    }
}
```

---

### Update Cart Item Quantity
**PUT** `/api/orders/cart/items/1/`

**Body:**
```json
{
    "quantity": 15
}
```

---

### Remove Item from Cart
**DELETE** `/api/orders/cart/items/1/`

---

### Clear Cart
**DELETE** `/api/orders/cart/`

---

## 📋 ORDER MANAGEMENT SYSTEM

### Create Order from Cart
**POST** `/api/orders/`

**Headers:**
```
Authorization: Bearer YOUR_RETAILER_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "supplier_id": 2,
    "delivery_address": "123 Main Street, Dhaka 1000",
    "delivery_contact": "01712345678",
    "delivery_notes": "Please deliver between 9 AM - 5 PM"
}
```

**Response (201):**
```json
{
    "message": "Order placed successfully",
    "order": {
        "id": 1,
        "order_number": "ORD-A1B2C3D4",
        "retailer": 1,
        "retailer_name": "ABC General Store",
        "supplier": 2,
        "supplier_name": "XYZ Distributors Ltd.",
        "status": "pending",
        "subtotal": "8000.00",
        "tax": "0.00",
        "delivery_fee": "0.00",
        "total_amount": "8000.00",
        "delivery_address": "123 Main Street, Dhaka 1000",
        "delivery_contact": "01712345678",
        "delivery_notes": "Please deliver between 9 AM - 5 PM",
        "items": [
            {
                "id": 1,
                "product": 1,
                "product_name": "Premium Basmati Rice",
                "product_price": "800.00",
                "quantity": 10,
                "subtotal": "8000.00"
            }
        ],
        "total_items": 1,
        "total_quantity": 10,
        "created_at": "2025-11-25T05:15:00Z",
        "updated_at": "2025-11-25T05:15:00Z",
        "accepted_at": null,
        "delivered_at": null
    }
}
```

---

### List Orders
**GET** `/api/orders/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `status` - Filter by status (pending/accepted/processing/on_the_way/delivered/cancelled)

**Example:**
```
GET /api/orders/?status=pending
```

**Response:** Shows orders based on user type:
- Retailers see their orders
- Suppliers see orders placed to them

---

### Get Order Details
**GET** `/api/orders/1/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### Update Order Status
**PUT** `/api/orders/1/status/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "status": "accepted"
}
```

**Status Flow:**
1. **pending** → Retailer placed order
2. **accepted** → Supplier accepted (only supplier)
3. **processing** → Supplier is processing (only supplier)
4. **on_the_way** → Order out for delivery (only supplier)
5. **delivered** → Order completed (only supplier)
6. **cancelled** → Cancelled by retailer (pending only) or supplier

**Retailer Permissions:**
- Can only cancel orders with status "pending"

**Supplier Permissions:**
- Can accept, process, mark as on_the_way, delivered, or cancel

---

## 🎯 COMPLETE TESTING FLOW

### Supplier Flow:

1. **Login** → POST `/api/auth/login/`
2. **Create Profile** → POST `/api/suppliers/profile/`
3. **Create Product** → POST `/api/products/supplier/products/`
4. **Upload Image** → POST `/api/products/supplier/products/1/images/`
5. **View My Products** → GET `/api/products/supplier/products/`
6. **View Orders** → GET `/api/orders/`
7. **Accept Order** → PUT `/api/orders/1/status/` with `status: "accepted"`
8. **Update to Processing** → PUT `/api/orders/1/status/` with `status: "processing"`
9. **Mark Out for Delivery** → PUT `/api/orders/1/status/` with `status: "on_the_way"`
10. **Complete Order** → PUT `/api/orders/1/status/` with `status: "delivered"`

### Retailer Flow:

1. **Login** → POST `/api/auth/login/`
2. **Create Profile** → POST `/api/retailers/profile/`
3. **Browse Products** → GET `/api/products/retailer/products/`
4. **View Product Details** → GET `/api/products/retailer/products/product-slug/`
5. **Add to Cart** → POST `/api/orders/cart/items/`
6. **View Cart** → GET `/api/orders/cart/`
7. **Update Quantity** → PUT `/api/orders/cart/items/1/`
8. **Place Order** → POST `/api/orders/`
9. **View My Orders** → GET `/api/orders/`
10. **View Order Details** → GET `/api/orders/1/`
11. **Cancel Order** (if pending) → PUT `/api/orders/1/status/` with `status: "cancelled"`

---

## 📊 All Endpoints Summary

### Products:
- POST `/api/products/supplier/products/` - Create product
- GET `/api/products/supplier/products/` - List my products
- GET `/api/products/supplier/products/1/` - Get my product
- PUT `/api/products/supplier/products/1/` - Update product
- DELETE `/api/products/supplier/products/1/` - Delete product
- POST `/api/products/supplier/products/1/images/` - Upload image
- DELETE `/api/products/supplier/products/1/images/2/` - Delete image
- GET `/api/products/retailer/products/` - Browse all products
- GET `/api/products/retailer/products/slug/` - Product details
- GET `/api/products/categories/` - List categories

### Cart:
- GET `/api/orders/cart/` - Get cart
- DELETE `/api/orders/cart/` - Clear cart
- POST `/api/orders/cart/items/` - Add to cart
- PUT `/api/orders/cart/items/1/` - Update cart item
- DELETE `/api/orders/cart/items/1/` - Remove from cart

### Orders:
- POST `/api/orders/` - Create order
- GET `/api/orders/` - List orders
- GET `/api/orders/1/` - Order details
- PUT `/api/orders/1/status/` - Update order status

---

## ✅ Features Completed

- ✅ Product CRUD (Supplier)
- ✅ Product image upload (Multiple images per product)
- ✅ Product categories
- ✅ Inventory tracking (Stock updates automatically)
- ✅ Product browsing (Retailer)
- ✅ Search & filters
- ✅ Shopping cart
- ✅ Order placement
- ✅ Order status management
- ✅ Stock management (Auto-deduct/restore)
- ✅ Order history
- ✅ Price calculation
- ✅ Discount handling

---

## 🔑 Notes

1. **Stock Management:** Stock automatically decreases when order is placed, increases when cancelled
2. **Product Status:** Changes to "out_of_stock" when stock reaches 0
3. **Cart Validation:** Validates stock availability and minimum order quantity
4. **Order Numbers:** Auto-generated unique order numbers (ORD-XXXXXXXX)
5. **Image Upload:** Supports multiple images, one can be marked as primary
6. **Price Display:** Shows discount price if available, calculates discount percentage

Server running at **http://127.0.0.1:8000** 🚀
