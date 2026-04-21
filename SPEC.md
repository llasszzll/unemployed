# Job Application Tracker - Specification

## 1. Project Overview

- **Project Name**: Job Application Tracker
- **Type**: Full-stack web application (React + Node.js + MongoDB)
- **Core Functionality**: A job application tracking system where users can create accounts, log job applications, track application status (received feedback, rejected, no response), and upload resumes for potential employers to download.
- **Target Users**: Job seekers tracking their job applications

## 2. Technology Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

### Frontend
- React with React Router
- Axios for API calls
- CSS for styling

## 3. Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  fullName: String,
  phone: String,
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date
  },
  createdAt: Date
}
```

### JobApplication Model
```javascript
{
  user: ObjectId (ref: User),
  companyName: String (required),
  position: String (required),
  applicationDate: Date,
  status: String (enum: ['pending', 'interview', 'rejected', 'no_response', 'accepted']),
  feedback: String,
  rejectionReason: String,
  notes: String,
  createdAt: Date
}
```

## 4. UI/UX Specification

### Color Palette
- Primary: `#1a1a2e` (Deep navy)
- Secondary: `#16213e` (Dark blue)
- Accent: `#0f3460` (Medium blue)
- Highlight: `#e94560` (Coral red)
- Text: `#eaeaea` (Light gray)
- Background: `#0f0f1a` (Very dark)
- Card Background: `#1a1a2e`
- Success: `#4ade80` (Green)
- Warning: `#fbbf24` (Amber)
- Error: `#ef4444` (Red)

### Typography
- Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Headings: Bold, `#e94560` accent color
- Body: Regular, `#eaeaea`

### Layout
- Responsive design (mobile-first)
- Navigation bar at top
- Main content area with max-width 1200px
- Card-based layout for applications

### Pages

#### 1. Login Page
- Email input
- Password input
- Login button
- Link to register page

#### 2. Register Page
- Username input
- Email input
- Full name input
- Password input
- Confirm password input
- Register button
- Link to login page

#### 3. Dashboard (Home)
- Welcome message with user name
- Summary stats (total applications, pending, rejected, no response)
- List of recent applications
- Add new application button

#### 4. Add/Edit Application
- Company name (required)
- Position (required)
- Application date
- Status dropdown (Pending, Interview, Rejected, No Response, Accepted)
- Feedback text area (shown when status is not pending)
- Rejection reason (shown when rejected)
- Notes text area
- Save button

#### 5. Profile Page
- User information display (editable)
- Resume upload section
- Download resume button (if uploaded)
- List of all applications with filters

### Components
- Navbar with navigation links
- ApplicationCard component
- StatCard component
- Form inputs with validation
- Modal for confirmations
- Loading spinner

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Job Applications
- `GET /api/applications` - Get all applications for user
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/no-response` - Get applications with no response

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/resume` - Upload resume
- `GET /api/user/resume` - Download resume
- `DELETE /api/user/resume` - Delete resume

## 6. Functionality Specification

### Authentication Flow
1. User registers with username, email, password
2. Password hashed with bcrypt
3. JWT token generated on login
4. Token stored in localStorage
5. Protected routes require valid token

### Job Application Flow
1. User clicks "Add Application"
2. Fills in company, position, date
3. Selects status (default: pending)
4. If status is "rejected" or "no_response", can add feedback/rejection reason
5. Application saved to MongoDB
6. Dashboard updates with new application

### Resume Upload Flow
1. User navigates to profile
2. Clicks "Upload Resume"
3. Selects PDF/DOC file (max 5MB)
4. File uploaded to server/uploads directory
5. User can download resume anytime

## 7. Acceptance Criteria

- [ ] Users can register with unique email/username
- [ ] Users can login and receive JWT token
- [ ] Users can create job applications with company, position, date
- [ ] Users can set application status (pending, interview, rejected, no_response, accepted)
- [ ] Users can add feedback for rejected/no response applications
- [ ] Dashboard shows summary statistics
- [ ] Profile page shows user info and all applications
- [ ] Users can upload resume (PDF/DOC)
- [ ] Users can download uploaded resume
- [ ] Responsive design works on mobile and desktop
- [ ] Data persists in MongoDB database
