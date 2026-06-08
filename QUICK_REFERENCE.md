# QR Code Item Registration - Quick Start Guide

## 🎯 What's New

### Two-Step Registration Process

#### Step 1: Agent Issues QR Code
- Agent scans a physical QR code label
- Agent enters basic item information
- Agent submits - generates a QR code

#### Step 2: User Registers Item Details  
- User navigates to "Register New Item"
- User uploads their profile photo (for security)
- User uploads item photo (optional, for identification)
- User provides contact information
- User submits - item is fully registered

### Public QR Code Display
- Anyone can scan the QR code and view item details
- No login required
- Shows owner information and photo
- Provides quick contact options

---

## 📱 User Journey

### For Item Owners

**1. Register Your Item**
```
Dashboard → Register Item Button → Fill Form → Upload Photo → Submit
```

**Form Fields:**
- QR Code (scanned or simulated)
- Item Name & Description
- Your Full Name
- Your Email
- Your Phone Number
- Your Address
- Your Profile Photo ⭐ (for verification)
- Item Photo (optional)

**2. View Your Registered Items**
```
Dashboard → My Items → View all registered items with photos
```

**Features:**
- See all your items
- View photos
- Check registration date
- Click "View Public Page" to see what finders see

---

### For Finders (Public)

**1. Found an Item?**
```
Scan QR Code → View Item & Owner Details → Contact Owner
```

**Information Displayed:**
- ✅ Item Name & Photo
- ✅ Item Description
- ✅ Owner's Name & Photo
- ✅ Owner's Email
- ✅ Owner's Phone
- ✅ Owner's Address
- ✅ Registration Timestamp

**Quick Actions:**
- 📧 Send Email
- 📞 Call Owner
- 🖨️ Print Details

---

## 🔐 Security Features

### Why We Save Your Photo
- ✅ Verification of ownership
- ✅ Trust between finder and owner
- ✅ Item returned to correct person
- ✅ Recorded registration timestamp

### Data Storage
- Profile photos stored securely in storage
- Item photos optional
- All data encrypted in database
- Timestamps logged for audit trail

---

## 🔗 API Endpoints

### Registration (POST)
```
POST /api/qr-codes
Content-Type: multipart/form-data

{
  "qr_code": "QR123456789",
  "item_name": "Laptop",
  "item_description": "MacBook Pro 13 inch",
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+1234567890",
  "address": "123 Main St, City, State",
  "user_image": <FILE>,
  "item_image": <FILE>
}
```

### View Item (GET - Public)
```
GET /api/qr-codes/public/view/{id}

Response:
{
  "id": 1,
  "qr_code": "QR123456789",
  "item_name": "Laptop",
  "item_description": "MacBook Pro",
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+1234567890",
  "address": "123 Main St",
  "user_image_path": "qr-codes/users/123.jpg",
  "item_image_path": "qr-codes/items/456.jpg",
  "registration_timestamp": "2026-06-08T23:38:44Z",
  "status": "active",
  "created_at": "2026-06-08T23:38:44Z"
}
```

---

## 📸 Photo Requirements

### User Profile Photo
- **Format**: JPEG, PNG, JPG, GIF
- **Max Size**: 2MB
- **Purpose**: Owner verification

### Item Photo
- **Format**: JPEG, PNG, JPG, GIF
- **Max Size**: 2MB
- **Purpose**: Item identification (optional)

---

## ✨ Features at a Glance

| Feature | User | Finder | Agent | Admin |
|---------|------|--------|-------|-------|
| Register Item | ✅ | ❌ | ❌ | ✅ |
| Issue QR Code | ❌ | ❌ | ✅ | ✅ |
| View Item Details | ✅ | ✅ | ✅ | ✅ |
| Upload Profile Photo | ✅ | ❌ | ❌ | ✅ |
| View Public Page | ✅ | ✅ | ✅ | ✅ |
| Contact Owner | ✅ | ✅ | ✅ | ✅ |
| Manage Items | ✅ | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Step 1: Build Frontend
```bash
npm run build
```

### Step 2: Run Migrations
```bash
php artisan migrate
```

### Step 3: Start Application
```bash
php artisan serve
npm run dev  # In another terminal for hot reload
```

### Step 4: Test
1. Create a user account
2. Navigate to "/register-item"
3. Scan or simulate QR code
4. Fill form with test data
5. Upload a test image
6. Submit
7. View item in "My Items"
8. Click "View Public Page"
9. Test contact buttons

---

## 📞 Support

### Common Issues

**Q: Images not showing?**
A: Run `php artisan storage:link`

**Q: Form validation errors?**
A: Check image size (max 2MB) and format (jpeg, png, jpg, gif)

**Q: QR code not generating?**
A: Check if image field was filled correctly

---

## 🎁 Benefits

✅ **For Owners**
- Peace of mind that lost items can be returned
- Verification through personal photo
- Timestamp records
- Multiple contact options

✅ **For Finders**
- Easy identification of owner
- Multiple ways to contact
- Print for records
- Item photo reference

✅ **For Agents**
- Simple QR code generation
- Track registered items
- Audit trail with timestamps

---

**Ready to get started?** 🚀

Visit `/register-item` to register your first item!
