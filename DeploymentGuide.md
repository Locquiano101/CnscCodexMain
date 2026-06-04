# CNSC Codex — Setup Guide

**System Deployment Documentation**
Camarines Norte State College — Student Development Unit — Local Installation Reference

---

## Table of Contents

- [CNSC Codex — Setup Guide](#cnsc-codex--setup-guide)
  - [Table of Contents](#table-of-contents)
  - [1. Required Software and Tools to Install](#1-required-software-and-tools-to-install)
  - [2. Operating System Requirements](#2-operating-system-requirements)
  - [3. Database Backup File Location](#3-database-backup-file-location)
  - [4. Database Setup Instructions](#4-database-setup-instructions)
    - [Option A — Local MongoDB](#option-a--local-mongodb)
    - [Option B — MongoDB Atlas (Cloud)](#option-b--mongodb-atlas-cloud)
  - [5. Database Connection Credentials (Local Setup)](#5-database-connection-credentials-local-setup)
  - [6. Port Configuration and Firewall Notes](#6-port-configuration-and-firewall-notes)
  - [7. Environment Configuration Files](#7-environment-configuration-files)
    - [File 1 — `server/.env`](#file-1--serverenv)
    - [File 2 — `client/.env`](#file-2--clientenv)
  - [8. Install and Run Commands](#8-install-and-run-commands)
  - [9. Local Access URL](#9-local-access-url)
  - [10. Pre-Created Test Account Credentials](#10-pre-created-test-account-credentials)
  - [11. External Service Dependencies](#11-external-service-dependencies)

---

## 1. Required Software and Tools to Install

The following must be installed on the machine before running the project. No XAMPP, Docker, or PHP is needed — this is a fully Node.js and MongoDB stack.

- **Node.js v18 or higher** — the entire backend and frontend tooling depends on it. Download from `nodejs.org`
- **npm v9 or higher** — included with Node.js; used for package management and running workspace scripts
- **MongoDB** — either a local MongoDB Community Server installation, or a free cloud account on MongoDB Atlas at `mongodb.com/atlas`
- **Git** — required to clone the repository from GitHub
- **A Gmail account with App Password enabled** — required only for the email notification feature (Nodemailer). Standard Gmail passwords will not work if 2FA is active.

---

## 2. Operating System Requirements

There are no specific OS restrictions. The project is built entirely on Node.js, React (Vite), and MongoDB — all of which are cross-platform.

> **Compatible Systems**
> Compatible with Windows, macOS, and Linux. There are no DLL dependencies or platform-specific binaries.

---

## 3. Database Backup File Location

This cannot be determined from the repository alone. The project uses **MongoDB** (not MySQL), so the backup format is a `.bson` dump folder (via `mongodump`) or a JSON export — not a `.sql` file. The uploads folder is gitignored and no backup file was committed to the repository.

---

## 4. Database Setup Instructions

The system uses MongoDB. There are two possible scenarios depending on whether the database is local or cloud-hosted.

### Option A — Local MongoDB

1. Install MongoDB Community Server from `mongodb.com/try/download/community` and start the service (it usually runs automatically after installation).
2. If you have a `mongodump` backup folder, run:
   ```
   mongorestore --db cnsc-codex /path/to/dump/cnsc-codex
   ```
3. If you have a JSON export, use MongoDB Compass (free GUI) to import it into a database named `cnsc-codex`.
4. Set `MONGO_URI=mongodb://localhost:27017/cnsc-codex` in `server/.env`.

### Option B — MongoDB Atlas (Cloud)

1. Create a free account at `mongodb.com/atlas` and create a cluster.
2. Create a database user with a username and password.
3. Get your connection string — it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cnsc-codex
   ```
4. Paste that string as the value of `MONGO_URI` in `server/.env`.
5. No local import is needed if the live database is still active on Atlas — the system connects directly.

---

## 5. Database Connection Credentials (Local Setup)

Based on the README environment variable template, the default local configuration should be:

| Setting           | Value                                  |
| ----------------- | -------------------------------------- |
| MONGO_URI         | `mongodb://localhost:27017/cnsc-codex` |
| Database Name     | `cnsc-codex`                           |
| Database User     | None (local MongoDB default)           |
| Database Password | None (local MongoDB default)           |
| Database Host     | `localhost`                            |
| MongoDB Port      | `27017`                                |

---

## 6. Port Configuration and Firewall Notes

The system uses two ports that must be free and unblocked:

| Port   | Used By                                |
| ------ | -------------------------------------- |
| `5000` | Express backend server                 |
| `5173` | Vite React frontend (development mode) |

> Please ensure ports 5000 and 5173 are free and not blocked by the Windows Firewall. If another application is already using port 5000, the backend will fail to start. No special firewall rules are needed beyond this, since everything runs on localhost.

---

## 7. Environment Configuration Files

There are two `.env` files that must be created manually. They are gitignored, so they will not be present after cloning — copy them from the flash drive or create them fresh.

### File 1 — `server/.env`

```env
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/cnsc-codex

# Server
PORT=5000
SESSION_SECRET=any_random_secret_string_here

# Email (Gmail App Password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Feature flags
ENABLE_REQUIREMENT_GATING=false
REQUIREMENT_MAX_FILE_MB=10
```

### File 2 — `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

> ⚠️ **Switching from Live to Local Mode**
> If the system was previously pointed at a live cloud server, the `VITE_API_URL` in `client/.env` may be set to a live domain (e.g., `https://cnsc-codex.onrender.com`). To switch to local mode, change it to `http://localhost:5000`.

> ⚠️ **Important**
> Make sure to include the actual `.env` files on the flash drive, since they contain real credentials that are not committed to GitHub.

---

## 8. Install and Run Commands

Open a terminal (Command Prompt or PowerShell on Windows; Terminal on Mac or Linux) and run the following commands in order:

```bash
# Step 1 — Navigate to the project folder
cd CnscCodexMain

# Step 2 — Install all dependencies
# This installs both client and server packages at once via npm workspaces
npm install

# Step 3 — Start the application
# This boots both the React frontend and Express backend simultaneously
npm run dev
```

> **Note**
> The `npm run dev` command uses `concurrently` to start both the backend and frontend at the same time. You do not need to open two separate terminals.

---

## 9. Local Access URL

Once the system is running, open a web browser and go to the following address:

| Purpose                        | URL                     |
| ------------------------------ | ----------------------- |
| Frontend (the actual website)  | `http://localhost:5173` |
| Backend API (for testing only) | `http://localhost:5000` |

only needs to open `http://localhost:5173` in the browser to use and explore the system.

---

## 10. Pre-Created Test Account Credentials

seeded file is provided and test accounts are found in the repository. User accounts are stored in MongoDB and not committed to GitHub.

> ⚠️ **Action Required**
> Check your MongoDB database for existing accounts and make sure at least one account per role is present in the database dump provided. (⚠️ FOR TEST ONLY)

| Role              | Email                        | Password               |
| ----------------- | ---------------------------- | ---------------------- |
| SDU Administrator | _sdu@cnsc.edu.ph_            | _password123_          |
| SDU Coordinator   | _sducoordinator@cnsc.edu.ph_ | _password123_          |
| Dean              | _dean.ccms@cnsc.edu.ph_      | _password123_          |
| Adviser           | _Through Registration_       | _Through Registration_ |
| Student Leader    | _Through Registration_       | _Through Registration_ |

---

## 11. External Service Dependencies

The system relies on several external services. The following table explains what may fail and how to handle it during the defense:

| Feature                 | Dependency                                                                    | What Happens Without It                                                                           |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Email notifications     | Gmail via Nodemailer (requires internet + valid Gmail App Password in `.env`) | Accreditation email alerts will fail silently. The rest of the system continues to work normally. |
| Real-time notifications | Socket.IO (runs locally on port 5000 — no internet needed)                    | Works offline as long as the server is running.                                                   |
| File uploads            | Stored locally in `server/uploads/`                                           | Works offline as long as the folder exists locally.                                               |

> **Suggested Explanation for Ma'am**
> The email notification feature and the AI document feedback feature require an active internet connection and valid API credentials. If those credentials are not configured, those two features will not work — but all core features including accreditation management, proposals, financial reports, and user management will function normally on localhost without an internet connection.

---

_CNSC Codex — Local Deployment Guide_
