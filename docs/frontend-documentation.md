# Frontend Documentation - MeroDoctor Patient Portal

## Overview

The **Frontend Application** is the patient-facing web interface of the MeroDoctor healthcare platform. Built with React.js and Tailwind CSS, it provides an intuitive and responsive user experience for patients to browse doctors, book appointments, manage their profiles, and handle payments.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                     │
├─────────────────────────────────────────────────────────────┤
│  React.js Application                                       │
│  ├── App.jsx (Main Router)                                  │
│  ├── Context (State Management)                             │
│  ├── Pages (Route Components)                               │
│  ├── Components (Reusable UI)                               │
│  ├── Assets (Images, Icons)                                 │
│  └── Styles (Tailwind CSS)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
│  ├── Authentication                                         │
│  ├── Doctor Management                                      │
│  ├── Appointment Booking                                    │
│  └── Payment Processing                                     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Framework**: React.js 19.1.0
- **Routing**: React Router DOM 7.6.0
- **Styling**: Tailwind CSS 4.1.6
- **HTTP Client**: Axios 1.9.0
- **Notifications**: React Toastify 11.0.5
- **Build Tool**: Vite 6.3.5
- **Development**: ESLint, Prettier
- **Utilities**: UUID 11.1.0

## Folder Structure

```
frontend/
├── public/                   # Static assets
│   └── vite.svg             # Vite logo
├── src/                     # Source code
│   ├── assets/              # Images, icons, and static files
│   │   ├── assets_frontend/ # Frontend-specific assets
│   │   └── assets.js        # Asset imports
│   ├── components/          # Reusable UI components
│   │   ├── Banner.jsx       # Hero banner component
│   │   ├── Footer.jsx       # Footer component
│   │   ├── Header.jsx       # Header component
│   │   ├── Navbar.jsx       # Navigation component
│   │   ├── PaymentButton.jsx # Payment integration
│   │   ├── RelatedDoctors.jsx # Doctor recommendations
│   │   ├── SpecialityMenu.jsx # Specialty filter
│   │   └── TopDoctors.jsx   # Featured doctors
│   ├── context/             # React Context for state management
│   │   └── AppContext.jsx   # Global application state
│   ├── pages/               # Page components (routes)
│   │   ├── About.jsx        # About page
│   │   ├── Appointment.jsx  # Appointment booking
│   │   ├── Contact.jsx      # Contact page
│   │   ├── Doctors.jsx      # Doctor listing
│   │   ├── Home.jsx         # Homepage
│   │   ├── Login.jsx        # Authentication
│   │   ├── MyAppointments.jsx # User appointments
│   │   ├── MyProfile.jsx    # User profile
│   │   ├── PaymentFailure.jsx # Payment error page
│   │   └── PaymentSuccess.jsx # Payment success page
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── style.css            # Global styles
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── .prettierrc              # Prettier configuration
└── index.html               # HTML template
```

## Core Components

### 1. Application Entry Point (`main.jsx`)

**Purpose**: Initializes the React application and renders the root component.

**Key Features**:
- React 18+ createRoot API
- Strict mode for development
- App component mounting

### 2. Main Application (`App.jsx`)

**Purpose**: Sets up routing and global context providers.

**Key Features**:
- React Router configuration
- Context providers wrapping
- Toast notifications setup
- Route definitions for all pages

**Route Structure**:
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/doctors" element={<Doctors />} />
  <Route path="/login" element={<Login />} />
  <Route path="/appointment/:id" element={<Appointment />} />
  <Route path="/my-appointments" element={<MyAppointments />} />
  <Route path="/my-profile" element={<MyProfile />} />
  <Route path="/payment-success" element={<PaymentSuccess />} />
  <Route path="/payment-failure" element={<PaymentFailure />} />
