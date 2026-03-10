# CEMS - Campus Event Management System

Full-stack MERN application with role-based access for students and admins.

## Tech Stack

- MongoDB
- Express.js
- React.js (Vite)
- Node.js
- JWT Authentication
- Razorpay (Test Mode)

## Roles

- Student
- Admin

Admin isolation is enforced: admins can create, update, delete, and view registrations only for events created by themselves.

## Project Structure

```text
cems
├── backend
│   ├── config
│   │   └── db.js
│   ├── models
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Announcement.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── announcementRoutes.js
│   ├── middleware
│   │   └── authMiddleware.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── announcementController.js
│   ├── uploads
│   │   └── .gitkeep
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Events

- `POST /api/events/create`
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/update/:id`
- `DELETE /api/events/delete/:id`

### Registrations

- `POST /api/register`
- `GET /api/register/event/:eventId`
- `POST /api/register/order` (Razorpay test order)

### Announcements

- `GET /api/announcements`

## Features

- JWT auth and role-based protected routes
- Student profile fields (roll number, mobile number, department)
- Event filtering by type, club, upcoming, ongoing
- Search events
- Event banner upload
- Admin-only ownership access for event management
- Student registration flow with Razorpay test mode for paid events
- Auto-announcement generation for event update changes (time, venue, discount, notice)
- Loading states and error handling
- Logout support

## Setup

### 1) Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd ../frontend
npm install
copy .env.example .env
npm run dev
```

## Environment Variables

Backend (`backend/.env`):

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Frontend (`frontend/.env`):

- `VITE_API_BASE_URL`
- `VITE_FILE_BASE_URL`

## Deployment Notes

- Use production MongoDB URI and strong JWT secret.
- Set Razorpay live keys only for production.
- Configure CORS for deployed frontend URL.
- Persist uploads with cloud storage for production.
