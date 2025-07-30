# Update Doctor API Documentation

## Endpoint

```
POST /api/admin/update-doctor/:doctId
```

## Description

Updates an existing doctor's information. This endpoint allows admins to modify doctor details including personal information, professional credentials, and profile image.

## Authentication

Requires admin authentication via JWT token in the request header.

## Parameters

### Path Parameters
- `doctId` (string, required): The MongoDB ObjectId of the doctor to update

### Request Body (Form Data)
- `name` (string, required): Doctor's full name
- `email` (string, required): Doctor's email address
- `password` (string, optional): New password (leave empty to keep current)
- `speciality` (string, required): Medical speciality
- `degree` (string, required): Educational degree/qualification
- `experience` (string, required): Years or description of experience
- `about` (string, required): Professional bio/about section
- `fees` (number, required): Consultation fees
- `address` (JSON string, required): Address object in JSON format
- `image` (file, optional): New profile image (leave empty to keep current)

## Request Headers

```
Content-Type: multipart/form-data
token: <admin_jwt_token>
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Doctor updated successfully",
  "doctor": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Dr. John Smith",
    "email": "john.smith@example.com",
    "image": "https://res.cloudinary.com/example/image/upload/v1234567890/doctor.jpg",
    "speciality": "Cardiology",
    "degree": "MBBS, MD",
    "experience": "10 years",
    "about": "Experienced cardiologist with expertise in...",
    "available": true,
    "fees": 1500,
    "address": {
      "line1": "123 Medical Center",
      "line2": "Suite 456"
    },
    "date": "2023-09-05T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "All fields are required except password and image"
}
```

#### 400 Bad Request - Invalid Email
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### 400 Bad Request - Email Already Exists
```json
{
  "success": false,
  "message": "Email is already taken by another doctor"
}
```

#### 404 Not Found - Doctor Not Found
```json
{
  "success": false,
  "message": "Doctor not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Example Usage

### cURL Example

```bash
curl -X POST \
  http://localhost:4000/api/admin/update-doctor/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H 'token: your_admin_jwt_token' \
  -F 'name=Dr. John Smith' \
  -F 'email=john.smith@example.com' \
  -F 'speciality=Cardiology' \
  -F 'degree=MBBS, MD' \
  -F 'experience=10 years' \
  -F 'about=Experienced cardiologist with expertise in interventional cardiology' \
  -F 'fees=1500' \
  -F 'address={"line1":"123 Medical Center","line2":"Suite 456"}' \
  -F 'image=@/path/to/new-image.jpg'
```

### JavaScript/Fetch Example

```javascript
const formData = new FormData();
formData.append('name', 'Dr. John Smith');
formData.append('email', 'john.smith@example.com');
formData.append('speciality', 'Cardiology');
formData.append('degree', 'MBBS, MD');
formData.append('experience', '10 years');
formData.append('about', 'Experienced cardiologist with expertise in interventional cardiology');
formData.append('fees', '1500');
formData.append('address', JSON.stringify({
  line1: '123 Medical Center',
  line2: 'Suite 456'
}));

// Optional: Add new image
const imageFile = document.getElementById('imageInput').files[0];
if (imageFile) {
  formData.append('image', imageFile);
}

fetch('/api/admin/update-doctor/64f8a1b2c3d4e5f6a7b8c9d0', {
  method: 'POST',
  headers: {
    'token': 'your_admin_jwt_token'
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Doctor updated successfully:', data.doctor);
  } else {
    console.error('Error:', data.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Features

### Image Handling
- **Optional Update**: Image is optional during update
- **Cloudinary Integration**: New images are uploaded to Cloudinary
- **Old Image Cleanup**: Previous images are automatically deleted from Cloudinary
- **Secure URLs**: Returns secure HTTPS URLs for images

### Password Management
- **Optional Update**: Password is optional during update
- **Secure Hashing**: New passwords are hashed using bcrypt
- **Current Password Preservation**: If no new password provided, current password is retained

### Validation
- **Required Fields**: Validates all required fields except password and image
- **Email Format**: Validates email format using regex
- **Email Uniqueness**: Ensures email is not already taken by another doctor
- **Doctor Existence**: Verifies the doctor exists before updating

### Data Types
- **Number Conversion**: Automatically converts fees to number type
- **JSON Parsing**: Parses address from JSON string to object
- **MongoDB Validation**: Uses Mongoose validators for data integrity

## Security Considerations

1. **Authentication Required**: Only authenticated admins can update doctors
2. **Input Validation**: Comprehensive validation of all inputs
3. **Email Uniqueness**: Prevents duplicate email addresses
4. **Secure File Upload**: Images are processed through Cloudinary
5. **Password Security**: Passwords are hashed using bcrypt
6. **Error Handling**: Proper error responses without exposing sensitive information

## Notes

- The endpoint supports partial updates - only provide the fields you want to change
- Image and password are optional fields that can be omitted to keep current values
- The address field must be provided as a JSON string
- All other fields are required for a successful update
- The response includes the updated doctor object without the password field 