</Routes>
```

### 3. Context Management (`context/AppContext.jsx`)

**Purpose**: Global state management for user authentication and application data.

**State Properties**:
- `user`: Current authenticated user data
- `token`: JWT authentication token
- `loading`: Loading state indicators
- `doctors`: Cached doctor data
- `appointments`: User's appointments

**Key Functions**:
- `login()`: User authentication
- `logout()`: User logout and cleanup
- `updateUser()`: Update user profile
- `fetchDoctors()`: Load doctor data
- `fetchAppointments()`: Load user appointments

## Page Components

### 1. Home Page (`pages/Home.jsx`)

**Purpose**: Landing page with hero section and featured content.

**Components Used**:
- `Banner`: Hero section with call-to-action
- `TopDoctors`: Featured doctors display
- `SpecialityMenu`: Medical specialties navigation

**User Flow**:
1. Welcome message and platform introduction
2. Quick access to doctor specialties
3. Featured doctors showcase
4. Call-to-action for registration/login

### 2. Login Page (`pages/Login.jsx`)

**Purpose**: User authentication with registration and login forms.

**Features**:
- Toggle between login and registration
- Form validation
- Password visibility toggle
- Error handling and user feedback
- Redirect to appropriate page after login

**Form Fields**:
- **Login**: Email, Password
- **Registration**: Name, Email, Password, Phone

### 3. Doctors Page (`pages/Doctors.jsx`)

**Purpose**: Browse and filter doctors by specialty.

**Features**:
- Specialty-based filtering
- Doctor cards with key information
- Search functionality
- Responsive grid layout
- Quick appointment booking access

**Doctor Card Information**:
- Profile image
- Name and specialty
- Experience and qualifications
- Consultation fees
- Availability status
- Book appointment button

### 4. Appointment Page (`pages/Appointment.jsx`)

**Purpose**: Book appointments with selected doctors.

**Features**:
- Doctor details display
- Date and time slot selection
- Payment integration
- Form validation
- Booking confirmation

**Booking Process**:
1. Display doctor information
2. Select appointment date
3. Choose available time slot
4. Confirm booking details
5. Process payment
6. Show confirmation

### 5. My Appointments (`pages/MyAppointments.jsx`)

**Purpose**: View and manage user's appointment history.

**Features**:
- List of all appointments
- Appointment status (upcoming, completed, cancelled)
- Appointment details
- Payment status
- Doctor information

### 6. My Profile (`pages/MyProfile.jsx`)

**Purpose**: User profile management and settings.

**Features**:
- Profile information display
- Editable form fields
- Profile image upload
- Address management
- Personal information updates

### 7. Payment Pages

#### Payment Success (`pages/PaymentSuccess.jsx`)
**Purpose**: Confirmation page after successful payment.

**Features**:
- Payment confirmation details
- Appointment information
- Next steps guidance
- Navigation options

#### Payment Failure (`pages/PaymentFailure.jsx`)
**Purpose**: Error page for failed payments.

**Features**:
- Error message display
- Retry payment option
- Support contact information

## Reusable Components

### 1. Header Component (`components/Header.jsx`)

**Purpose**: Top navigation bar with logo and main navigation.

**Features**:
- Responsive navigation menu
- Logo display
- Mobile menu toggle
- User authentication status
- Navigation links

### 2. Navbar Component (`components/Navbar.jsx`)

**Purpose**: Secondary navigation with user-specific actions.

**Features**:
- User profile access
- Appointments link
- Logout functionality
- Responsive design

### 3. Banner Component (`components/Banner.jsx`)

**Purpose**: Hero section for homepage and key pages.

**Features**:
- Compelling headline and description
- Call-to-action buttons
- Background image
- Responsive layout

### 4. TopDoctors Component (`components/TopDoctors.jsx`)

**Purpose**: Display featured or top-rated doctors.

**Features**:
- Doctor card grid
- Rating display
- Quick booking access
- Responsive design

### 5. SpecialityMenu Component (`components/SpecialityMenu.jsx`)

**Purpose**: Filter doctors by medical specialty.

**Features**:
- Specialty icons and labels
- Click-to-filter functionality
- Active state indication
- Responsive grid layout

### 6. PaymentButton Component (`components/PaymentButton.jsx`)

**Purpose**: Handle payment processing with Razorpay integration.

**Features**:
- Payment gateway integration
- Order creation
- Payment verification
- Error handling
- Success/failure redirects

## State Management

### Context API Usage

The application uses React Context for global state management:

```jsx
// Context Provider
<AppContext.Provider value={{
  user,
  token,
  loading,
  login,
  logout,
  updateUser,
  // ... other state and functions
}}>
  {children}
