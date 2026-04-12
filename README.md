# CivicConnect: Civic Engagement & Sustainability Platform

**Group ID**: SE52

### Team Members
- **IT23534254** - PATHIRANA P P D S S (Participatory Planning & Surveys)
- **IT23600416** - WIJEKOON W M V M (Green Initiatives & Events)
- **IT23543300** - RANKETH K A D (Circular Economy Marketplace)
- **IT23670334** - PERERA K K L A (Issue Reporting & Resolution)

---

## 1. Setup Instructions

Below are the step-by-step instructions to get the project running locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas Cluster URI)

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder and populate it using the `.env.example` file:
   ```env
   NODE_ENV=development
   PORT=5002
   MONGO_URI=your_mongodb_cluster_uri
   JWT_SECRET=your_super_secret_jwt_key
   CORS_ORIGIN=http://localhost:5173
   
   # External Microservices
   AUTH_SERVICE_URL=https://auth.civic.dilmith.live/api

   # SMTP Setup (For emails)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   MAIL_FROM=CivicConnect <your_email@gmail.com>
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5002/api/v1
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```

The frontend will be instantly accessible at `http://localhost:5173`.

---

## 2. API Endpoint Documentation

A full interactive Swagger OpenAPI interface is built directly into our backend.
Once the backend is running, navigate to: **`http://localhost:5002/api-docs`**

Below is a summary of the Core Module APIs:

### 2.1 Surveys API (Participatory Planning)
*Authentication Required on all mutable endpoints (Bearer Token).*

- `GET /api/v1/surveys/active`
  - **Description**: Returns all currently active campaigns filtered by the `targetAudience`.
- `POST /api/v1/surveys`
  - **Description**: Publishes a new survey and fires background email notifications to the target body.
  - **Payload**: `{ "title": "...", "description": "...", "targetAudience": "all|citizen", "options": [ { "text": "A" }, { "text": "B" } ] }`
- `PATCH /api/v1/surveys/:id/vote`
  - **Description**: Casts or swaps a user's vote. Allows re-voting cleanly.
- `GET /api/v1/surveys/:id/results`
  - **Description**: Compiles vote distributions directly into formatting optimized for Chart.js.

### 2.2 Dashboard Admin APIs
- `GET /api/v1/dashboard/stats`
  - **Description**: Calculates wide-scale application activity including KPIs and aggregated Survey Approval statistics.
- `GET /api/v1/admin/users`
  - **Description**: (Admin Only) Fetches all users asynchronously from the authentication microservice.

---

## 3. Testing Instruction Report

The platform maintains a robust 3-tiered testing architecture executing over **75+ passing tests**.

### Testing Environment Configuration
- **Frameworks Used**: Jest, Supertest, Artillery.
- **Mock Databases**: Tests utilize `MongoMemoryServer` to ensure isolated execution without polluting production or development clusters.
- **Config**: Wait times and timeouts are intentionally padded in `jest.config.js` and `babel.config.cjs` to securely accommodate parallel worker testing. The configuration disables native ESM modules (`experimental-vm-modules`) inside `package.json` in favor of Babel transpilation to ensure compatibility with hoisted mocking structures.

### 3.1 Unit Testing
Tests individual controller functions, middleware logic, and service algorithms by heavily mocking external dependencies and the MongoDB Mongoose interactions.

**Execution Command:**
```bash
cd backend
npm run test:unit
```

### 3.2 Integration Testing
End-to-End integration pipelines simulating live API HTTP requests. These tests bypass mocked data to directly interact with `MongoMemoryServer`, enforcing Bearer Token validations, permissions schemas, database mutations, and external routing parameters.

**Execution Command:**
```bash
cd backend
npm run test:integration
```

### 3.3 Performance Testing (Load Testing)
Performance testing is executed via **Artillery** to determine system saturation and stability.

**Execution Command:**
```bash
cd backend
npm run test:performance
```
*Note: This relies on configurations housed in `tests/performance/survey.performance.yml` which establishes simulated multi-user bursts and ensures standard throughput API response latency remains sub-500ms under load.*

### Run Complete Suite:
To execute all Unit and Integration tests globally, utilize:
```bash
npm run test:all
```

---

## 4. Deployment Report

