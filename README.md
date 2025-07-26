# MeroDoctor - Complete Developer Documentation

## Project Overview

**MeroDoctor** is a comprehensive healthcare platform that connects patients with doctors for online appointments. The system consists of three main applications:

1. **Frontend** - Patient-facing web application
2. **Admin Panel** - Administrative dashboard for managing doctors and appointments
3. **Backend API** - RESTful API server handling all business logic

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │   Backend API   │
│   (Patient UI)  │    │   (Admin UI)    │    │   (Node.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      MongoDB Database     │
                    │      Cloudinary Storage   │
                    └───────────────────────────┘
```

## Technology Stack

### Frontend & Admin Panel
- **Framework**: React.js 19.1.0
- **Routing**: React Router DOM 7.6.0
- **Styling**: Tailwind CSS 4.1.6
- **HTTP Client**: Axios 1.9.0
- **Notifications**: React Toastify 11.0.5
- **Build Tool**: Vite 6.3.5

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.15.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 6.0.0
- **File Upload**: Multer 2.0.0
- **Image Storage**: Cloudinary 2.6.1
- **Validation**: validator 13.15.15

## Key Features

### For Patients (Frontend)
- User registration and authentication
- Browse doctors by specialty
- Book appointments with available doctors
- View appointment history
- Profile management
- Payment integration (Razorpay/Stripe)

### For Administrators (Admin Panel)
- Admin authentication
- Add and manage doctors
- View all appointments
- Cancel appointments
- Dashboard with statistics
- Doctor availability management

### For Doctors
- Doctor registration and authentication
- Profile management
- Appointment management
- Availability settings

## Data Models

### Core Entities
1. **User** - Patient profiles and authentication
2. **Doctor** - Doctor profiles, specialties, and availability
3. **Appointment** - Booking records with payment status
4. **Payment** - Transaction records and status

## API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/doctor/login` - Doctor login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload-image` - Upload profile image

### Doctor Management
- `GET /api/user/doctors` - Get all doctors
- `GET /api/user/doctors/:id` - Get specific doctor
- `POST /api/admin/add-doctor` - Add new doctor (admin only)
- `GET /api/admin/doctors` - Get all doctors (admin only)

### Appointment Management
- `POST /api/user/book-appointment` - Book appointment
- `GET /api/user/appointments` - Get user appointments
- `GET /api/admin/appointments` - Get all appointments (admin only)
- `PUT /api/admin/cancel-appointment` - Cancel appointment (admin only)

### Payment
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## Getting Started

### Prerequisites
- Node.js 20+ 
- MongoDB database
- Cloudinary account
- Payment gateway accounts (Razorpay/Stripe)

### Environment Variables

#### Backend (.env)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```
#### ESEWA TEST CREDENTIALS
eSewa ID: 9806800001/2/3/4/5
Password: Nepal@123
MPIN: 1122 (for application only)
Merchant ID/Service Code: EPAYTEST
Token:123456

#### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:4000
```

#### Admin (.env)
```
VITE_BACKEND_URL=http://localhost:4000
```

### Installation & Running

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Admin Panel Setup**
   ```bash
   cd admin
   npm install
   npm run dev
   ```

## Development Guidelines

### Code Structure
- Follow ES6+ syntax
- Use meaningful variable and function names
- Include JSDoc comments for complex functions
- Implement proper error handling
- Use environment variables for configuration

### Security Considerations
- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation on all endpoints
- CORS configuration for cross-origin requests
- Secure file upload with size and type validation

### Database Design
- MongoDB with Mongoose ODM
- Proper indexing on frequently queried fields
- Data validation at schema level
- Referential integrity through application logic

## Deployment

### Backend Deployment
- Use PM2 or similar process manager
- Set up environment variables
- Configure MongoDB connection
- Set up Cloudinary credentials

### Frontend/Admin Deployment
- Build for production using `npm run build`
- Serve static files using nginx or similar
- Configure API endpoint URLs for production

## Monitoring & Maintenance

### Logging
- Console logging for development
- Consider structured logging for production
- Monitor API response times
- Track error rates

### Performance
- Database query optimization
- Image compression and optimization
- API response caching where appropriate
- CDN for static assets

## Support & Contributing

For questions or contributions, please refer to the individual folder documentation or contact the development team.

---

*This documentation is maintained as part of the MeroDoctor project.* 