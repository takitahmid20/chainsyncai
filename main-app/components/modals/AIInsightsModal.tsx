import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AIInsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIInsightsModal({ visible, onClose }: AIInsightsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.headerTitle}>AI Insight Center</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* High Priority Insight */}
            <View style={[styles.insightCard, styles.priorityHigh]}>
              <View style={styles.iconContainer}>
                <Ionicons name="flame-outline" size={24} color="#ef4444" />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>High Priority:</Text>
                <Text style={styles.insightDescription}>
                  Milk & Detergent demand increasing by 30% next week. Restock now.
                </Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Order Now</Text>
              </TouchableOpacity>
            </View>

            {/* Medium Priority Insight */}
            <View style={[styles.insightCard, styles.priorityMedium]}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Suggestion:</Text>
                <Text style={styles.insightDescription}>
                  Soft drinks sell 40% more during hot weather. Temperature rising this week.
                </Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>

            {/* Low Priority Insight */}
            <View style={[styles.insightCard, styles.priorityLow]}>
              <View style={styles.iconContainer}>
                <Ionicons name="bar-chart-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Insight:</Text>
                <Text style={styles.insightDescription}>
                  Weekend sales are 25% higher. Plan inventory accordingly.
                </Text>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  priorityHigh: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  priorityMedium: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  priorityLow: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightText: {
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
