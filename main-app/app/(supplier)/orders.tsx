/**
 * Supplier Orders
 * Manage incoming orders from retailers
 */

import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';

export default function SupplierOrders() {
  return (
    <ComingSoon
      title="Order Management"
      description="View and manage all incoming orders from retailers. Track order status, fulfillment, and delivery."
      icon="clipboard-outline"
    />
  );
}
