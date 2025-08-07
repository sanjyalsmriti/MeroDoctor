# Backend Documentation - MeroDoctor API

## Overview

The **Backend API** is the core server application that handles all business logic, database operations, and provides RESTful endpoints for the frontend and admin applications. Built with Node.js, Express.js, and MongoDB, it serves as the central hub for all healthcare platform operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js Application                                     │
│  ├── Middleware Layer (CORS, Auth, Validation)             │
│  ├── Route Layer (API Endpoints)                           │
│  ├── Controller Layer (Business Logic)                     │
│  ├── Model Layer (Database Schema)                         │
│  └── Config Layer (Database, Cloudinary)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ├── MongoDB Database                                       │
│  ├── Cloudinary (Image Storage)                            │
│  └── Payment Gateways (Razorpay/Stripe)                    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.15.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 6.0.0
- **File Upload**: Multer 2.0.0
- **Image Storage**: Cloudinary 2.6.1
- **Validation**: validator 13.15.15
- **HTTP Client**: Axios 1.9.0
- **Crypto**: crypto-js 4.2.0
- **Utilities**: uuid 11.1.0

## Folder Structure

```
backend/
├── config/                 # Configuration files
│   ├── mongodb.js         # MongoDB connection
│   └── cloudinary.js      # Cloudinary configuration
├── controllers/           # Business logic handlers
│   ├── userController.js  # User operations
│   ├── doctorController.js # Doctor operations
│   ├── adminController.js # Admin operations
│   └── paymentController.js # Payment operations
├── middlewares/           # Custom middleware
│   ├── authUser.js        # User authentication
│   ├── authAdmin.js       # Admin authentication
│   └── multer.js          # File upload handling
├── models/                # Database schemas
│   ├── userModel.js       # User schema
│   ├── doctorModel.js     # Doctor schema
│   ├── appointmentModel.js # Appointment schema
│   └── paymentModel.js    # Payment schema
├── routes/                # API route definitions
│   ├── userRoute.js       # User endpoints
│   ├── doctorRoute.js     # Doctor endpoints
│   ├── adminRoute.js      # Admin endpoints
│   └── paymentRoute.js    # Payment endpoints
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## Core Components

### 1. Server Configuration (`server.js`)

**Purpose**: Main entry point that sets up the Express application, connects to external services, and mounts API routes.

**Key Features**:
- Express app initialization
- CORS configuration for cross-origin requests
- JSON body parsing middleware
- Health check endpoint (`/health`)
- Route mounting for different API modules

**How it works**:
1. Imports required modules and configurations
2. Initializes Express app with middleware
3. Connects to MongoDB and Cloudinary
4. Mounts API routes under `/api/{module}` paths
5. Starts server on specified port

### 2. Database Models

#### User Model (`models/userModel.js`)
**Purpose**: Defines the schema for patient/user accounts.

**Schema Fields**:
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password
- `image` (String, default): Profile image URL
- `address` (Object): Address with line1 and line2
- `gender` (String, default): User's gender
- `dob` (Date, nullable): Date of birth
- `phone` (String, default): Phone number

#### Doctor Model (`models/doctorModel.js`)
**Purpose**: Defines the schema for doctor profiles.

**Schema Fields**:
- `name` (String, required): Doctor's full name
- `email` (String, required, unique): Doctor's email
- `password` (String, required): Hashed password
- `image` (String, required): Profile image URL
- `speciality` (String, required): Medical specialty
- `degree` (String, required): Medical degree/qualification
- `experience` (String, required): Years of experience
- `about` (String, required): Doctor's bio
- `available` (Boolean, default: true): Availability status
- `fees` (Number, required): Appointment fee
- `address` (Object, required): Practice address
- `date` (Date, default): Profile creation date
- `slot_booked` (Object, default): Booked time slots

#### Appointment Model (`models/appointmentModel.js`)
**Purpose**: Defines the schema for appointment bookings.

**Schema Fields**:
- `userId` (String, required): Patient's user ID
- `docId` (String, required): Doctor's ID
- `slotDate` (Date, required): Appointment date
- `slotTime` (String, required): Appointment time
- `userData` (Object, required): User data snapshot
- `docData` (Object, required): Doctor data snapshot
- `amount` (Number, required): Appointment fee
- `date` (Date, default): Booking date
- `cancelled` (Boolean, default: false): Cancellation status
- `payment` (Boolean, default: false): Payment status
- `isCompleted` (Boolean, default: false): Completion status

#### Payment Model (`models/paymentModel.js`)
**Purpose**: Defines the schema for payment transactions.

**Schema Fields**:
- `userId` (String, required): User who made payment
- `appointmentId` (String, required): Associated appointment
- `amount` (Number, required): Payment amount
- `currency` (String, default: 'NPR'): Payment currency
- `paymentMethod` (String, required): Payment gateway used
- `status` (String, required): Payment status
- `transactionId` (String): Gateway transaction ID
- `date` (Date, default): Payment date

### 3. Controllers

#### User Controller (`controllers/userController.js`)
**Purpose**: Handles all user-related operations including authentication, profile management, and appointment booking.

**Key Functions**:
- `registerUser()`: User registration with password hashing
- `loginUser()`: User authentication with JWT token generation
- `getUserProfile()`: Retrieve user profile data
- `updateUserProfile()`: Update user information
- `uploadUserImage()`: Handle profile image upload to Cloudinary
- `getAllDoctors()`: Fetch all available doctors
- `getDoctorById()`: Get specific doctor details
- `bookAppointment()`: Create new appointment booking
- `getUserAppointments()`: Fetch user's appointment history

#### Admin Controller (`controllers/adminController.js`)
**Purpose**: Handles administrative operations including doctor management and appointment oversight.

**Key Functions**:
- `adminLogin()`: Admin authentication
- `addDoctor()`: Add new doctor to the system
- `getAllDoctors()`: Fetch all doctors for admin view
- `getAllAppointments()`: Get all appointments in the system
- `cancelAppointment()`: Cancel appointments by admin
- `getDashboardStats()`: Get platform statistics

#### Doctor Controller (`controllers/doctorController.js`)
**Purpose**: Handles doctor-specific operations and authentication.

**Key Functions**:
- `doctorLogin()`: Doctor authentication
- `getDoctorProfile()`: Retrieve doctor profile
- `updateDoctorProfile()`: Update doctor information

#### Payment Controller (`controllers/paymentController.js`)
**Purpose**: Handles payment processing and verification.

**Key Functions**:
- `createOrder()`: Create payment order with Razorpay
- `verifyPayment()`: Verify payment signature and update status
- `getPaymentHistory()`: Fetch payment records

### 4. Middleware

#### Authentication Middleware (`middlewares/authUser.js`, `middlewares/authAdmin.js`)
**Purpose**: Verify JWT tokens and authenticate requests.

**How it works**:
1. Extract token from request headers
2. Verify token using JWT secret
3. Attach user/admin data to request object
4. Allow/deny request based on authentication status

#### File Upload Middleware (`middlewares/multer.js`)
**Purpose**: Handle file uploads with size and type validation.

**Features**:
- Image file validation (jpg, jpeg, png)
- File size limits (5MB max)
- Temporary file storage
- Error handling for invalid uploads

### 5. Configuration

#### MongoDB Configuration (`config/mongodb.js`)
**Purpose**: Establish connection to MongoDB database.

**Features**:
- Connection string from environment variables
- Connection timeout settings
- Error handling and process exit on failure
- Success logging

#### Cloudinary Configuration (`config/cloudinary.js`)
**Purpose**: Configure Cloudinary for image storage.

**Features**:
- API credentials from environment variables
- Secure connection configuration
- Success logging

## API Endpoints

### Authentication Endpoints

#### User Registration
```
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "1234567890"
}
```

#### User Login
```
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Admin Login
```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@merodoctor.com",
  "password": "adminpassword"
}
```

