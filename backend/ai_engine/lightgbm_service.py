"""
LightGBM-based Demand Forecasting Service
Advanced ML model for accurate demand prediction
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Avg, Count
import lightgbm as lgb
import pickle
import os
from pathlib import Path

from products.models import Product
from sales.models import DailySale
from orders.models import OrderItem


class LightGBMForecastService:
    """
    LightGBM-based demand forecasting service
    Uses historical sales data to predict future demand with high accuracy
    """
    
    def __init__(self):
        self.model_dir = Path(__file__).parent / 'models'
        self.model_dir.mkdir(exist_ok=True)
        
        # LightGBM parameters optimized for time series forecasting
        self.params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'min_data_in_leaf': 5,
            'max_depth': 8,
        }
    
    def get_sales_data(self, product_id: int, retailer_id: int, days: int = 90) -> pd.DataFrame:
        """
        Fetch and prepare sales data for a specific product and retailer
        
        Args:
            product_id: Product ID
            retailer_id: Retailer ID
            days: Number of days of historical data
            
        Returns:
            DataFrame with date and sales quantity
        """
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        # Get daily sales data
        sales = DailySale.objects.filter(
            retailer_id=retailer_id,
            product_id=product_id,
            sale_date__gte=cutoff_date
        ).values('sale_date').annotate(
            quantity=Sum('quantity_sold'),
            revenue=Sum('total_amount')
        ).order_by('sale_date')
        
        # Convert to DataFrame
        if not sales:
            return pd.DataFrame(columns=['date', 'quantity', 'revenue'])
        
        df = pd.DataFrame(list(sales))
        df['date'] = pd.to_datetime(df['sale_date'])
        df = df.drop('sale_date', axis=1)
        
        # Convert Decimal to float
        df['quantity'] = df['quantity'].astype(float)
        df['revenue'] = df['revenue'].astype(float)
        
        # Fill missing dates with 0 sales
        date_range = pd.date_range(start=cutoff_date, end=timezone.now().date(), freq='D')
        df = df.set_index('date').reindex(date_range, fill_value=0).reset_index()
        df.columns = ['date', 'quantity', 'revenue']
        
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create time series features from raw sales data
        
        Features include:
        - Day of week, month, quarter
        - Lag features (previous days)
        - Rolling statistics (moving averages)
        - Trend features
        """
        df = df.copy()
        
        # Date features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
        df['is_month_end'] = df['date'].dt.is_month_end.astype(int)
        
        # Lag features (previous days' sales)
        for lag in [1, 2, 3, 7, 14, 21, 28]:
            df[f'lag_{lag}'] = df['quantity'].shift(lag)
        
        # Rolling window statistics
        for window in [3, 7, 14, 21, 30]:
            df[f'rolling_mean_{window}'] = df['quantity'].rolling(window=window, min_periods=1).mean()
            df[f'rolling_std_{window}'] = df['quantity'].rolling(window=window, min_periods=1).std()
            df[f'rolling_max_{window}'] = df['quantity'].rolling(window=window, min_periods=1).max()
            df[f'rolling_min_{window}'] = df['quantity'].rolling(window=window, min_periods=1).min()
        
        # Trend features
        df['trend'] = range(len(df))
        
        # Revenue per unit (price indicator)
        df['price_per_unit'] = df['revenue'] / (df['quantity'] + 1)  # +1 to avoid division by zero
        
        # Fill NaN values with 0 (from lag features at the beginning)
        df = df.fillna(0)
        
        return df
    
    def train_model(self, product_id: int, retailer_id: int, days: int = 90) -> Optional[lgb.Booster]:
        """
        Train a LightGBM model for demand forecasting
        
        Args:
            product_id: Product ID
            retailer_id: Retailer ID
            days: Number of days of historical data to use
            
        Returns:
            Trained LightGBM model or None if insufficient data
        """
        # Get sales data
        df = self.get_sales_data(product_id, retailer_id, days)
        
        if len(df) < 14:  # Need at least 2 weeks of data
            return None
        
        # Engineer features
        df = self.engineer_features(df)
        
        # Prepare features and target
        feature_cols = [col for col in df.columns if col not in ['date', 'quantity', 'revenue']]
        X = df[feature_cols].values
        y = df['quantity'].values
        
        # Split: use last 7 days as validation
        split_idx = len(df) - 7
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        # Create LightGBM datasets
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        # Train model
        model = lgb.train(
            self.params,
            train_data,
            num_boost_round=100,
            valid_sets=[train_data, val_data],
            callbacks=[lgb.early_stopping(stopping_rounds=10, verbose=False)]
        )
        
        # Save model
        model_path = self.model_dir / f'model_r{retailer_id}_p{product_id}.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump({'model': model, 'features': feature_cols}, f)
        
        return model
    
    def predict_demand(
        self, 
        product_id: int, 
        retailer_id: int, 
        forecast_days: int = 30,
        retrain: bool = False
    ) -> Dict[str, Any]:
        """
        Predict future demand using LightGBM
        
        Args:
            product_id: Product ID
            retailer_id: Retailer ID
            forecast_days: Number of days to forecast
            retrain: Whether to retrain the model
            
        Returns:
            Dictionary with forecast data and recommendations
        """
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return {'error': 'Product not found'}
        
        # Load or train model
        model_path = self.model_dir / f'model_r{retailer_id}_p{product_id}.pkl'
        
        if retrain or not model_path.exists():
            model = self.train_model(product_id, retailer_id)
            if model is None:
                return {
                    'error': 'Insufficient data',
                    'message': 'Need at least 14 days of sales history for accurate predictions'
                }
        
        # Load model
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
            model = model_data['model']
            feature_cols = model_data['features']
        
        # Get historical data
        df = self.get_sales_data(product_id, retailer_id, days=90)
        df = self.engineer_features(df)
        
        # Generate future predictions
        predictions = []
        last_date = df['date'].max()
        
        for i in range(forecast_days):
            # Prepare features for next day
            next_date = last_date + timedelta(days=i+1)
            
            # Create a row with the next date
            next_row = pd.DataFrame([{
                'date': next_date,
                'quantity': 0,  # Placeholder
                'revenue': 0    # Placeholder
            }])
            
            # Append to dataframe
            temp_df = pd.concat([df, next_row], ignore_index=True)
            temp_df = self.engineer_features(temp_df)
            
            # Get features for prediction
            X_pred = temp_df[feature_cols].iloc[-1:].values
            
            # Predict
            pred = model.predict(X_pred)[0]
            pred = max(0, pred)  # Ensure non-negative
            
            predictions.append({
                'date': next_date.strftime('%Y-%m-%d'),
                'predicted_demand': round(pred, 2)
            })
            
            # Update temp dataframe with prediction for next iteration
            df = pd.concat([df, pd.DataFrame([{
                'date': next_date,
                'quantity': pred,
                'revenue': pred * df['price_per_unit'].mean()
            }])], ignore_index=True)
        
        # Calculate statistics
        total_predicted = sum(p['predicted_demand'] for p in predictions)
        avg_daily = total_predicted / forecast_days
        
        # Historical statistics
        historical_avg = df['quantity'].tail(30).mean()
        current_stock = int(historical_avg * 20)  # Estimate shop stock
        
        # Trend analysis
        trend = 'increasing' if avg_daily > historical_avg * 1.1 else \
                'decreasing' if avg_daily < historical_avg * 0.9 else 'stable'
        
        # Confidence based on model performance
        confidence = self._calculate_confidence(df, model, feature_cols)
        
        # Recommendations
        reorder_quantity = max(int(total_predicted - current_stock), 0)
        urgency = 'urgent' if current_stock < avg_daily * 7 else \
                  'soon' if current_stock < avg_daily * 14 else 'normal'
        
        return {
            'product_id': product_id,
            'product_name': product.name,
            'current_price': float(product.price),
            'forecast_period_days': forecast_days,
            'generated_at': timezone.now().isoformat(),
            'predictions': predictions,
            'forecast_summary': {
                'predicted_total_demand': round(total_predicted, 2),
                'predicted_daily_average': round(avg_daily, 2),
                'confidence_level': confidence,
                'trend': trend
            },
            'current_shop_stock': current_stock,
            'avg_daily_sales': round(historical_avg, 2),
            'recommendations': {
                'should_reorder': reorder_quantity > 0,
                'suggested_order_quantity': reorder_quantity,
                'reorder_urgency': urgency,
                'estimated_stockout_date': self._estimate_stockout_date(current_stock, avg_daily),
                'risk_assessment': 'high' if urgency == 'urgent' else 'medium' if urgency == 'soon' else 'low'
            },
            'model_info': {
                'algorithm': 'LightGBM',
                'training_data_days': len(df),
                'features_used': len(feature_cols),
                'last_trained': datetime.fromtimestamp(model_path.stat().st_mtime).isoformat() if model_path.exists() else None
            }
        }
    
    def _calculate_confidence(self, df: pd.DataFrame, model: lgb.Booster, features: List[str]) -> str:
        """Calculate confidence level based on historical prediction accuracy"""
        if len(df) < 14:
            return 'low'
        
        # Use last 7 days for validation
        X_val = df[features].tail(7).values
        y_val = df['quantity'].tail(7).values
        
        predictions = model.predict(X_val)
        
        # Calculate MAPE (Mean Absolute Percentage Error)
        mape = np.mean(np.abs((y_val - predictions) / (y_val + 1))) * 100
        
        if mape < 15:
            return 'high'
        elif mape < 30:
            return 'medium'
        else:
            return 'low'
    
    def _estimate_stockout_date(self, current_stock: int, daily_demand: float) -> Optional[str]:
        """Estimate when stock will run out"""
        if daily_demand <= 0:
            return None
        
        days_remaining = int(current_stock / daily_demand)
        stockout_date = timezone.now() + timedelta(days=days_remaining)
        
        return stockout_date.strftime('%Y-%m-%d')
    
    def batch_forecast(self, retailer_id: int, product_ids: List[int], forecast_days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate forecasts for multiple products at once
        
        Args:
            retailer_id: Retailer ID
            product_ids: List of product IDs
            forecast_days: Days to forecast
            
        Returns:
            List of forecast results
        """
        results = []
        
        for product_id in product_ids:
            try:
                forecast = self.predict_demand(product_id, retailer_id, forecast_days)
                results.append(forecast)
            except Exception as e:
                results.append({
                    'product_id': product_id,
                    'error': str(e)
                })
        
        return results
    
    def get_model_importance(self, product_id: int, retailer_id: int) -> Dict[str, float]:
        """Get feature importance from trained model"""
        model_path = self.model_dir / f'model_r{retailer_id}_p{product_id}.pkl'
        
        if not model_path.exists():
            return {}
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
            model = model_data['model']
            features = model_data['features']
        
        importance = model.feature_importance(importance_type='gain')
        
        return dict(zip(features, importance.tolist()))
    
    def analyze_all_products(self, retailer_id: int, forecast_days: int = 30, top_n: int = 10) -> Dict[str, Any]:
        """
        Analyze all products for a retailer and provide smart recommendations
        
        Args:
            retailer_id: Retailer ID
            forecast_days: Days to forecast ahead
            top_n: Number of top products to highlight
            
        Returns:
            Comprehensive analysis with rankings and recommendations
        """
        from orders.models import OrderItem
        
        # Get all unique products that retailer has ever purchased
        purchased_products = OrderItem.objects.filter(
            order__retailer_id=retailer_id,
            order__status__in=['pending', 'confirmed', 'processing', 'shipped', 'delivered']
        ).values_list('product_id', flat=True).distinct()
        
        if not purchased_products:
            return {
                'error': 'No products found',
                'message': 'Retailer has no purchase history'
            }
        
        # Get product details with current stock from orders
        from django.db.models import Sum
        products_with_stock = OrderItem.objects.filter(
            order__retailer_id=retailer_id,
            product_id__in=purchased_products
        ).values('product_id', 'product__name', 'product__price').annotate(
            total_ordered=Sum('quantity')
        )
        
        all_products_analysis = []
        high_demand_products = []
        reorder_needed = []
        low_stock_critical = []
        
        # Analyze each product
        for item in products_with_stock:
            product_id = item['product_id']
            
            try:
                # Get sales history
                sales_data = self.get_sales_data(product_id, retailer_id, days=90)
                
                # Skip if insufficient data
                if len(sales_data) < 14:
                    continue
                
                # Generate forecast
                forecast = self.predict_demand(
                    product_id=product_id,
                    retailer_id=retailer_id,
                    forecast_days=forecast_days,
                    retrain=False
                )
                
                # Calculate demand score (higher = more demandable)
                predicted_total = forecast['forecast_summary']['predicted_total_demand']
                daily_avg = forecast['forecast_summary']['predicted_daily_average']
                confidence = forecast['forecast_summary']['confidence_level']
                current_stock = forecast.get('current_shop_stock', 0)
                
                # Confidence scoring
                confidence_score = {
                    'high': 1.0,
                    'medium': 0.7,
                    'low': 0.4
                }.get(confidence, 0.5)
                
                # Calculate demand score (0-100)
                # Adaptive scoring for both high and low volume products
                # Uses logarithmic scaling to handle wide range of sales volumes
                
                # Base calculation with adaptive multiplier
                if daily_avg >= 10:
                    # High volume: 10+ units/day
                    base_score = 50 + (daily_avg - 10) * 2
                elif daily_avg >= 1:
                    # Medium volume: 1-10 units/day
                    base_score = 20 + (daily_avg * 30)
                else:
                    # Low volume: < 1 unit/day (your case)
                    base_score = daily_avg * 100  # 0.18 * 100 = 18
                
                # Apply multipliers
                reorder_multiplier = 1.5 if forecast['recommendations']['should_reorder'] else 1.0
                trend_multiplier = {
                    'increasing': 1.3,
                    'stable': 1.0,
                    'decreasing': 0.7
                }.get(forecast['forecast_summary']['trend'], 1.0)
                
                # Final score with confidence
                demand_score = min(100, int(
                    base_score * confidence_score * reorder_multiplier * trend_multiplier
                ))
                
                # Calculate urgency score (0-100)
                days_until_stockout = 365  # Default if no stockout
                if forecast['recommendations']['estimated_stockout_date']:
                    from datetime import datetime
                    stockout_date = datetime.strptime(
                        forecast['recommendations']['estimated_stockout_date'],
                        '%Y-%m-%d'
                    )
                    days_until_stockout = (stockout_date - datetime.now()).days
                
                urgency_score = max(0, min(100, int(100 - (days_until_stockout * 2))))
                
                # Compile product analysis
                product_analysis = {
                    'product_id': product_id,
                    'product_name': item['product__name'],
                    'supplier_name': forecast.get('supplier_name', 'Unknown'),
                    'current_stock': current_stock,
                    'unit_price': float(item['product__price']),
                    'demand_score': demand_score,
                    'urgency_score': urgency_score,
                    'predicted_demand_30d': round(predicted_total, 2),
                    'daily_avg_demand': round(daily_avg, 2),
                    'confidence_level': confidence,
                    'should_reorder': forecast['recommendations']['should_reorder'],
                    'suggested_order_qty': forecast['recommendations']['suggested_order_quantity'],
                    'estimated_stockout_date': forecast['recommendations']['estimated_stockout_date'],
                    'days_until_stockout': days_until_stockout,
                    'reorder_urgency': forecast['recommendations']['reorder_urgency'],
                    'trend': forecast['forecast_summary']['trend']
                }
                
                all_products_analysis.append(product_analysis)
                
                # Categorize products
                # High demand: Products with demand_score >= 20 (relative to retailer's sales volume)
                if demand_score >= 20:
                    high_demand_products.append(product_analysis)
                
                if forecast['recommendations']['should_reorder']:
                    reorder_needed.append(product_analysis)
                
                if urgency_score >= 70:
                    low_stock_critical.append(product_analysis)
                
            except Exception as e:
                # Skip products with errors
                continue
        
        # Sort by demand score (highest first)
        all_products_analysis.sort(key=lambda x: x['demand_score'], reverse=True)
        high_demand_products.sort(key=lambda x: x['demand_score'], reverse=True)
        reorder_needed.sort(key=lambda x: x['urgency_score'], reverse=True)
        low_stock_critical.sort(key=lambda x: x['days_until_stockout'])
        
        # Calculate summary statistics
        total_analyzed = len(all_products_analysis)
        avg_demand_score = sum(p['demand_score'] for p in all_products_analysis) / total_analyzed if total_analyzed > 0 else 0
        total_reorder_value = sum(
            p['suggested_order_qty'] * p['unit_price'] 
            for p in reorder_needed
        )
        
        # Build response
        return {
            'retailer_id': retailer_id,
            'analysis_date': timezone.now().isoformat(),
            'forecast_period_days': forecast_days,
            'summary': {
                'total_products_analyzed': total_analyzed,
                'high_demand_products_count': len(high_demand_products),
                'products_need_reorder': len(reorder_needed),
                'critical_low_stock_count': len(low_stock_critical),
                'average_demand_score': round(avg_demand_score, 2),
                'total_reorder_value': round(total_reorder_value, 2),
                'currency': 'BDT'
            },
            'top_demand_products': high_demand_products[:top_n],
            'reorder_recommendations': reorder_needed[:20],  # Top 20 urgent
            'low_stock_alerts': low_stock_critical[:10],  # Top 10 critical
            'all_products': all_products_analysis,
            'insights': {
                'highest_demand_product': all_products_analysis[0] if all_products_analysis else None,
                'most_urgent_reorder': reorder_needed[0] if reorder_needed else None,
                'most_critical_stock': low_stock_critical[0] if low_stock_critical else None,
                'recommendation': self._generate_smart_recommendation(
                    high_demand_products,
                    reorder_needed,
                    low_stock_critical
                )
            }
        }
    
    def _generate_smart_recommendation(self, high_demand, reorder_needed, low_stock) -> str:
        """Generate human-readable recommendation"""
        recommendations = []
        
        if len(low_stock) > 0:
            recommendations.append(
                f"🚨 URGENT: {len(low_stock)} products critically low on stock. Immediate action required!"
            )
        
        if len(reorder_needed) > 0:
            recommendations.append(
                f"📦 {len(reorder_needed)} products need reordering to maintain optimal inventory levels."
            )
        
        if len(high_demand) > 0:
            top_product = high_demand[0]
            recommendations.append(
                f"⭐ Top performer: '{top_product['product_name']}' with demand score {top_product['demand_score']}/100."
            )
        
        if not recommendations:
            recommendations.append("✅ All products have sufficient stock. Inventory levels are optimal!")
        
        return ' '.join(recommendations)



# Singleton instance
lightgbm_service = LightGBMForecastService()
