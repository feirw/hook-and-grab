# Hook&Grab

![Hook&Grab Logo](/presentation/logo.png)

### Project Submission for Odyssea's 2nd Blue & Circular Economy Hackathon

## Introduction
Hook&Grab is a circular marketplace for coastal communities. People can reuse marine gear, share boats instead of buying new ones, and exchange practical knowledge — so materials and skills stay in circulation.

## Technologies Used
- **Frontend**: React, Vite, Bootstrap, React Router
- **Backend**: Node.js, Express, Passport, CORS
- **Database**: SQLite3
- **Other Tools**: Axios, Prettier, Nodemon

## Getting Started

### Prerequisites
- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **npm**: included with Node.js

### Installation and Running the Project

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/<your-username>/hook-and-grab.git
   cd hook-and-grab
   ```

2. **Start the Application:**
   At the root of the project, run:
   ```bash
   npm start
   ```
   This installs dependencies and starts both servers:
   - **Backend:** `http://localhost:3482`
   - **Frontend:** `http://localhost:5173`

   The first run seeds demo listings, boats, and forum topics.

3. **Demo login**
   - Username: `captain`
   - Password: `hookgrab`

### Optional backend configuration
Copy `backend/.env.example` to `backend/.env` if you want to change the port, session secret, or frontend origin.

### Formatting Code

- **Format Both Frontend and Backend:**
  ```bash
  npm run format
  ```

## What you can do
- Browse and list used marine products, including free and trade-friendly items
- List a boat and send real booking requests with dates
- Approve or reject incoming bookings from your profile
- Start forum discussions and reply to the community
- Upload a profile photo

## API Tester and Test Suite

### API Tester GUI
- **Location:** `docs/resources/api_tester`
- Run with `npm start` inside that folder, then open `http://localhost:2502/`

### Alternative API Test Suite
- **Location:** `docs/resources/api_test_suite.py`
- Run with `python api_test_suite.py` from `docs/resources`

---

## Documentation

- **Main Documentation:** [docs/index.md](docs/index.md)
