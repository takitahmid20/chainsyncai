import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Product {
  rank: number;
  name: string;
  sales: number;
  percentage: number;
}

const PRODUCTS: Product[] = [
  { rank: 1, name: 'Coca Cola 250ml', sales: 234, percentage: 95 },
  { rank: 2, name: 'Milk - Aarong 500ml', sales: 198, percentage: 82 },
  { rank: 3, name: 'Bread - 400g', sales: 167, percentage: 70 },
  { rank: 4, name: 'Sugar - 1kg', sales: 139, percentage: 58 },
  { rank: 5, name: 'Rice - Miniket 1kg', sales: 108, percentage: 45 },
];

export default function TopProductsCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Top 5 Selling Products</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsList}>
        {PRODUCTS.map((product) => (
          <ProductItem key={product.rank} product={product} />
        ))}
      </View>
    </View>
  );
}

function ProductItem({ product }: { product: Product }) {
  return (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          style={styles.rankBadge}
        >
          <Text style={styles.rankText}>{product.rank}</Text>
        </LinearGradient>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          style={[styles.bar, { width: `${product.percentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <Text style={styles.salesText}>{product.sales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  viewAll: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 150,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  productName: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
    flex: 1,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  salesText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
    minWidth: 35,
    textAlign: 'right',
  },
});
