import requests
import json

# Test the specific technician assignment endpoint
base_url = "https://techgarage-app.preview.emergentagent.com"
api_base = f"{base_url}/api"

# Login as admin
login_data = {
    "email": "admin@polarizadosya.com",
    "password": "admin123"
}

print("🔐 Logging in as admin...")
response = requests.post(f"{api_base}/auth/login", json=login_data)
if response.status_code == 200:
    token = response.json()['access_token']
    print("✅ Login successful")
else:
    print(f"❌ Login failed: {response.status_code}")
    exit(1)

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# Get existing service orders
print("\n📋 Getting existing service orders...")
response = requests.get(f"{api_base}/service-orders", headers=headers)
if response.status_code == 200:
    orders = response.json()
    print(f"✅ Found {len(orders)} service orders")
    if orders:
        order_id = orders[0]['id']
        print(f"📝 Using order ID: {order_id}")
    else:
        print("❌ No service orders found")
        exit(1)
else:
    print(f"❌ Failed to get service orders: {response.status_code}")
    exit(1)

# Get technicians
print("\n👨‍🔧 Getting technicians...")
response = requests.get(f"{api_base}/users/technicians", headers=headers)
if response.status_code == 200:
    technicians = response.json()
    print(f"✅ Found {len(technicians)} technicians")
    if technicians:
        tech_id = technicians[0]['id']
        print(f"👤 Using technician ID: {tech_id}")
    else:
        print("❌ No technicians found")
        exit(1)
else:
    print(f"❌ Failed to get technicians: {response.status_code}")
    exit(1)

# Test technician assignment with JSON body
print(f"\n🔧 Testing technician assignment...")
assign_data = {"technician_id": tech_id}
response = requests.put(f"{api_base}/service-orders/{order_id}/assign", json=assign_data, headers=headers)

print(f"📤 Request URL: {api_base}/service-orders/{order_id}/assign")
print(f"📤 Request Body: {json.dumps(assign_data)}")
print(f"📥 Response Status: {response.status_code}")
print(f"📥 Response Body: {response.text}")

if response.status_code == 200:
    print("✅ Technician assignment successful!")
else:
    print(f"❌ Technician assignment failed: {response.status_code}")