from django.test import TestCase
from apps.customers.models import Customer, CustomerReview

class CustomerTestCase(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            client_code='CUS-001',
            full_name='Nazmul Hassan',
            company_name='Apex Holdings',
            client_type=Customer.ClientType.CORPORATE,
            email='nazmul@apexholdings.com',
            phone='+8801811112233'
        )

    def test_customer_creation(self):
        self.assertEqual(self.customer.client_code, 'CUS-001')
        self.assertEqual(self.customer.client_type, Customer.ClientType.CORPORATE)

    def test_customer_review(self):
        review = CustomerReview.objects.create(
            customer=self.customer,
            rating=5,
            title='Exceptional Architectural Design',
            comment='The studio delivered our modern duplex project with breathtaking precision!'
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(self.customer.reviews.count(), 1)