</AppContext.Provider>
```

### State Structure

```javascript
{
  user: {
    _id: string,
    name: string,
    email: string,
    image: string,
    address: object,
    gender: string,
    dob: date,
    phone: string
  },
  token: string,
  loading: boolean,
  doctors: array,
  appointments: array
}
```

## API Integration

### Axios Configuration

```javascript
// Base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Key API Endpoints Used

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/doctors` - Get all doctors
- `GET /api/user/doctors/:id` - Get specific doctor
- `POST /api/user/book-appointment` - Book appointment
- `GET /api/user/appointments` - Get user appointments
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## Styling & UI

### Tailwind CSS Implementation

The application uses Tailwind CSS for styling with custom configurations:

```javascript
// Tailwind configuration
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#F59E0B'
      }
    }
  },
  plugins: []
}
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly interface elements

### Component Styling Patterns

```jsx
// Example component styling
<div className="
  bg-white 
  rounded-lg 
  shadow-md 
  p-6 
  hover:shadow-lg 
  transition-shadow 
  duration-300
">
  {/* Component content */}
</div>
```

## User Experience Features

### 1. Authentication Flow

1. **Registration**: New user signup with validation
2. **Login**: Existing user authentication
3. **Token Management**: Automatic token storage and renewal
4. **Protected Routes**: Redirect unauthenticated users
5. **Logout**: Clear session and redirect to home

### 2. Doctor Discovery

1. **Browse by Specialty**: Filter doctors by medical field
2. **Search Functionality**: Find doctors by name or specialty
3. **Doctor Profiles**: Detailed information and reviews
4. **Availability Check**: Real-time slot availability
5. **Quick Booking**: Direct appointment scheduling

### 3. Appointment Management

1. **Slot Selection**: Choose date and time
2. **Payment Processing**: Secure payment gateway integration
3. **Confirmation**: Booking confirmation and details
4. **History**: View past and upcoming appointments
5. **Status Tracking**: Monitor appointment status

### 4. Profile Management

1. **Personal Information**: Update name, contact details
2. **Profile Image**: Upload and manage profile picture
3. **Address Management**: Update residential address
4. **Preferences**: Set notification preferences
5. **Security**: Password change functionality

## Error Handling

### Toast Notifications

```javascript
import { toast } from 'react-toastify';

// Success notification
toast.success('Appointment booked successfully!');

// Error notification
toast.error('Failed to book appointment. Please try again.');

// Info notification
toast.info('Please wait while we process your request.');
```

### Form Validation

```javascript
// Example validation
const validateForm = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};
```

## Performance Optimization

### 1. Code Splitting

```javascript
// Lazy loading for routes
const Appointment = lazy(() => import('./pages/Appointment'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
```

### 2. Image Optimization

- WebP format support
- Responsive images
- Lazy loading for images
- Optimized asset sizes

### 3. Caching Strategy

- API response caching
- Static asset caching
- Local storage for user data
- Session storage for temporary data

## Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` file:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run custom_1` - Alternative development command

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Doctor browsing and filtering
- [ ] Appointment booking flow
- [ ] Payment processing
- [ ] Profile management
- [ ] Responsive design on different devices
- [ ] Error handling and validation
- [ ] Navigation and routing

### Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Build Process

```bash
npm run build
```

### Static File Serving

The built application can be served using:
- Nginx
- Apache
- Vercel
- Netlify
- AWS S3 + CloudFront

### Environment Configuration

Ensure production environment variables are set:
- `VITE_BACKEND_URL` - Production API URL
- SSL certificates for HTTPS
- CDN configuration for assets

## Security Considerations

### Frontend Security

- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure token storage
- HTTPS enforcement

### Data Protection

- Sensitive data not stored in localStorage
- Token expiration handling
- Secure API communication
- User consent for data collection

## Accessibility

### WCAG Compliance

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### Responsive Design

- Mobile-first approach
- Touch-friendly interfaces
- Flexible layouts
- Optimized for various screen sizes

## Future Enhancements

### Planned Features

1. **Real-time Chat**: Doctor-patient messaging
2. **Video Consultations**: Telemedicine integration
3. **Prescription Management**: Digital prescriptions
4. **Health Records**: Patient health history
5. **Notifications**: Push notifications
6. **Multi-language Support**: Internationalization
7. **Dark Mode**: Theme customization
8. **Offline Support**: Service worker implementation

### Technical Improvements

1. **TypeScript Migration**: Type safety
2. **State Management**: Redux or Zustand
3. **Testing**: Unit and integration tests
4. **Performance**: Bundle optimization
5. **Monitoring**: Error tracking and analytics

---

*This documentation covers the complete frontend architecture and implementation. For specific component details, refer to the individual source files.* 