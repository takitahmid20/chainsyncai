// AI-powered data for all pages
const aiData = {
    // Manufacturer AI Data
    manufacturer: {
        // AI Predictions for Dashboard
        aiAlerts: [
            {
                type: 'warning',
                priority: 'high',
                title: 'Predicted Stock Shortage',
                message: 'Steel Grade A inventory will run out in 3 days based on current consumption',
                action: 'Reorder Now',
                icon: 'alert-circle'
            },
            {
                type: 'success',
                priority: 'medium',
                title: 'Demand Surge Detected',
                message: 'AI predicts 35% increase in Product SKU-4429 demand next week',
                action: 'Increase Production',
                icon: 'trending-up'
            },
            {
                type: 'info',
                priority: 'low',
                title: 'Supplier Price Drop',
                message: 'Supplier B reduced raw material prices by 8% - Consider switching',
                action: 'View Details',
                icon: 'pricetag'
            }
        ],
        
        // Inventory with AI Reorder Points
        inventory: [
            {
                id: 'INV-001',
                name: 'Steel Grade A',
                sku: 'STL-A-1000',
                currentStock: 450,
                reorderPoint: 500,
                optimalStock: 1200,
                unit: 'kg',
                supplier: 'Metal Corp Ltd',
                lastUpdated: '2 hours ago',
                aiRecommendation: {
                    status: 'urgent',
                    message: 'Reorder 750kg now. Stock will deplete in 3 days at current rate',
                    confidence: 94,
                    suggestedQuantity: 750,
                    estimatedDays: 3
                }
            },
            {
                id: 'INV-002',
                name: 'Aluminum Sheets',
                sku: 'ALU-S-2000',
                currentStock: 2800,
                reorderPoint: 1000,
                optimalStock: 3000,
                unit: 'sheets',
                supplier: 'Global Materials',
                lastUpdated: '5 hours ago',
                aiRecommendation: {
                    status: 'optimal',
                    message: 'Stock level is optimal. Next reorder in 12 days',
                    confidence: 89,
                    suggestedQuantity: 0,
                    estimatedDays: 12
                }
            },
            {
                id: 'INV-003',
                name: 'Copper Wire',
                sku: 'COP-W-3000',
                currentStock: 1200,
                reorderPoint: 800,
                optimalStock: 1500,
                unit: 'meters',
                supplier: 'Wire Solutions',
                lastUpdated: '1 day ago',
                aiRecommendation: {
                    status: 'good',
                    message: 'Stock is healthy. Consider reordering in 7 days',
                    confidence: 92,
                    suggestedQuantity: 300,
                    estimatedDays: 7
                }
            },
            {
                id: 'INV-004',
                name: 'Plastic Pellets',
                sku: 'PLA-P-4000',
                currentStock: 350,
                reorderPoint: 600,
                optimalStock: 1000,
                unit: 'kg',
                supplier: 'Polymer Industries',
                lastUpdated: '3 hours ago',
                aiRecommendation: {
                    status: 'warning',
                    message: 'Below reorder point. Order 650kg within 2 days',
                    confidence: 96,
                    suggestedQuantity: 650,
                    estimatedDays: 2
                }
            }
        ],

        // Orders with AI Best Supplier
        orders: [
            {
                id: 'ORD-2847',
                buyer: 'AutoTech Industries',
                status: 'In Progress',
                paymentStatus: 'Pending',
                deliveryDate: 'Nov 15, 2025',
                total: 12450,
                items: [
                    { name: 'Steel Grade A', quantity: 500, unitPrice: 12.50, subtotal: 6250 },
                    { name: 'Aluminum Sheets', quantity: 200, unitPrice: 14.80, subtotal: 2960 },
                    { name: 'Copper Wire', quantity: 300, unitPrice: 10.80, subtotal: 3240 }
                ],
                aiSupplierRecommendation: {
                    currentSupplier: 'Global Materials',
                    currentPrice: 13800,
                    currentDelivery: '7 days',
                    recommendedSupplier: 'Metal Corp Ltd',
                    recommendedPrice: 11930,
                    recommendedDelivery: '5 days',
                    savings: 1870,
                    reason: '15% cheaper pricing, 2 days faster delivery, and 98% reliability rating. This supplier has fulfilled 94 orders with zero delays.',
                    confidence: 91
                }
            },
            {
                id: 'ORD-2848',
                buyer: 'TechGear Ltd',
                status: 'In Progress',
                paymentStatus: 'Paid',
                deliveryDate: 'Nov 10, 2025',
                total: 8750,
                items: [
                    { name: 'Electronics Components', quantity: 1000, unitPrice: 5.50, subtotal: 5500 },
                    { name: 'Plastic Pellets', quantity: 500, unitPrice: 6.50, subtotal: 3250 }
                ],
                aiSupplierRecommendation: {
                    currentSupplier: 'Component Hub',
                    currentPrice: 9200,
                    currentDelivery: '6 days',
                    recommendedSupplier: 'Wire Solutions',
                    recommendedPrice: 8750,
                    recommendedDelivery: '4 days',
                    savings: 450,
                    reason: 'Best quality-to-price ratio with faster production time. Wire Solutions specializes in electronic components with superior quality control.',
                    confidence: 87
                }
            },
            {
                id: 'ORD-2849',
                buyer: 'BuildMaster Corp',
                status: 'Pending',
                paymentStatus: 'Pending',
                deliveryDate: 'Nov 20, 2025',
                total: 15800,
                items: [
                    { name: 'Steel Beams', quantity: 100, unitPrice: 125, subtotal: 12500 },
                    { name: 'Bolts & Fasteners', quantity: 1000, unitPrice: 3.30, subtotal: 3300 }
                ],
                aiSupplierRecommendation: {
                    currentSupplier: 'Steel Traders',
                    currentPrice: 16500,
                    currentDelivery: '8 days',
                    recommendedSupplier: 'Industrial Metals Inc',
                    recommendedPrice: 15100,
                    recommendedDelivery: '6 days',
                    savings: 1400,
                    reason: 'Industrial Metals Inc offers bulk discounts and has the best delivery track record for construction materials in your region.',
                    confidence: 93
                }
            },
            {
                id: 'ORD-2850',
                buyer: 'GreenTech Solutions',
                status: 'Pending',
                paymentStatus: 'Paid',
                deliveryDate: 'Nov 12, 2025',
                total: 22300,
                items: [
                    { name: 'Carbon Fiber Sheets', quantity: 50, unitPrice: 380, subtotal: 19000 },
                    { name: 'Epoxy Resin', quantity: 100, unitPrice: 33, subtotal: 3300 }
                ]
            }
        ],

        // AI Insights Charts Data
        aiInsights: {
            demandForecast: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                actual: [2400, 2600, 2800, 2900, null, null],
                predicted: [null, null, null, 2900, 3200, 3500],
                confidence: [null, null, null, 95, 92, 88]
            },
            trendAnalysis: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                production: [1200, 1350, 1500, 1420, 1680, 1850, 1920, 2100, 2200, 2400],
                trend: 'upward',
                growth: '+18.5%',
                prediction: 'Expect 25% increase in Q4 based on market trends'
            },
            anomalies: [
                {
                    date: '2025-10-15',
                    type: 'spike',
                    metric: 'Production',
                    value: 3200,
                    expected: 2400,
                    reason: 'Bulk order from new client',
                    impact: 'positive'
                },
                {
                    date: '2025-09-22',
                    type: 'drop',
                    metric: 'Quality Rate',
                    value: 87,
                    expected: 98,
                    reason: 'Equipment malfunction detected',
                    impact: 'negative'
                }
            ],
            recommendations: [
                {
                    id: 1,
                    title: 'Switch to Supplier B for Steel',
                    impact: 'high',
                    savings: '$2,400/month',
                    details: 'Supplier B offers 10% cheaper rates with faster delivery',
                    confidence: 94,
                    action: 'Review Supplier'
                },
                {
                    id: 2,
                    title: 'Increase Aluminum Stock by 20%',
                    impact: 'medium',
                    savings: 'Prevent $5,000 rush order costs',
                    details: 'AI predicts 35% demand increase next month',
                    confidence: 88,
                    action: 'Adjust Inventory'
                },
                {
                    id: 3,
                    title: 'Optimize Production Schedule',
                    impact: 'medium',
                    savings: '$1,800/month',
                    details: 'Shift 30% production to off-peak hours for lower energy costs',
                    confidence: 91,
                    action: 'View Schedule'
                }
            ]
        },

        // Supplier Comparison
        suppliers: [
            {
                id: 'SUP-001',
                name: 'Metal Corp Ltd',
                rating: 4.8,
                reliability: 98,
                avgPrice: '$12.50/kg',
                deliveryTime: '3-5 days',
                onTimeDelivery: 96,
                qualityScore: 97,
                totalOrders: 245,
                aiScore: 94,
                aiInsight: 'Best overall choice - excellent balance of price, speed, and quality'
            },
            {
                id: 'SUP-002',
                name: 'Global Materials',
                rating: 4.6,
                reliability: 94,
                avgPrice: '$13.80/kg',
                deliveryTime: '5-7 days',
                onTimeDelivery: 92,
                qualityScore: 96,
                totalOrders: 189,
                aiScore: 86,
                aiInsight: 'Good quality but 10% more expensive than alternatives'
            },
            {
                id: 'SUP-003',
                name: 'Wire Solutions',
                rating: 4.9,
                reliability: 99,
                avgPrice: '$11.20/kg',
                deliveryTime: '2-4 days',
                onTimeDelivery: 98,
                qualityScore: 99,
                totalOrders: 312,
                aiScore: 97,
                aiInsight: 'Premium supplier - fastest delivery and highest quality'
            }
        ],

        // Shipment Tracking
        shipments: [
            {
                id: 'SHIP-9284',
                orderId: 'ORD-2847',
                destination: 'AutoTech Industries, Dhaka',
                status: 'in-transit',
                progress: 65,
                currentLocation: 'Highway Depot, Chattogram',
                eta: '2 hours',
                driver: 'Karim Ahmed',
                vehicle: 'TRK-4521',
                aiPrediction: {
                    onTime: true,
                    confidence: 92,
                    delays: [],
                    suggestion: 'Route optimal, no delays expected'
                }
            },
            {
                id: 'SHIP-9285',
                orderId: 'ORD-2848',
                destination: 'TechGear Ltd, Sylhet',
                status: 'delayed',
                progress: 45,
                currentLocation: 'Rest Stop, Comilla',
                eta: '4 hours (Delayed)',
                driver: 'Rahim Mia',
                vehicle: 'TRK-4522',
                aiPrediction: {
                    onTime: false,
                    confidence: 88,
                    delays: ['Heavy traffic on N1 highway', 'Weather conditions'],
                    suggestion: 'Consider alternative route via N2 to save 45 minutes'
                }
            }
        ]
    },

    // Supplier AI Data
    supplier: {
        aiTips: [
            {
                type: 'demand',
                title: 'High Demand Alert',
                message: 'Steel Grade A demand increased 40% this week',
                action: 'Increase stock by 500kg to meet demand',
                confidence: 93
            },
            {
                type: 'pricing',
                title: 'Price Optimization',
                message: 'Your aluminum price is 8% above market average',
                action: 'Consider reducing to $13.20/kg to stay competitive',
                confidence: 89
            },
            {
                type: 'opportunity',
                title: 'New Market Opportunity',
                message: '5 new manufacturers searching for your products',
                action: 'Send quotations to potential buyers',
                confidence: 91
            }
        ],

        orderRequests: [
            {
                id: 'REQ-4523',
                product: 'Steel Grade A',
                quantity: '750kg',
                buyer: 'TechCorp Manufacturing',
                deadline: '2025-11-08',
                budget: '$9,000-$10,000',
                status: 'pending',
                aiSuggestion: {
                    recommendedPrice: '$9,375',
                    reason: '15% profit margin, competitive with market',
                    winProbability: 87,
                    competitors: 3
                }
            },
            {
                id: 'REQ-4524',
                product: 'Aluminum Sheets',
                quantity: '300 sheets',
                buyer: 'BuildTech Ltd',
                deadline: '2025-11-12',
                budget: '$4,000-$4,500',
                status: 'quoted',
                aiSuggestion: {
                    recommendedPrice: '$4,200',
                    reason: 'Optimal price point, high win probability',
                    winProbability: 92,
                    competitors: 2
                }
            }
        ],

        productCatalog: [
            {
                id: 'PROD-001',
                name: 'Cardboard Packaging Boxes (Medium)',
                price: '৳25/piece',
                availableStock: '5,000 pieces',
                stockStatus: 'Available',
                deliveryTime: '3-5 days',
                category: 'Packaging Materials',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'High Demand',
                    message: 'E-commerce boom! 28% increase in packaging demand this month'
                },
                aiPriceOptimization: 'Optimal pricing - Competitive with market average'
            },
            {
                id: 'PROD-002',
                name: 'Bubble Wrap Roll (100m)',
                price: '৳450/roll',
                availableStock: '2,500 rolls',
                stockStatus: 'Available',
                deliveryTime: '2-4 days',
                category: 'Packaging Materials',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Steady Demand',
                    message: 'Consistent orders from 45 online sellers this week'
                },
                aiPriceOptimization: 'Price 5% below market - Great value for bulk buyers'
            },
            {
                id: 'PROD-003',
                name: 'Custom Printed Shopping Bags',
                price: '৳12/piece',
                availableStock: '10,000 pieces',
                stockStatus: 'Available',
                deliveryTime: '5-7 days',
                category: 'Packaging Materials',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Very High Demand',
                    message: 'Festival season approaching! 55% increase expected in next 2 weeks'
                },
                aiPriceOptimization: 'High demand detected - You can increase price to ৳14/piece'
            },
            {
                id: 'PROD-004',
                name: 'Thermal Receipt Paper Rolls',
                price: '৳35/roll',
                availableStock: '3,500 rolls',
                stockStatus: 'Available',
                deliveryTime: '3-5 days',
                category: 'Store Supplies',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Stable Demand',
                    message: 'Retail shops restocking regularly - reliable steady orders'
                }
            },
            {
                id: 'PROD-005',
                name: 'Display Mannequins - Female',
                price: '৳2,500/piece',
                availableStock: '120 pieces',
                stockStatus: 'Low',
                deliveryTime: '7-10 days',
                category: 'Store Equipment',
                aiDemandTrend: {
                    direction: 'down',
                    label: 'Seasonal Slowdown',
                    message: 'Off-season for clothing stores. Demand will rise in 3 weeks'
                },
                aiPriceOptimization: 'Reduce to ৳2,200/piece for quick inventory turnover'
            },
            {
                id: 'PROD-006',
                name: 'Barcode Scanner - Wireless',
                price: '৳3,200/piece',
                availableStock: '85 pieces',
                stockStatus: 'Available',
                deliveryTime: '5-7 days',
                category: 'Store Equipment',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Growing Demand',
                    message: 'SME retailers digitizing operations - 32% monthly growth'
                },
                aiPriceOptimization: 'Premium pricing justified - Quality product with warranty'
            },
            {
                id: 'PROD-007',
                name: 'Security Tags & Labels (1000 pack)',
                price: '৳850/pack',
                availableStock: '400 packs',
                stockStatus: 'Available',
                deliveryTime: '3-5 days',
                category: 'Store Supplies',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Consistent Orders',
                    message: 'Retail security essential - steady demand from clothing stores'
                },
                aiPriceOptimization: 'Competitive price - Bundle with mannequins for better deals'
            },
            {
                id: 'PROD-008',
                name: 'Product Label Stickers (A4 Sheets)',
                price: '৳180/pack',
                availableStock: '1,500 packs',
                stockStatus: 'Available',
                deliveryTime: '2-4 days',
                category: 'Store Supplies',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'High Volume Sales',
                    message: 'Small business favorite! 156 orders this week from food & cosmetic sellers'
                },
                aiPriceOptimization: 'Perfect pricing - Market leader in this category'
            },
            {
                id: 'PROD-009',
                name: 'LED Display Shelf Lights',
                price: '৳650/piece',
                availableStock: '200 pieces',
                stockStatus: 'Low',
                deliveryTime: '5-7 days',
                category: 'Store Equipment',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'Premium Demand',
                    message: 'Boutique shops upgrading displays - premium accessory trending'
                }
            },
            {
                id: 'PROD-010',
                name: 'Cash Drawer with Key Lock',
                price: '৳1,850/piece',
                availableStock: '150 pieces',
                stockStatus: 'Available',
                deliveryTime: '3-5 days',
                category: 'Store Equipment',
                aiDemandTrend: {
                    direction: 'up',
                    label: 'New Store Boom',
                    message: 'New retail stores opening - essential equipment with steady demand'
                },
                aiPriceOptimization: 'Offer combo: Cash Drawer + Barcode Scanner = Save ৳500'
            }
        ]
    },

    // Retailer AI Data
    retailer: {
        restockAlerts: [
            {
                product: 'Product SKU-4429',
                currentStock: 45,
                daysLeft: 5,
                recommendedRestock: 150,
                urgency: 'high',
                aiPrediction: {
                    message: 'Stock will run out in 5 days based on sales velocity',
                    confidence: 94,
                    demandTrend: 'increasing',
                    suggestedSupplier: 'QuickSupply Co - 2 day delivery'
                }
            },
            {
                product: 'Premium Widget X',
                currentStock: 120,
                daysLeft: 12,
                recommendedRestock: 80,
                urgency: 'medium',
                aiPrediction: {
                    message: 'Moderate restock needed. Sales steady at 10 units/day',
                    confidence: 89,
                    demandTrend: 'stable',
                    suggestedSupplier: 'ValueParts Inc - best price'
                }
            }
        ],

        salesInsights: {
            trends: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                sales: [1200, 1450, 1380, 1620, 1890, 2340, 2100],
                forecast: [null, null, null, null, null, null, 2200],
                peakDay: 'Saturday',
                growth: '+18%'
            },
            topProducts: [
                { name: 'Product SKU-4429', sales: 245, revenue: '$12,250', trend: '+24%' },
                { name: 'Premium Widget X', sales: 189, revenue: '$9,450', trend: '+12%' },
                { name: 'Basic Tool Set', sales: 156, revenue: '$7,800', trend: '-5%' }
            ],
            aiRecommendations: [
                'Focus marketing on SKU-4429 - highest growth potential',
                'Bundle Premium Widget X with Basic Tool Set for 15% sales boost',
                'Stock up for weekend rush - 40% higher sales on Sat/Sun'
            ]
        }
    },

    // Logistics AI Data
    logistics: {
        routeOptimization: [
            {
                shipmentId: 'SHIP-9284',
                origin: 'Dhaka Warehouse',
                destination: 'Chattogram Port',
                currentRoute: 'N1 Highway - 285km',
                estimatedTime: '5 hours 30 min',
                aiSuggestedRoute: 'N2 via Comilla - 295km',
                aiEstimatedTime: '4 hours 45 min',
                savings: {
                    time: '45 minutes',
                    fuel: '$12.50',
                    reason: 'Less traffic, better road conditions'
                },
                trafficConditions: {
                    current: 'Heavy',
                    alternative: 'Light',
                    weather: 'Clear'
                },
                confidence: 91
            },
            {
                shipmentId: 'SHIP-9285',
                origin: 'Chattogram Depot',
                destination: 'Sylhet Center',
                currentRoute: 'Direct Route - 242km',
                estimatedTime: '6 hours',
                aiSuggestedRoute: 'Highway Express - 258km',
                aiEstimatedTime: '4 hours 30 min',
                savings: {
                    time: '1.5 hours',
                    fuel: '$8.75',
                    reason: 'Highway tolls save time despite longer distance'
                },
                trafficConditions: {
                    current: 'Moderate',
                    alternative: 'Light',
                    weather: 'Partly cloudy'
                },
                confidence: 88
            }
        ],

        fleetOptimization: {
            vehicles: [
                {
                    id: 'TRK-4521',
                    type: 'Heavy Truck',
                    utilization: 87,
                    status: 'in-use',
                    maintenanceDue: 15,
                    aiSuggestion: 'High utilization - schedule maintenance in 2 weeks'
                },
                {
                    id: 'TRK-4522',
                    type: 'Medium Truck',
                    utilization: 65,
                    status: 'available',
                    maintenanceDue: 45,
                    aiSuggestion: 'Underutilized - assign to short routes for efficiency'
                },
                {
                    id: 'VAN-2031',
                    type: 'Delivery Van',
                    utilization: 92,
                    status: 'in-use',
                    maintenanceDue: 8,
                    aiSuggestion: 'Critical: Schedule maintenance within 7 days'
                }
            ],
            recommendations: [
                'Add 1 more heavy truck - current fleet at 89% capacity',
                'Optimize VAN-2031 routes to reduce wear and tear',
                'Consider electric vehicles for city routes - 30% cost savings'
            ]
        },

        deliveryPredictions: {
            onTimeRate: 94.5,
            avgDelay: '18 minutes',
            predictedImprovement: '+3.2% with AI routing',
            factors: [
                { name: 'Traffic', impact: 35 },
                { name: 'Weather', impact: 15 },
                { name: 'Vehicle Condition', impact: 20 },
                { name: 'Driver Experience', impact: 30 }
            ]
        }
    }
};

// Chart color schemes
const chartColors = {
    primary: '#00d4ff',
    success: '#00ff88',
    warning: '#ffa500',
    danger: '#ff4444',
    info: '#4169e1',
    gradient: ['#00d4ff', '#0099cc', '#006699']
};
