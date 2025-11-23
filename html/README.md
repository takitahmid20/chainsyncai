# ChainSync AI - HTML Static Pages

Complete mobile-friendly (390px width) HTML/CSS replica of the ChainSync AI application.

## 📱 Features

### ✅ Mobile Navigation System
- **Top Navbar**: Hamburger menu, brand logo, notifications icon, user avatar
- **Sidebar Menu**: Slide-in navigation with user info and menu items
- **Bottom Navigation**: Fixed bottom bar with 4 main navigation items
- **Fully Responsive**: Optimized for 390px mobile width

### ✅ All Pages Publicly Accessible
No authentication required - all pages can be viewed directly without login.

## 📂 Directory Structure

```
html/
├── all-pages.html              # Directory of all pages
├── index.html                  # Splash screen
├── onboarding.html             # 3-slide onboarding
├── signup.html                 # Registration form
├── signin.html                 # Login with quick access links
├── forgot-password.html        # Password reset request
├── otp-verification.html       # 6-digit OTP entry
├── reset-password.html         # New password creation
├── manufacturer-dashboard.html # Manufacturer view
├── supplier-dashboard.html     # Supplier view
├── retailer-dashboard.html     # Retailer view
├── logistics-dashboard.html    # Logistics view
├── styles.css                  # Complete stylesheet
├── navigation.js               # Navigation component
└── dashboard-data.js           # Mock data for all dashboards
```

## 🎯 Quick Start

### Option 1: View All Pages Index
Open `all-pages.html` in your browser to see a complete directory of all available pages.

### Option 2: Start from Splash
Open `index.html` - it will auto-redirect to onboarding after 2.5 seconds.

### Option 3: Direct Dashboard Access
- `manufacturer-dashboard.html` - John Smith (Manufacturer)
- `supplier-dashboard.html` - Sarah Johnson (Supplier)
- `retailer-dashboard.html` - Mike Chen (Retailer)
- `logistics-dashboard.html` - Emily Rodriguez (Logistics)

### Option 4: Keyboard Shortcuts
On splash screen, press:
- `1` = Manufacturer Dashboard
- `2` = Supplier Dashboard
- `3` = Retailer Dashboard
- `4` = Logistics Dashboard

## 🎨 Design System

### Colors
- **Background**: `#0a0e27`
- **Card Background**: `#1a1f3a`
- **Accent/Primary**: `#00d4ff` (Cyan)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#9ca3af`
- **Success**: `#00d4ff`
- **Warning**: `#ffa500`

### Typography
- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Mobile Width**: Fixed 390px (iPhone 14/15 Pro size)

## 📊 User Types & Data

### 1. Manufacturer (John Smith)
- **Company**: TechCorp Manufacturing
- **Metrics**: Production Output, Quality Rate, Active Orders, Supplier Partners
- **Menu**: Dashboard, Inventory, Orders, AI Insights, Suppliers, Shipments, Reports, Settings

### 2. Supplier (Sarah Johnson)
- **Company**: Global Raw Materials Ltd
- **Metrics**: Raw Materials, Delivery Time, Active Contracts, Fulfillment Rate
- **Menu**: Dashboard, Order Requests, Invoices, Product Catalog, Messages, Analytics, Settings

### 3. Retailer (Mike Chen)
- **Company**: RetailPro Store Network
- **Metrics**: Total Sales, Inventory Items, Avg Order Value, Customer Rating
- **Menu**: Dashboard, Purchase Products, Order Tracking, Payments, Insights, Suppliers, Settings

### 4. Logistics (Emily Rodriguez)
- **Company**: FastTrack Logistics
- **Metrics**: Shipments Today, Avg Delivery Time, Fleet Utilization, Active Routes
- **Menu**: Dashboard, Shipment Management, Route Optimization, Fleet Management, Drivers, Reports, Settings

## 🧭 Navigation Features

### Top Navbar
```
[☰] ChainSync AI                    [🔔] [👤]
```
- Left: Hamburger menu + Brand
- Right: Notification bell + Avatar with initials

### Sidebar Menu (Slide-in from left)
```
┌─────────────────────────────┐
│ [Avatar] Name               │
│          Role               │
├─────────────────────────────┤
│ 🏠 Dashboard                │
│ 📦 Inventory                │
│ 🛒 Orders                   │
│ 📈 AI Insights             │
│ 👥 Suppliers                │
│ 📍 Shipments                │
│ 📄 Reports                  │
│ ⚙️  Settings                │
└─────────────────────────────┘
```

### Bottom Navigation (Fixed)
```
┌─────────┬─────────┬─────────┬─────────┐
│  🏠     │  📦     │  🛒     │  📊     │
│  Home   │  Item   │  Orders │ Insights│
└─────────┴─────────┴─────────┴─────────┘
```

## 🔧 Technical Implementation

### CSS Classes
- `.mobile-navbar` - Top navigation bar
- `.sidebar-menu` - Slide-in sidebar
- `.sidebar-overlay` - Dark overlay when sidebar open
- `.bottom-nav` - Fixed bottom navigation
- `.container.with-nav` - Dashboard container with padding for navbars

### JavaScript Functions
- `generateMobileNav(userType)` - Generate navigation HTML for user type
- `toggleSidebar()` - Open/close sidebar menu

### Data Structure
All user data and navigation items are defined in `navigation.js`:
- `navigationData` - User info and menu items per user type
- `iconPaths` - SVG paths for all icons
- User-specific dashboard data in `dashboard-data.js`

## 📱 Mobile Optimization

- **Width**: Fixed 390px (iPhone 14/15 Pro)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Gestures**: Swipe-friendly sidebar
- **Performance**: Pure HTML/CSS/Vanilla JS (no frameworks)

## 🎭 Demo Features

- **No Backend Required**: All data is static/mock
- **No Authentication**: All pages publicly accessible
- **Instant Testing**: Quick access links on sign-in page
- **Realistic Data**: User-specific metrics and activities

## 🚀 Use Cases

1. **UI/UX Presentation**: Show stakeholders the complete interface
2. **Client Demo**: Present all user type dashboards without setup
3. **Design Review**: Review mobile UI/UX without running full app
4. **Prototyping**: Test navigation flows and interactions
5. **Documentation**: Visual reference for development team

## 📝 Notes

- All dashboard pages have identical structure but different data per user type
- Navigation is context-aware (active states, user-specific menu items)
- Bottom navigation shows 4 most important items per user type
- Sidebar shows complete navigation with user profile
- All icons are inline SVG for performance
- No external dependencies (pure HTML/CSS/JS)

## 🔗 Integration

These HTML pages are standalone and can be:
- Hosted on any static server (GitHub Pages, Netlify, Vercel)
- Embedded in presentations or documentation
- Used as design reference for React Native implementation
- Shared via simple file links (no build process needed)

## 🎯 Future Enhancements

While pages are functional, these features are placeholders:
- Navigation links (currently `href="#"`)
- Notification functionality
- Profile dropdown
- Quick action interactions
- Form submissions

The focus is on demonstrating the UI/UX and navigation structure.
