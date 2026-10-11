# CS348 Project — Internship Application Tracker

Track internship applications with a React frontend, an Express API, and a MySQL database.

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

```bash
mysql -u root -p < server/schema.sql
mysql -u root -p < server/seed.sql
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in your MySQL password
node index.js
```

Runs on http://localhost:5000

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## API

| Method | Route                   | Purpose                  |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/applications`     | List all applications    |
| POST   | `/api/applications`     | Add an application       |
| PUT    | `/api/applications/:id` | Update an application    |
| DELETE | `/api/applications/:id` | Delete an application    |
| GET    | `/api/companies`        | List companies           |
| GET    | `/api/statuses`         | List statuses            |
