# Server Module Documentation

## Accreditation Requirements Gating

This backend implements a global accreditation requirement system allowing SDU administrators to enable/disable core templates and manage custom requirements.

### Environment Flags
- `ENABLE_REQUIREMENT_GATING=true` activates enforcement via middleware. When disabled (default), routes behave normally regardless of requirement state.
- `REQUIREMENT_MAX_FILE_MB` (default `10`) sets maximum upload size for requirement files.

### Core Template Keys
```
president-info
financial-report
roster
accreditation-documents
action-plan
```
Templates are seeded automatically on server startup (see `server/src/server.js`). They are non-removable but can be disabled (hidden + blocked).

### Custom Requirements
Created via `POST /api/admin/accreditation/requirements` (multipart). Each has:
- `key` (slug of title, immutable for stability)
- `title`, `description`
- `removable: true`
- `document` (optional) stored under `server/uploads/requirements/<key>/`
- `version` increments on file replacement.

### Admin Endpoints
```
GET    /api/admin/accreditation/requirements                # List (optional ?type=template|custom&includeDisabled=true)
GET    /api/admin/accreditation/requirements/gating-status  # Current gating state + enabled keys
POST   /api/admin/accreditation/requirements                # Create custom requirement (multipart: title, description?, file?)
PATCH  /api/admin/accreditation/requirements/:id            # Update metadata + optional file replacement
PATCH  /api/admin/accreditation/requirements/:id/enable     # Toggle enabled { enabled: boolean }
DELETE /api/admin/accreditation/requirements/:id            # Delete custom requirement
```
Rate limits applied (per user/session) to modification endpoints to reduce abuse.

### Visibility Endpoint
```
GET /api/accreditation/requirements/visible  # Public (authenticated) list of enabled keys (key, title, type)
```
The client uses this to hide disabled accreditation sub-navigation items dynamically.

### Gating Enforcement
Middleware `enforceRequirement(key)` is attached to all accreditation-related routes. When `ENABLE_REQUIREMENT_GATING=true` and the requirement is disabled, the route responds with `403` and `{ requirement: <key> }`.

### Audit Logging
Actions recorded:
- `requirement.create`
- `requirement.update` (meta.changed fields)
- `requirement.enable` / `requirement.disable` (previousEnabled, newEnabled)
- `requirement.delete` (fileCleanup flag)
- `requirement.document.upload` (fileName, size, mimeType, version)

### File Handling & Validation
- Size limit enforced at controller level using `REQUIREMENT_MAX_FILE_MB`.
- MIME types allowed: `application/pdf`, `image/png`, `image/jpeg`, `image/jpg`, `image/webp`.
- Folder cleanup attempted on delete (best-effort).

### Activation Steps
1. Set environment variable:
   - In `.env`: `ENABLE_REQUIREMENT_GATING=true`
2. Optionally adjust upload limit: `REQUIREMENT_MAX_FILE_MB=15`
3. Restart server; startup log will show lock icon indicating gating enabled.
4. Use `GET /api/admin/accreditation/requirements/gating-status` to verify.

### Future Enhancements (Suggestions)
- Persist rate limits in Redis for multi-instance deployments.
- Add pagination & search to requirements list.
- Add bulk enable/disable endpoint for operational convenience.
- Introduce role-based visibility (e.g., certain custom requirements only for specific organization types).

## Quick Troubleshooting
| Symptom | Cause | Resolution |
| ------- | ----- | ---------- |
| 403 on accredited route | Requirement disabled + gating enabled | Enable via admin UI toggle |
| File upload 415 | Unsupported MIME | Upload PDF or allowed image type |
| File upload 413 | Exceeds size limit | Increase `REQUIREMENT_MAX_FILE_MB` or use smaller file |
| Rate limit 429 | Too many rapid changes | Wait for window reset (Retry-After header) |

---
Maintained by Accreditation Requirements Management subsystem.
