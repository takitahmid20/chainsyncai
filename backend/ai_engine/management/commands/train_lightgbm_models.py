"""
Train LightGBM models for all retailer-product combinations
Usage: python manage.py train_lightgbm_models
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from sales.models import DailySale
from ai_engine.lightgbm_service import lightgbm_service

User = get_user_model()


class Command(BaseCommand):
    help = 'Train LightGBM models for demand forecasting'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retailer-id',
            type=int,
            help='Train models for specific retailer only'
        )
        parser.add_argument(
            '--min-sales',
            type=int,
            default=14,
            help='Minimum number of sales records required (default: 14)'
        )

    def handle(self, *args, **options):
        retailer_id = options.get('retailer_id')
        min_sales = options.get('min_sales')

        # Get retailers
        if retailer_id:
            retailers = User.objects.filter(id=retailer_id, user_type='retailer')
        else:
            retailers = User.objects.filter(user_type='retailer')

        if not retailers.exists():
            self.stdout.write(self.style.ERROR('No retailers found'))
            return

        total_trained = 0
        total_skipped = 0

        for retailer in retailers:
            self.stdout.write(f"\nProcessing retailer: {retailer.email} (ID: {retailer.id})")

            # Get products with sales for this retailer
            product_ids = DailySale.objects.filter(
                retailer_id=retailer.id
            ).values_list('product_id', flat=True).distinct()

            for product_id in product_ids:
                # Check if enough data
                sales_count = DailySale.objects.filter(
                    retailer_id=retailer.id,
                    product_id=product_id
                ).count()

                if sales_count < min_sales:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  Skipping product {product_id}: Only {sales_count} sales records"
                        )
                    )
                    total_skipped += 1
                    continue

                try:
                    # Train model
                    self.stdout.write(f"  Training model for product {product_id}...")
                    model = lightgbm_service.train_model(product_id, retailer.id)

                    if model:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"  ✓ Successfully trained model for product {product_id}"
                            )
                        )
                        total_trained += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  ✗ Failed to train model for product {product_id}"
                            )
                        )
                        total_skipped += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"  ✗ Error training product {product_id}: {str(e)}"
                        )
                    )
                    total_skipped += 1

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(
            self.style.SUCCESS(
                f"Training complete: {total_trained} models trained, {total_skipped} skipped"
            )
        )
