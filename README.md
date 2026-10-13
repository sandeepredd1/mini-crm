# Mini CRM

A responsive customer relationship workspace for managing customers, deals, and follow-up tasks. It includes cookie-based authentication, a stage-based sales pipeline, customer-linked records, and a MongoDB-backed dashboard.

## Screenshots

Capture and add current application screenshots here before publishing the repository. Suggested views: sign-in, dashboard, customer details, deals pipeline, and tasks on mobile.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Mongoose
- Data: MongoDB Atlas
- Security: bcryptjs, httpOnly JWT cookies, Zod, Helmet, CORS allowlist, rate limiting
- Tests: Vitest and Supertest

## Local setup

1. Install the frontend dependencies from `client` and backend dependencies from `server`:

   ```sh
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set `MONGO_URI` and a unique `JWT_SECRET` of at least 32 characters in the server file. Leave `VITE_API_URL` empty for local development; Vite proxies `/api` requests to the API at `127.0.0.1:5000`. Set `VITE_API_URL` to the deployed API origin in Vercel project settings. Do not commit either `.env` file.
3. Start the backend and frontend in separate terminals:

   ```sh
   cd server
   npm run dev
   ```

   ```sh
   cd client
   npm run dev
   ```

4. Register an account at `/register`, then sign in.

## Environment variables

| Variable | Location | Required | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | Server | Yes | MongoDB Atlas connection URI |
| `JWT_SECRET` | Server | Yes | Signing secret; must contain at least 32 characters |
| `CLIENT_URL` | Server | Yes | Comma-separated exact frontend origins permitted by CORS |
| `NODE_ENV` | Server | Yes in production | Set to `production` on the live API |
| `PORT` | Server | Optional | API port; defaults to `5000` locally (Render supplies this in production) |
| `VITE_API_URL` | Client build | Yes for separate hosting | Public base URL of the backend API |
| `SMTP_URL` | Server | For password resets | SMTP transport URL used to send one-time reset links |
| `MAIL_FROM` | Server | For password resets | Sender address for reset emails |
| `DEMO_EMAIL` | Server | For demo seeding | Non-personal email for the demo account |
| `DEMO_PASSWORD` | Server | For demo seeding | Demo account password (at least 8 characters) |
| `DEMO_NAME` | Server | Optional | Demo account display name |

The server refuses to start if `MONGO_URI`, `JWT_SECRET`, or `CLIENT_URL` is missing, or if the JWT secret is too short. Password reset requests return a clear `503` until SMTP is configured.

## Demo data

Set `DEMO_EMAIL`, `DEMO_PASSWORD`, and optionally `DEMO_NAME` in `server/.env`, then run:

```sh
cd server
npm run seed:demo
```

The script creates three customers, three linked deals, and three tasks (including a task due today and an overdue task). It does not overwrite a demo account that already has customer records. Use a test email and a unique password, and share the values through the intended demo channel rather than committing them.

## API endpoints

All customer, deal, task, and dashboard endpoints require the authenticated httpOnly cookie and scope records to the current user.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and set the cookie |
| `GET` | `/api/auth/me` | Restore the current session |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `POST` | `/api/auth/forgot-password` | Send a one-time reset link (SMTP required) |
| `POST` | `/api/auth/reset-password` | Redeem a reset token and change password |
| `GET`, `POST` | `/api/customers` | List with `search`, `status`, `page`, `limit`; create a customer |
| `GET`, `PUT`, `DELETE` | `/api/customers/:id` | Read, update, or delete an owned customer |
| `GET`, `POST` | `/api/deals` | List/filter deals by `stage`/`customerId`; create |
| `GET`, `PUT`, `DELETE` | `/api/deals/:id` | Read, update (including stage), or delete an owned deal |
| `GET`, `POST` | `/api/tasks` | List/filter by `status`, `customerId`, `dealId`; create |
| `GET`, `PUT`, `DELETE` | `/api/tasks/:id` | Read, update, or delete an owned task |
| `GET` | `/api/dashboard` | Return MongoDB aggregation metrics and pipeline totals |
| `GET` | `/api/health` | API health check |

Request body validation errors use HTTP `400` with a `message` and field-level `errors`. Records outside the signed-in user's scope return `404`.

## Tests and quality checks

```sh
cd server
npm test
npm run build
```

```sh
cd client
npm run build
npm run lint
```

Backend API tests cover registration validation, login, session authentication, CORS rejection, cross-user record access, and password-reset behavior.

## Deployment

- Deploy `client` as the Vercel project root with build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the public backend URL at build time. `client/vercel.json` rewrites deep links to the SPA entry point so routes continue to work after refresh.
- Deploy `server` to Render using the root `render.yaml` blueprint, or another Node host with build command `npm ci && npm run build` and start command `npm start`. Set `MONGO_URI` and `CLIENT_URL` to the exact deployed frontend origin; Render generates `JWT_SECRET` through the blueprint. The platform supplies `PORT`.
- Configure `SMTP_URL` and `MAIL_FROM` if password reset is enabled. Confirm the deployed API health endpoint and test direct refresh on `/customers/:id`.

Live frontend URL: configure after deployment.  
Live backend URL: configure after deployment.  
Demo login: provide the `DEMO_EMAIL` and `DEMO_PASSWORD` values after running the seed command.