### 🌐 Live URLs
- **Frontend Application**: [https://civic.dilmith.live](https://civic.dilmith.live)
- **Backend API**: [https://api.civic.dilmith.live](https://api.civic.dilmith.live)
- **Swagger Documentation**: [https://api.civic.dilmith.live/api-docs](https://api.civic.dilmith.live/api-docs)

---

### ⚙️ EC2 Server Architecture
The entire platform is hosted natively on a single cloud VM utilizing **Nginx** as a reverse proxy for structural scaling.

- **Provider**: AWS EC2
- **OS**: Ubuntu
- **Web Server**: Nginx 1.24.0
- **Node Engine**: Node.js v20 (via NVM)
- **Process Manager**: PM2

### 1. Frontend Web App Deployment (React + Vite)
- **Code Directory**: `~/Civic-Engagement-SE3040-Project/frontend/`
- **Build Process**: The artifact is built using `npm run build` which packages all assets into the `frontend/dist/` bundle.
- **Hosting Strategy**: Node.js is completely bypassed for the frontend. **Nginx** directly serves the static files out of the `dist/` directory, operating at maximum I/O efficiency.
- **Routing Protocol**: To prevent 404s on React Router navigations resulting from hard-refreshes, Nginx is bound with `try_files $uri /index.html`.
- **Config Core**: `/etc/nginx/sites-available/civic-frontend`

### 2. Backend REST API Deployment (Express.js)
- **Code Directory**: `~/Civic-Engagement-SE3040-Project/backend/`
- **Daemonization**: The backend is bound to `localhost:8083` and runs continuously in the background initialized via `pm2 start server.js --name civic-backend`.
- **Reverse Proxy**: Nginx intercepts all traffic reaching `https://api.civic.dilmith.live` over port 443 and proxies the requests internally strictly into `localhost:8083`.
- **Config Core**: `/etc/nginx/sites-available/civic-backend`

### 3. 🔄 Continuous Integration & Deployment (CI/CD)
The project implements a streamlined CI/CD pipeline using **GitHub Actions** for automated, zero-downtime deployments.

```text
                     🚀 [ Push to main branch ]
                                ↓
                  ⚙️ (GitHub Actions Triggered)
                                ↓
               🔒 (SSH into EC2 via appleboy/ssh-action)
                                ↓
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
🏗️ [ Frontend Deployment ]                   ⚡ [ Backend Deployment ]
       │                                                 │
       ├─ 📥 git pull                                    ├─ 📥 git pull
       ├─ 📦 npm install                                 ├─ 📦 npm install
       ├─ 🔨 npm run build                               ├─ 🔨 npm run build
       └─ 🔄 pm2 restart civic-frontend                  └─ 🔄 pm2 restart civic-backend
       │                                                 │
       └────────────────────────┬────────────────────────┘
                                ▼
                    ✅ [ Deployment Successful ]
```

**Deployment Workflow Highlights:**
- **Automated Triggers**: Any push to the `main` branch automatically initiates the build and deploy sequence.
- **Parallel Deployment**: Both frontend and backend deployments are handled within the same session for consistency.
- **Process Management**: **PM2** ensures that the build processes and server instances are restarted cleanly and remain active.
- **Secure Access**: Deployments utilize encrypted SSH keys stored as GitHub Secrets.

### 4. Zero-Trust Security & SSL (HTTPS)
- SSL certificates are generated natively through **Certbot** via Let's Encrypt.
- Both the `civic.dilmith.live` and `api.civic.dilmith.live` domains are covered autonomously.
- Verification automated to renew continuously via cron-jobs attached to the system (`certbot renew`).

### 5. Authentication Specifications (Microservice Dependency)
Authentication operations execute externally, validating with the Auth microservice module.
- `POST` **Register**: `https://api.civic.dilmith.live/api/auth/register`
- `POST` **Login**: `https://api.civic.dilmith.live/api/auth/login`
- `POST` **Logout**: `https://api.civic.dilmith.live/api/auth/logout`

### Directory & Log Map
| Resource Type | Server Path Location |
|---|---|
| **Frontend Output** | `~/Civic-Engagement-SE3040-Project/frontend/dist/` |
| **Backend Source** | `~/Civic-Engagement-SE3040-Project/backend/` |
| **Nginx Frontend Config**| `/etc/nginx/sites-available/civic-frontend` |
| **Nginx Backend Config**| `/etc/nginx/sites-available/civic-backend` |
| **Frontend Error Logs** | `/var/log/nginx/civic-frontend.error.log` |
| **Backend Error Logs** | `/var/log/nginx/civic-backend.error.log` |
| **SSL Certificates** | `/etc/letsencrypt/live/civic.dilmith.live/` |

---
*End of Deployment Documentation*