import requests
import json

url = "http://localhost:8000/api/payment-terms/"
data = {
    "name": "Net 45 Early",
    "due_days": 45,
    "is_first_payment_discount": True,
    "discount_percentage": "15.00"
}
response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")
