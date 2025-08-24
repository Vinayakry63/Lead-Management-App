#  Lead Management System

A comprehensive Lead Management System,This full-stack application demonstrates end-to-end engineering skills with modern technologies and best practices.

##  Features

### Authentication
- **JWT Authentication** with httpOnly cookies (no localStorage)
- User registration and login
- Secure password hashing with bcrypt
- Protected routes and middleware
- Proper HTTP status codes (201, 200, 401, etc.)

###  Lead Management (CRUD)
- **Create, Read, Update, Delete** leads
- All required fields implemented:
  - Personal info: first_name, last_name, email, phone
  - Company info: company, city, state
  - Lead details: source, status, score, lead_value, last_activity_at, is_qualified
  - Timestamps: created_at, updated_at

###  Advanced Features
- **Server-side pagination** with configurable limits
- **Comprehensive filtering** system:
  - String fields: equals, contains
  - Enums: equals, in
  - Numbers: equals, gt, lt, between
  - Dates: on, before, after, between
  - Boolean: equals
- **AG Grid integration** for professional data display
- **Real-time search** and sorting
- **Responsive design** with Tailwind CSS

###  Security & Performance
- Rate limiting and CORS protection
- Input validation and sanitization
- Database indexing for optimal performance
- Secure cookie handling

##  Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers

### Frontend
- **React 18** with modern hooks
- **AG Grid** for professional data grids
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **Axios** for API communication
- **Lucide React** for icons

##  Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vinayakry63/Lead-Management-App.git
cd lead-management-system
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Environment Setup**
```bash

cd backend
cp .env

```

4. **Database Setup**
```bash
# Start MongoDB (if local)
mongod

# Seed the database with test data
npm run seed
```

5. **Start Development Servers**
```bash
# Start both frontend and backend
npm run dev
```

### Test Credentials
- **Email**: `test@erino.com`
- **Password**: `test123`

##  Project Structure

```
Lead-management-system/
├── backend/                 # Express.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── scripts/            # Database seeding
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `POST /api/leads` - Create new lead
- `GET /api/leads` - Get leads with pagination & filters
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `filters` - JSON string of filter criteria



### Manual Testing
1. Register a new user or use test credentials
2. Create, edit, and delete leads
3. Test pagination and filtering
4. Verify all CRUD operations work correctly
5. Test authentication and protected routes

##  Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  timestamps: true
}
```

### Lead Model
```javascript
{
  first_name: String (required),
  last_name: String (required),
  email: String (unique, required),
  phone: String (required),
  company: String (required),
  city: String (required),
  state: String (required),
  source: Enum (website, facebook_ads, google_ads, referral, events, other),
  status: Enum (new, contacted, qualified, lost, won),
  score: Number (0-100, required),
  lead_value: Number (required),
  last_activity_at: Date,
  is_qualified: Boolean (default: false),
  user: ObjectId (ref: User, required),
  timestamps: true
}
```

##  Security Features

- **JWT stored in httpOnly cookies** (no localStorage)
- **Password hashing** with bcrypt (12 salt rounds)
- **Input validation** and sanitization
- **Rate limiting** (100 requests per 15 minutes)
- **CORS protection** with credentials
- **Security headers** with Helmet
- **Authentication middleware** for protected routes

##  Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** for consistent styling
- **Professional UI/UX** with modern design patterns
- **Accessibility** considerations
- **Cross-browser** compatibility

##  Performance Optimizations

- **Database indexing** on frequently queried fields
- **Server-side pagination** to handle large datasets
- **Efficient filtering** with MongoDB aggregation
- **Optimized React rendering** with proper hooks usage
- **Lazy loading** and code splitting ready

##  Contributing

- Contributions are welcome! Please feel free to submit a Pull Request.


