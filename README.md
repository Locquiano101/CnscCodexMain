# CNSC Codex

<p align="center">
  <img src="client/src/assets/cnsc-codex.svg" alt="CNSC Codex Logo" width="180"/>
</p>

<p align="center">
  A full-stack web platform for managing student organization accreditation, proposals, accomplishments, and financial reporting at Camarines Norte State College (CNSC).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express%205-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [User Roles](#user-roles)
- [Key Modules](#key-modules)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## 🏫 Overview

**CNSC Codex** is an integrated digital management system designed for the Student Development Unit (SDU) of **Camarines Norte State College**. It streamlines the entire lifecycle of student organization management — from initial registration and annual accreditation to proposal submissions, activity accomplishments, and financial reporting.

The platform provides role-specific dashboards for **Student Leaders**, **Advisers**, **Deans**, **SDU Coordinators**, and **SDU Administrators**, ensuring each stakeholder has the right level of access and visibility into organization activities.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Session-based authentication with persistent MongoDB session store
- Role-based access control (RBAC) with protected routes per user type
- Inactivity timeout with automatic session expiry (~1 month)
- First-login detection for account setup flows

### 🏢 Organization Management
- Initial and annual re-registration of student organizations
- Organization profile with logo, status, department, acronym, classification, and years of existence
- Public organization profile pages viewable without login
- Status tracking: Active, Inactive, Disqualified

### 📋 Accreditation System
- Multi-step accreditation workflow with configurable requirements:
  - President's Information
  - Financial Report
  - Members Roster
  - Accreditation Documents (Joint Statement, Pledge Against Hazing, Constitution & By-Laws)
  - Action Plan / Proposed Activities
- Accreditation requirement gating — SDU admins can enable/disable requirement sections
- Custom requirements with file attachments (PDF, PNG, JPEG, WEBP)
- Approval status tracking across all accreditation sections
- Revision notes and revocation support

### 📝 Proposals & Activity Management
- Submit, edit, and track activity proposals (Program/Project/Activity — PPA)
- Proposal calendar view for scheduled activities
- Status workflow: Pending → Approved / Returned
- Detailed proposal view with conduct tracking

### 🏆 Accomplishments
- Log organizational development and activity accomplishments
- Detailed accomplishment records linked to proposals
- Review and status management by advisers and SDU coordinators

### 💰 Financial Reporting
- Cash in-flow and cash out-flow tracking
- Collection fees management
- Transaction-level records with add/view support
- Exportable financial reports

### 📢 Posts & Announcements
- Student organizations can publish public posts
- Public post feed accessible without login
- Organization-specific post pages

### 🔔 Notifications
- Real-time in-app notifications via Socket.IO
- Email notifications via Nodemailer (Gmail)
- Accreditation-related email alerts

### 📊 Reports & Exports
- RQAT (Report on Qualified and Accredited Transactions) summaries
- Export to PDF using jsPDF and jsPDF-AutoTable
- Export to Excel using ExcelJS
- Report formatting aligned to APESOC landscape document spec
- Print utilities for formatted output

### 🤖 AI Feedback *(Experimental)*
- OpenAI-powered document feedback for uploaded proposals
- Integrated at the server middleware level

### 🛡️ System Safeguards
- Profanity filter on all incoming request bodies, queries, and params
- Rate limiting on admin-level mutation endpoints
- Audit logging for all accreditation requirement changes
- File upload MIME type validation and size limits

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, React Router DOM 7 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4, tailwind-merge, tailwindcss-animate |
| **UI Components** | Radix UI (Dialog, Select, Checkbox, Toast, Label, Separator) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |
| **Date Handling** | date-fns |
| **PDF Export** | jsPDF, jsPDF-AutoTable |
| **Excel Export** | ExcelJS, file-saver, xlsx |
| **Backend Framework** | Express 5 |
| **Database** | MongoDB with Mongoose 8 |
| **Session Store** | connect-mongo |
| **File Uploads** | Multer |
| **Email** | Nodemailer (Gmail) |
| **PDF Generation** | PDFKit, jsPDF |
| **Real-time Server** | Socket.IO |
| **AI** | OpenAI SDK |
| **Monorepo Tool** | npm Workspaces + concurrently |

---

## 📁 Project Structure

```
CnscCodexMain/
├── package.json                  # Root monorepo config (npm workspaces)
├── docs/
│   ├── reports-formatting-spec.md
│   ├── rooms-rollout.md
│   └── APESOC-RESULT-SAMPLE-FORMAT.docx
│
├── client/                       # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx               # Root router + protected routes
│   │   ├── main.jsx
│   │   ├── main.css
│   │   ├── api/
│   │   │   └── home_page_api.jsx
│   │   ├── assets/               # Logos, images (CNSC branding)
│   │   ├── components/           # Shared UI components
│   │   │   ├── ui/               # Radix-based primitives (button, card, dialog…)
│   │   │   ├── document_uploader.jsx
│   │   │   ├── file_manager.jsx
│   │   │   ├── filter-panel.jsx
│   │   │   ├── sortable-table.jsx
│   │   │   ├── roster-card.jsx
│   │   │   ├── status-badge.jsx
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── api.js            # Centralized API URL constants
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── public/           # Unauthenticated pages
│   │   │   │   ├── home_page.jsx
│   │   │   │   ├── login_form.jsx
│   │   │   │   ├── registration_form.jsx
│   │   │   │   ├── organization_profile.jsx
│   │   │   │   ├── public_post.jsx
│   │   │   │   ├── public_profile.jsx
│   │   │   │   ├── proposal_calendar.jsx
│   │   │   │   └── event_component.jsx
│   │   │   └── admin/            # Role-gated dashboards
│   │   │       ├── student-leader/
│   │   │       │   ├── accreditation/
│   │   │       │   ├── accomplishment/
│   │   │       │   ├── proposal/
│   │   │       │   └── posts/
│   │   │       ├── adviser/
│   │   │       │   ├── accreditation/
│   │   │       │   ├── accomplishment/
│   │   │       │   └── proposal/
│   │   │       ├── dean/
│   │   │       │   ├── individual-accreditation/
│   │   │       │   ├── accomplishment/
│   │   │       │   └── proposals/
│   │   │       ├── sdu-coordinator/
│   │   │       │   ├── accreditation/
│   │   │       │   └── accomplishment/
│   │   │       └── sdu-main/
│   │   └── utils/
│   │       ├── export-reports.js
│   │       └── print-utils.jsx
│
└── server/                       # Node.js / Express backend
    ├── package.json
    ├── scripts/
    │   └── migrate-uploads.js
    └── src/
        ├── server.js             # App entry, MongoDB connect, middleware setup
        ├── routers.js            # All API route definitions
        ├── controller/           # Business logic handlers
        │   ├── general.js
        │   ├── organization.js
        │   ├── accreditation-document.js
        │   ├── accreditation-requirement.js
        │   ├── financial-report.js
        │   ├── proposal.js
        │   ├── accomplishments.js
        │   ├── notification.js
        │   ├── generate-reports.js
        │   ├── audit-logs.js
        │   ├── roster-member.js
        │   ├── president.js
        │   ├── registration.js
        │   └── ...
        ├── middleware/
        │   ├── auth.js           # Session auth + role enforcement
        │   ├── ai.js             # OpenAI feedback integration
        │   ├── emailer.js        # Nodemailer (Gmail)
        │   ├── files.js          # Multer file handling
        │   ├── notification.js   # Notification helpers
        │   ├── rate-limit.js     # Per-session rate limiting
        │   ├── requirement-gating.js  # Accreditation gating middleware
        │   ├── socket.js         # Socket.IO setup
        │   └── audit.js          # Audit logging
        ├── models/               # Mongoose schemas
        │   ├── users.js
        │   ├── organization.js
        │   ├── accreditation.js
        │   ├── accreditation_requirement.js
        │   ├── proposals.js
        │   ├── accomplishment.js
        │   ├── financial_report.js
        │   ├── roster.js
        │   ├── president_profile.js
        │   ├── document.js
        │   ├── notification.js
        │   ├── audit_log.js
        │   ├── post.js
        │   ├── room_location.js
        │   └── requirement_submission.js
        └── uploads/              # Stored uploaded files (gitignored)
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A Gmail account for email notifications (with App Password)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Locquiano101/CnscCodexMain.git
cd CnscCodexMain
```

2. **Install all dependencies** (installs both client and server via npm workspaces)

```bash
npm install
```

### Environment Variables

#### Server (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/cnsc-codex

# Server
PORT=5000
SESSION_SECRET=your_session_secret_here

# Email (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# OpenAI (optional — for AI feedback feature)
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# Feature Flags
ENABLE_REQUIREMENT_GATING=false
REQUIREMENT_MAX_FILE_MB=10
```

#### Client (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

> ⚠️ **Note:** For Gmail to work with Nodemailer, you must generate a [Gmail App Password](https://myaccount.google.com/apppasswords) and use it as `EMAIL_PASS`. Standard Gmail passwords will not work if 2FA is enabled.

### Running the App

#### Development (runs both client and server concurrently)

```bash
npm run dev
```

This starts:
- **Backend** at `http://localhost:5000` (with nodemon for hot reload)
- **Frontend** at `http://localhost:5173` (Vite dev server)

#### Production

```bash
# Build the client
npm run build

# Start the server
npm run start
```

---

## 👥 User Roles

| Role | Path | Description |
|---|---|---|
| **Student Leader** | `/student-leader/*` | Manages their organization's accreditation, proposals, accomplishments, and posts |
| **Adviser** | `/adviser/*` | Reviews and approves proposals and accreditation for assigned organizations |
| **Dean** | `/dean/*` | Reviews organization activities and accreditation within their college |
| **SDU Coordinator** | `/sdu-coordinator/*` | Reviews and manages accreditation across organizations |
| **SDU (Admin)** | `/SDU/*` | Full system administration: users, requirements, reports, settings |
| **Public** | `/` | View home page, organization profiles, and public posts (no login required) |

---

## 📦 Key Modules

### Accreditation Workflow
The accreditation system is the core of CNSC Codex. Each organization must complete five requirement sections before the accreditation is considered complete:

1. **President's Information** — Profile of the current organization president
2. **Financial Report** — Cash flows, transactions, and collection fees
3. **Members Roster** — Complete list of member information
4. **Accreditation Documents** — Joint Statement, Pledge Against Hazing, Constitution & By-Laws
5. **Action Plan** — Proposed activities and programs for the academic year

SDU administrators can enable or disable individual sections globally via the accreditation requirement gating system.

### Accreditation Requirement Gating
The server supports toggling accreditation sections on/off at runtime. When `ENABLE_REQUIREMENT_GATING=true`, disabled requirements block their associated API routes with a `403` response. The frontend dynamically hides the corresponding navigation items.

### File Uploads
All file uploads are handled through Multer using in-memory storage, then persisted to `server/uploads/<organizationProfile>/`. The static `/uploads` route serves these files with 30-day cache headers.

### Real-time Notifications
Socket.IO is used for push notifications within the app. Server-sent events update users about status changes without requiring a page refresh.

---

## 🔌 API Overview

All API endpoints are prefixed with `/api`. Key route groups:

| Group | Example Endpoints |
|---|---|
| **Session** | `GET /api/session-check` |
| **Auth** | `POST /api/login`, `POST /api/logout`, `POST /api/register` |
| **Organizations** | `GET /api/getAllOrganizationProfile`, `GET /api/getOrganizationProfile/:id` |
| **Accreditation** | `GET /api/getAccreditation/:id`, `POST /api/createAccreditation` |
| **Requirements** | `GET /api/admin/accreditation/requirements`, `PATCH /api/admin/accreditation/requirements/:id/enable` |
| **Proposals** | `GET /api/getProposalsBySdu/:id`, `POST /api/createProposal` |
| **Accomplishments** | `GET /api/getAccomplishments`, `POST /api/createAccomplishment` |
| **Financial Reports** | `GET /api/getFinancialReport/:id`, `POST /api/addTransaction` |
| **Presidents** | `GET /api/getPresidents/:orgId`, `POST /api/addPresident` |
| **Roster** | `GET /api/getRoster/:orgId`, `POST /api/addRosterMember` |
| **Notifications** | `GET /api/notifications`, `POST /api/markNotificationRead` |
| **Reports** | `GET /api/rqatReport` |
| **Posts** | `GET /api/posts/:orgName`, `POST /api/createPost` |
| **Audit Logs** | `GET /api/admin/audit-logs` |

> ⚠️ Full route documentation is available in `server/src/routers.js`.

---

## 📸 Screenshots

> ⚠️ This section may need confirmation — screenshots have not been included in the repository. Add images of the main dashboard, accreditation flow, and financial report screens here.

| View | Preview |
|---|---|
| Home Page | *(add screenshot)* |
| Student Leader Dashboard | *(add screenshot)* |
| Accreditation Overview | *(add screenshot)* |
| Financial Report | *(add screenshot)* |
| SDU Admin Panel | *(add screenshot)* |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request against the `main` branch

### Development Notes
- The `client/` and `server/` packages are managed as npm workspaces.
- Use `nodemon` for backend development — it auto-restarts on file changes.
- ESLint is configured for the client; run `npm run lint --workspace client` to check for issues.
- A `sandbox.jsx` file exists in the client for experimental/testing purposes.

---

## 📄 License

This project is licensed under the **ISC License**.

> ⚠️ No `LICENSE` file was found in the repository root. This section is based on the `"license": "ISC"` field in `package.json`. Consider adding a formal `LICENSE` file.

---

## 👤 Author

**Locquiano101**

- GitHub: [@Locquiano101](https://github.com/Locquiano101)

> ⚠️ Additional contributor information was not found in the repository. Update this section with full author/team details as needed.

---

<p align="center">
  Built for Camarines Norte State College — Student Development Unit
</p>