### User Management Endpoints

#### Get User Profile
```
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

#### Update User Profile
```
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "address": {
    "line1": "123 Main St",
    "line2": "Apt 4B"
  }
}
```

#### Upload Profile Image
```
POST /api/user/upload-image
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
```

### Doctor Management Endpoints

#### Get All Doctors
```
GET /api/user/doctors
```

#### Get Doctor by ID
```
GET /api/user/doctors/:id
```

#### Add Doctor (Admin Only)
```
POST /api/admin/add-doctor
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data

Form Data:
- name: "Dr. Smith"
- email: "smith@hospital.com"
- password: "doctorpass"
- image: <file>
- speciality: "Cardiology"
- degree: "MBBS, MD"
- experience: "10 years"
- about: "Experienced cardiologist"
- fees: 1500
- address: {"line1": "Hospital Address"}
```

### Appointment Management Endpoints

#### Book Appointment
```
POST /api/user/book-appointment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "docId": "doctor_id_here",
  "slotDate": "2024-01-15",
  "slotTime": "10:00 AM"
}
```

#### Get User Appointments
```
GET /api/user/appointments
Authorization: Bearer <jwt_token>
```

#### Get All Appointments (Admin Only)
```
GET /api/admin/appointments
Authorization: Bearer <admin_jwt_token>
```

#### Cancel Appointment (Admin Only)
```
PUT /api/admin/cancel-appointment
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "appointmentId": "appointment_id_here"
}
```

### Payment Endpoints

#### Create Payment Order
```
POST /api/payment/create-order
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "appointmentId": "appointment_id_here",
  "amount": 1500
}
```

#### Verify Payment
```
POST /api/payment/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

