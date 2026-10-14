# CS348 Project — Internship Application Tracker

Track internship applications with a React frontend, an Express API, and a MySQL database.

## Requirements

- Node.js 24+
- MySQL 8+

## Setup

### 1. Database

Run `seed.sql` only once, on a fresh database. Running it again on an
already-seeded database fails with duplicate-key errors.

macOS / Linux (bash):

```bash
mysql -u root -p < server/schema.sql
mysql -u root -p < server/seed.sql
```

Windows (PowerShell) — `<` redirection is not supported, so use `SOURCE`
from inside the MySQL client. The installer does not add `mysql` to PATH,
so call it by full path:

```powershell
& "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysql.exe" -u root -p
```

Then at the `mysql>` prompt, using forward slashes in the paths:

```sql
SOURCE C:/CS348/cs348project/server/schema.sql;
SOURCE C:/CS348/cs348project/server/seed.sql;
```

To run the files without opening the client, pipe them in instead:

```powershell
Get-Content server\schema.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysql.exe" -u root -p
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
```

Fill in your MySQL password in the new `.env`, then start the server:

```bash
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
| GET    | `/api/reports/applications` | Filtered report with totals |

### `GET /api/reports/applications`

All query parameters are optional; omitting them returns every application.

| Parameter    | Format       | Purpose                              |
| ------------ | ------------ | ------------------------------------ |
| `company_id` | positive int | Only this company                    |
| `status_id`  | positive int | Only this status                     |
| `start_date` | `YYYY-MM-DD` | On or after this date (inclusive)    |
| `end_date`   | `YYYY-MM-DD` | On or before this date (inclusive)   |

Returns `total` (number of matches), `by_status` (counts per status, only
for statuses with matches), and `applications` (the matching rows).
