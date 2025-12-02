import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTopSellingProducts, TopProduct } from '@/services/dashboardService';

interface Product {
  rank: number;
  name: string;
  sales: number;
  percentage: number;
}

export default function TopProductsCard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopSellingProducts(7); // Last 7 days
      
      // Transform API data to component format
      const topProducts = data.top_products.slice(0, 5);
      const maxSales = topProducts[0]?.total_quantity || 1;
      
      const transformedProducts: Product[] = topProducts.map((item, index) => ({
        rank: index + 1,
        name: item.product__name,
        sales: item.total_quantity,
        percentage: (item.total_quantity / maxSales) * 100,
      }));
      
      setProducts(transformedProducts);
    } catch (err: any) {
      console.error('Error fetching top products:', err);
      setError('Failed to load top products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Top 5 Selling Products</Text>
        <TouchableOpacity onPress={fetchTopProducts}>
          <Text style={styles.viewAll}>Refresh ›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchTopProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sales data yet</Text>
          <Text style={styles.emptySubtext}>Start recording sales to see top products</Text>
        </View>
      ) : (
        <View style={styles.productsList}>
          {products.map((product) => (
            <ProductItem key={product.rank} product={product} />
          ))}
        </View>
      )}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
  },
  errorContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
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
