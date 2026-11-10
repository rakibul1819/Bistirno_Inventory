from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'developer@archstudio.pro',
            'first_name': 'Test',
            'last_name': 'Developer',
            'role': User.Role.ADMIN,
            'password': 'StrongPassword123!'
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, 'developer@archstudio.pro')
        self.assertTrue(user.check_password('StrongPassword123!'))
        self.assertEqual(user.role, User.Role.ADMIN)