## Error Handling

The API implements comprehensive error handling:

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Doctor, Admin)
- Password hashing with bcrypt
- Token expiration handling

### Data Validation
- Input sanitization and validation
- File type and size validation
- Email format validation
- Required field validation

### File Upload Security
- File type restrictions (images only)
- File size limits
- Secure file storage on Cloudinary
- Temporary file cleanup

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secure_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Development Setup

### Prerequisites
- Node.js 20+
- MongoDB database
- Cloudinary account
- Payment gateway accounts

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Testing the API
```bash
# Health check
curl http://localhost:4000/health

# Test user registration
curl -X POST http://localhost:4000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Performance Considerations

### Database Optimization
- Index on frequently queried fields (email, userId, docId)
- Efficient query patterns
- Connection pooling

### API Optimization
- Response caching where appropriate
- Pagination for large datasets
- Image compression and optimization
- Efficient error handling

## Monitoring & Logging

### Current Implementation
- Console logging for development
- Error logging with stack traces
- Request/response logging

### Production Recommendations
- Structured logging (Winston/Bunyan)
- Request ID tracking
- Performance monitoring
- Error tracking (Sentry)

## Deployment

### Production Checklist
- [ ] Set all environment variables
- [ ] Configure MongoDB production connection
- [ ] Set up Cloudinary production account
- [ ] Configure payment gateway production keys
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure monitoring and logging

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGO_URI environment variable
   - Verify MongoDB service is running
   - Check network connectivity

2. **Cloudinary Upload Failed**
   - Verify Cloudinary credentials
   - Check file size and type
   - Ensure proper file format

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

4. **Payment Gateway Errors**
   - Verify Razorpay credentials
   - Check payment amount limits
   - Validate webhook signatures

## API Versioning

Currently using version 1 of the API. For future updates:
- Consider implementing `/api/v2/` endpoints
- Maintain backward compatibility
- Document breaking changes

---

*This documentation covers the complete backend architecture and implementation. For specific implementation details, refer to the individual source files.* 