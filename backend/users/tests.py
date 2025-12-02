from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
from users.models import User


class UserModelTests(TestCase):
    def test_create_user(self):
        """Test creating a user with email and password"""
        user = User.objects.create_user(
            email='test@example.com',
            password='123456',
            user_type='retailer'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.user_type, 'retailer')
        self.assertFalse(user.is_verified)
        self.assertTrue(user.check_password('123456'))

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='123456'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_verified)

    def test_generate_verification_token(self):
        """Test verification token generation"""
        user = User.objects.create_user(
            email='test@example.com',
            password='123456'
        )
        user.generate_verification_token()
        self.assertIsNotNone(user.verification_token)
        self.assertTrue(len(user.verification_token) > 20)


class SignupAPITests(APITestCase):
    @patch('users.views.send_verification_email')
    def test_signup_success(self, mock_send_email):
        """Test successful user signup"""
        mock_send_email.return_value = True
        url = reverse('signup')
        data = {
            'email': 'newuser@example.com',
            'password': '123456',
            'user_type': 'retailer'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_signup_invalid_password(self):
        """Test signup with non-6-digit password"""
        url = reverse('signup')
        data = {
            'email': 'test@example.com',
            'password': '12345',  # Only 5 digits
            'user_type': 'retailer'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_signup_invalid_email(self):
        """Test signup with invalid email"""
        url = reverse('signup')
        data = {
            'email': 'invalid-email',
            'password': '123456',
            'user_type': 'retailer'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_duplicate_email(self):
        """Test signup with existing email"""
        # Create first user
        User.objects.create_user(
            email='existing@example.com',
            password='123456',
            user_type='retailer'
        )
        
        # Try to create duplicate
        url = reverse('signup')
        data = {
            'email': 'existing@example.com',
            'password': '654321',
            'user_type': 'supplier'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_invalid_user_type(self):
        """Test signup with invalid user type"""
        url = reverse('signup')
        data = {
            'email': 'test@example.com',
            'password': '123456',
            'user_type': 'invalid_type'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class EmailVerificationAPITests(APITestCase):
    def setUp(self):
        """Create a test user"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='123456',
            user_type='retailer'
        )
        self.user.generate_verification_token()
        self.user.save()

    def test_verify_email_success(self):
        """Test successful email verification"""
        url = reverse('verify_email')
        data = {'token': self.user.verification_token}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user from DB
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertIsNone(self.user.verification_token)

    def test_verify_email_invalid_token(self):
        """Test email verification with invalid token"""
        url = reverse('verify_email')
        data = {'token': 'invalid-token-12345'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('users.views.send_verification_email')
    def test_resend_verification_success(self, mock_send_email):
        """Test resending verification email"""
        mock_send_email.return_value = True
        url = reverse('resend_verification')
        data = {'email': self.user.email}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_resend_verification_nonexistent_email(self):
        """Test resending verification for non-existent email"""
        url = reverse('resend_verification')
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_resend_verification_already_verified(self):
        """Test resending verification for already verified user"""
        self.user.is_verified = True
        self.user.save()
        
        url = reverse('resend_verification')
        data = {'email': self.user.email}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
