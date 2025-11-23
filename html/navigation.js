// Navigation data for different user types
const navigationData = {
    manufacturer: {
        name: 'John Smith',
        initials: 'JS',
        role: 'Manufacturer',
        company: 'TechCorp Manufacturing',
        menuItems: [
            { icon: 'home', label: 'Dashboard', href: 'manufacturer-dashboard.html', active: true },
            { icon: 'cube', label: 'Inventory', href: 'manufacturer-inventory.html', active: false },
            { icon: 'cart', label: 'Orders', href: 'manufacturer-orders.html', active: false },
            { icon: 'trending-up', label: 'AI Insights', href: 'manufacturer-ai-insights.html', active: false },
            { icon: 'people', label: 'Suppliers', href: 'manufacturer-supplier-collaboration.html', active: false },
            { icon: 'location', label: 'Shipments', href: 'manufacturer-shipment-tracking.html', active: false },
            { icon: 'document', label: 'Reports', href: 'manufacturer-reports.html', active: false },
            { icon: 'settings', label: 'Settings', href: 'manufacturer-profile.html', active: false }
        ],
        bottomNav: [
            { icon: 'home', label: 'Home', href: 'manufacturer-dashboard.html', active: true },
            { icon: 'cube', label: 'Inventory', href: 'manufacturer-inventory.html', active: false },
            { icon: 'cart', label: 'Orders', href: 'manufacturer-orders.html', active: false },
            { icon: 'bar-chart', label: 'Insights', href: 'manufacturer-ai-insights.html', active: false }
        ]
    },
    supplier: {
        name: 'Sarah Johnson',
        initials: 'SJ',
        role: 'Supplier',
        company: 'Global Raw Materials Ltd',
        menuItems: [
            { icon: 'home', label: 'Dashboard', href: 'supplier-dashboard.html', active: true },
            { icon: 'document-text', label: 'Order Requests', href: 'supplier-order-requests.html', active: false },
            { icon: 'receipt', label: 'Invoices', href: 'supplier-invoices.html', active: false },
            { icon: 'grid', label: 'Product Catalog', href: 'supplier-product-catalog.html', active: false },
            { icon: 'chatbubble', label: 'Messages', href: 'supplier-chat.html', active: false },
            { icon: 'bar-chart', label: 'Analytics', href: 'supplier-dashboard.html', active: false },
            { icon: 'settings', label: 'supplier-dashboard.html', active: false }
        ],
        bottomNav: [
            { icon: 'home', label: 'Home', href: 'supplier-dashboard.html', active: true },
            { icon: 'document-text', label: 'Orders', href: 'supplier-order-requests.html', active: false },
            { icon: 'receipt', label: 'Invoices', href: 'supplier-invoices.html', active: false },
            { icon: 'chatbubble', label: 'Chat', href: 'supplier-chat.html', active: false }
        ]
    },
    retailer: {
        name: 'Mike Chen',
        initials: 'MC',
        role: 'Retailer',
        company: 'RetailPro Store Network',
        menuItems: [
            { icon: 'home', label: 'Dashboard', href: 'retailer-dashboard.html', active: true },
            { icon: 'storefront', label: 'Purchase Products', href: 'retailer-purchase-products.html', active: false },
            { icon: 'location', label: 'Order Tracking', href: 'retailer-order-tracking.html', active: false },
            { icon: 'card', label: 'Payments', href: 'retailer-payments.html', active: false },
            { icon: 'trending-up', label: 'Insights', href: 'retailer-insights.html', active: false },
            { icon: 'people', label: 'Suppliers', href: 'retailer-dashboard.html', active: false },
            { icon: 'settings', label: 'Settings', href: 'retailer-dashboard.html', active: false }
        ],
        bottomNav: [
            { icon: 'home', label: 'Home', href: 'retailer-dashboard.html', active: true },
            { icon: 'storefront', label: 'Shop', href: 'retailer-purchase-products.html', active: false },
            { icon: 'location', label: 'Track', href: 'retailer-order-tracking.html', active: false },
            { icon: 'card', label: 'Payments', href: 'retailer-payments.html', active: false }
        ]
    },
    logistics: {
        name: 'Emily Rodriguez',
        initials: 'ER',
        role: 'Logistics Partner',
        company: 'FastTrack Logistics',
        menuItems: [
            { icon: 'home', label: 'Dashboard', href: 'logistics-dashboard.html', active: true },
            { icon: 'cube', label: 'Shipment Management', href: '#', active: false },
            { icon: 'navigate', label: 'Route Optimization', href: '#', active: false },
            { icon: 'car', label: 'Fleet Management', href: '#', active: false },
            { icon: 'people', label: 'Drivers', href: '#', active: false },
            { icon: 'document', label: 'Reports', href: '#', active: false },
            { icon: 'settings', label: 'Settings', href: '#', active: false }
        ],
        bottomNav: [
            { icon: 'home', label: 'Home', href: 'logistics-dashboard.html', active: true },
            { icon: 'cube', label: 'Shipments', href: '#', active: false },
            { icon: 'navigate', label: 'Routes', href: '#', active: false },
            { icon: 'car', label: 'Fleet', href: '#', active: false }
        ]
    }
};

// Icon SVG paths
const iconPaths = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
    cube: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    people: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
    document: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',
    'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    'document-text': '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    chatbubble: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    storefront: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    navigate: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    car: '<path d="M14 16V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z"/><path d="M18 12h4l3 3v4h-3"/><circle cx="7" cy="20" r="2"/><circle cx="17" cy="20" r="2"/>'
};

// Generate navigation HTML
function generateMobileNav(userType) {
    const data = navigationData[userType];
    return `
        <!-- Mobile Top Navbar -->
        <nav class="mobile-navbar">
            <div class="navbar-left">
                <button class="hamburger-btn" onclick="toggleSidebar()">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                        ${iconPaths.menu}
                    </svg>
                </button>
                <span class="navbar-brand">ChainSync AI</span>
            </div>
            <div class="navbar-right">
                <button class="nav-icon-btn" onclick="alert('Notifications coming soon!')">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                        ${iconPaths.bell}
                    </svg>
                    <span class="notification-badge"></span>
                </button>
                <div class="avatar-btn">${data.initials}</div>
            </div>
        </nav>

        <!-- Sidebar Menu -->
        <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
        <div class="sidebar-menu" id="sidebarMenu">
            <div class="sidebar-header">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="sidebar-user">
                        <div class="sidebar-avatar">${data.initials}</div>
                        <div class="sidebar-user-info">
                            <div class="sidebar-user-name">${data.name}</div>
                            <div class="sidebar-user-role">${data.role}</div>
                        </div>
                    </div>
                    <button class="sidebar-close" onclick="toggleSidebar()">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                            ${iconPaths.close}
                        </svg>
                    </button>
                </div>
            </div>
            <nav class="sidebar-nav">
                ${data.menuItems.map(item => `
                    <a href="${item.href}" class="sidebar-nav-item ${item.active ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                            ${iconPaths[item.icon]}
                        </svg>
                        <span>${item.label}</span>
                    </a>
                `).join('')}
            </nav>
        </div>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            ${data.bottomNav.map(item => `
                <a href="${item.href}" class="bottom-nav-item ${item.active ? 'active' : ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                        ${iconPaths[item.icon]}
                    </svg>
                    <span>${item.label}</span>
                </a>
            `).join('')}
        </nav>
    `;
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}
