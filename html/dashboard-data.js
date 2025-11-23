// Dashboard data for all user types
const dashboardData = {
    metrics: {
        manufacturer: [
            {
                title: 'Production Output',
                value: '2,847',
                change: '+12.5%',
                icon: 'cube-outline',
                status: 'success'
            },
            {
                title: 'Quality Rate',
                value: '98.3%',
                change: '+2.1%',
                icon: 'checkmark-circle-outline',
                status: 'success'
            },
            {
                title: 'Active Orders',
                value: '156',
                change: '+8.3%',
                icon: 'layers-outline',
                status: 'info'
            },
            {
                title: 'Supplier Partners',
                value: '42',
                change: '+5.0%',
                icon: 'people-outline',
                status: 'info'
            }
        ],
        supplier: [
            {
                title: 'Raw Materials',
                value: '18,450',
                change: '+15.2%',
                icon: 'archive-outline',
                status: 'success'
            },
            {
                title: 'Delivery Time',
                value: '2.3 days',
                change: '-8.5%',
                icon: 'time-outline',
                status: 'success'
            },
            {
                title: 'Active Contracts',
                value: '89',
                change: '+12.8%',
                icon: 'briefcase-outline',
                status: 'info'
            },
            {
                title: 'Fulfillment Rate',
                value: '96.7%',
                change: '+3.2%',
                icon: 'checkmark-circle-outline',
                status: 'success'
            }
        ],
        retailer: [
            {
                title: 'Total Sales',
                value: '$245K',
                change: '+18.4%',
                icon: 'trending-up-outline',
                status: 'success'
            },
            {
                title: 'Inventory Items',
                value: '3,248',
                change: '+5.7%',
                icon: 'cart-outline',
                status: 'info'
            },
            {
                title: 'Avg. Order Value',
                value: '$127',
                change: '+9.2%',
                icon: 'pricetag-outline',
                status: 'success'
            },
            {
                title: 'Customer Rating',
                value: '4.8/5',
                change: '+0.3',
                icon: 'checkmark-circle-outline',
                status: 'success'
            }
        ],
        logistics: [
            {
                title: 'Shipments Today',
                value: '487',
                change: '+22.1%',
                icon: 'airplane-outline',
                status: 'success'
            },
            {
                title: 'Avg. Delivery Time',
                value: '1.8 days',
                change: '-12.3%',
                icon: 'timer-outline',
                status: 'success'
            },
            {
                title: 'Fleet Utilization',
                value: '87.5%',
                change: '+5.4%',
                icon: 'car-outline',
                status: 'info'
            },
            {
                title: 'Active Routes',
                value: '156',
                change: '+8.9%',
                icon: 'git-network-outline',
                status: 'info'
            }
        ]
    },
    activities: {
        manufacturer: [
            {
                title: 'New Production Order',
                description: 'Order #MFG-2847 initiated for Automotive Parts',
                timestamp: '2 hours ago',
                icon: 'basket-outline',
                status: 'success'
            },
            {
                title: 'Quality Check Completed',
                description: 'Batch #QC-1923 passed all quality standards',
                timestamp: '5 hours ago',
                icon: 'checkmark-circle-outline',
                status: 'success'
            },
            {
                title: 'Material Low Stock Alert',
                description: 'Steel Grade A inventory below threshold',
                timestamp: '1 day ago',
                icon: 'warning-outline',
                status: 'warning'
            }
        ],
        supplier: [
            {
                title: 'Shipment Dispatched',
                description: 'Order #SUP-4523 shipped to Manufacturer Hub A',
                timestamp: '3 hours ago',
                icon: 'send-outline',
                status: 'success'
            },
            {
                title: 'Contract Renewed',
                description: 'Annual contract with TechCorp Manufacturing renewed',
                timestamp: '1 day ago',
                icon: 'document-text-outline',
                status: 'success'
            },
            {
                title: 'Inventory Restocked',
                description: 'Raw material inventory updated - 5,000 units added',
                timestamp: '2 days ago',
                icon: 'sync-outline',
                status: 'info'
            }
        ],
        retailer: [
            {
                title: 'New Sale Recorded',
                description: 'Order #RET-8392 - $1,247 from Premium Customer',
                timestamp: '1 hour ago',
                icon: 'trophy-outline',
                status: 'success'
            },
            {
                title: 'Stock Replenishment',
                description: '150 units of Product SKU-4429 restocked',
                timestamp: '4 hours ago',
                icon: 'refresh-outline',
                status: 'info'
            },
            {
                title: 'Customer Return Processed',
                description: 'Return #RET-7721 approved and refunded',
                timestamp: '6 hours ago',
                icon: 'return-down-back-outline',
                status: 'warning'
            }
        ],
        logistics: [
            {
                title: 'Delivery Completed',
                description: 'Shipment #LOG-9284 delivered successfully',
                timestamp: '30 minutes ago',
                icon: 'checkmark-done-outline',
                status: 'success'
            },
            {
                title: 'New Route Assigned',
                description: 'Route #RT-447 assigned to Driver John Doe',
                timestamp: '3 hours ago',
                icon: 'navigate-outline',
                status: 'info'
            },
            {
                title: 'Delay Alert',
                description: 'Shipment #LOG-9201 delayed due to weather',
                timestamp: '5 hours ago',
                icon: 'alert-circle-outline',
                status: 'warning'
            }
        ]
    },
    users: {
        manufacturer: {
            fullName: 'John Smith',
            userType: 'manufacturer',
            companyName: 'TechCorp Manufacturing'
        },
        supplier: {
            fullName: 'Sarah Johnson',
            userType: 'supplier',
            companyName: 'Global Raw Materials Ltd'
        },
        retailer: {
            fullName: 'Mike Chen',
            userType: 'retailer',
            companyName: 'RetailPro Store Network'
        },
        logistics: {
            fullName: 'Emily Rodriguez',
            userType: 'logistics',
            companyName: 'FastTrack Logistics'
        }
    }
};
