# Kadidjiny Library — Learning Resource Library

Full-stack MERN application built for **IFQ636 Software Life Cycle Management (Assignment 1)** by **George Gerges**, extending the official QUT starter repository (`nahaQUT/sampleapp_IFQ636`).

Kadidjiny Library provides students with a single searchable catalogue of staff-recommended learning resources and a private reading list (`My Library`) that stays synchronised when library staff publish or withdraw items.

---

## Live Deployment URL (University EC2)

- **Deployment URL**: http://13.239.32.83 (`http://ec2-13-239-32-83.ap-southeast-2.compute.amazonaws.com`)
- **University EC2 Instance**: `GG-2` (`i-0086596edae15d375`, `ap-southeast-2`, IAM Profile `IFQ636-EC2-Role`, Public Subnet `subnet-046ffe3e1ed93b6c1`)
- **Health Check Endpoint**: http://13.239.32.83/api/health (`GET /api/health`)
- **Jira Project**: `LRL` (`https://gg-qut.atlassian.net/jira/software/projects/LRL/boards/1`)

---

## Architecture Summary

The system follows a three-tier architecture aligned with the SysML Block Definition (`bdd`), Internal Block (`ibd`), and Sequence (`sd`) models in the project report:

1. **React Client (`frontend/`)**:
   - Role-aware single-page interface built with React 18, React Router v6, and Tailwind CSS.
   - **Student views**: `Catalogue` (keyword search + combined `Study area` and `Format` filters + `Reset filters` empty state), `ResourceDetail`, and `MyLibrary` (owner-scoped saved reading list).
   - **Administrator views**: `AdminResources` (management table paired with draft/publish metadata form, inline per-field validation preserving valid entries, live `Catalogue preview` card, and keyboard-accessible `ArchiveModal` withdrawal dialog) plus `AccessDenied` (`403`) role guard view.
   - Keyboard accessibility (`T7`): skip-to-content navigation, semantic `<label>` bindings, `aria-invalid`/`aria-describedby` inline field errors, `aria-live="polite"` feedback banners, and `StatusBadge` components pairing colour with text.

2. **Express REST API (`backend/`)**:
   - `middleware/authMiddleware.js` (`S1` / `LRL-7`): `protect` validates Bearer JWT sessions (`401` when signed out or expired) and `requireAdmin` restricts write/management endpoints to `role === 'admin'` (`403` for Students).
   - `utils/resourceValidator.js` (`S2` / `LRL-11` / `DC1`): Validates required metadata (`title`, `provider`, `studyArea`, `format`, `description`) and enforces valid `http://` or `https://` destination URLs without hosting external files (`DC1`).
   - `services/catalogueQueryService.js` (`S4` / `LRL-16` / `DC4`): Enforces `{ status: 'Published' }` across all Student catalogue searches and direct detail lookups (`ObjectId` validation + regex escaping added in PR #3 self-review).
   - `controllers/bookmarkController.js` (`S5` / `LRL-20` / `DC3`) & `controllers/resourceController.js` (`S3` / `LRL-25` / `DC2`): Atomic upsert bookmarking and non-destructive `Archived` status transitions that withdraw Student access across search, `My Library`, and direct detail links while retaining audit records.

3. **MongoDB Repository (`backend/models/`)**:
   - `User`: `name`, `email` (unique), `password` (bcrypt hashed), `role` (`student` | `admin`), `university`, `address`.
   - `Resource`: `title`, `description`, `provider`, `studyArea`, `format`, `accessUrl`, `status` (`Draft` | `Published` | `Archived`), `createdBy`, `publishedAt`, `archivedAt`.
   - `Bookmark`: `userId`, `resourceId` with a unique compound index `{ userId: 1, resourceId: 1 }` (`DC3`).

---

## Requirements, Jira & Git Traceability

| Req. | Jira Issue | Branch | Pull Request | Verification Suite |
|---|---|---|---|---|
| `R1–R3` | `LRL-7` (`S1`) | `feature/LRL-7-admin-role-guard` | PR #1 | `T1` (`t1_authRoleGuard.test.js`) · `401` & `403` |
| `R2` (`DC1`) | `LRL-11` (`S2`) | `feature/LRL-11-resource-draft-publish` | PR #2 | `T2` (`t2_resourceDraftPublish.test.js`) · draft invisibility, field errors & publish |
| `R1` (`DC4`) | `LRL-16` (`S4`) | `feature/LRL-16-catalogue-search-filter` | PR #3 *(includes `DC4` self-review & fix)* | `T3` (`t3_catalogueSearchFilter.test.js`) · combined filters, regex safety & detail guard |
| `R3` (`DC3`) | `LRL-20` (`S5`) | `feature/LRL-20-my-library-bookmarks` | PR #4 | `T4` (`t4_bookmarksMyLibrary.test.js`) · duplicate-save uniqueness & owner isolation |
| `R1–R3` (`DC2`) | `LRL-25` (`S3`) | `feature/LRL-25-resource-archive` | PR #5 | `T5` (`t5_archiveWithdrawal.test.js`) · withdrawal across 3 Student access paths |
| `R1–R3` (`Should`) | `LRL-29` (`T7`) | `chore/LRL-29-accessibility-and-release-docs` | PR #6 | `T7` (`frontend/src/App.test.js`) · keyboard/accessibility & error entry preservation |
| `R2–R3` (`Release`) | `LRL-30` (`T6`) | `chore/LRL-29-accessibility-and-release-docs` | PR #6 | `T6` (`t6_restartPersistence.test.js`) · persistence across DB reconnect/restart |

---

## Local Setup & Development

### Prerequisites
- **Node.js** v18+ (tested with Node v20 and v24) and **npm**
- **MongoDB** (local MongoDB Community Server or MongoDB Atlas URI) for running the live server *(note: `npm test` uses an isolated in-memory MongoDB server automatically and requires no external setup)*

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/georgegerges0/learning-resource-library.git
cd learning-resource-library
npm run install-all
```

### 2. Configure Environment Variables (No Committed Secrets)
Copy the example environment templates and supply your local values (`.env` files are gitignored):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/kadidjiny_library
JWT_SECRET=<generate-strong-32+-char-secret>
PORT=5001
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Seed Demo Accounts & Sample Catalogue
```bash
npm run seed
```
This creates idempotent demo accounts and sample engineering/health/research resources:
- **Administrator**: `admin@kadidjiny.edu.au` / `AdminPass123!`
- **Student**: `student@kadidjiny.edu.au` / `StudentPass123!`

### 4. Start Application & Run Automated Verification
```bash
# Run backend (port 5001) + frontend dev server (port 3000)
npm run dev

# Run all backend (T1-T6) and frontend (T7) automated tests
npm test
```

---

## University-Provided AWS EC2 Manual Deployment Procedure

> **Important**: Deploy only to the university-provided AWS EC2 instance (not a personal AWS account). No secrets are stored in Git.

1. **Verify EC2 Instance, Subnet & Security Group**:
   - Confirm the assigned university EC2 instance is in the designated public subnet with its university IAM instance profile attached.
   - Verify Security Group inbound rules allow:
     - `SSH (TCP 22)` restricted to your workstation IP / QUT access range.
     - Application HTTP port (`TCP 5001` or `TCP 80` via Nginx reverse proxy) open for marking verification; keep MongoDB (`TCP 27017`) bound strictly to `127.0.0.1` (never publicly exposed).

2. **Install Runtime & Clone Release Tag on EC2**:
   ```bash
   ssh -i <university-key.pem> ubuntu@<EC2_PUBLIC_IP>
   git clone https://github.com/georgegerges0/learning-resource-library.git
   cd learning-resource-library
   git checkout v1.0.0
   npm run install-all
   ```

3. **Configure Production Environment & Build Frontend**:
   When `NODE_ENV=production` and `frontend/build` exists, `backend/server.js` serves both the compiled React SPA and `/api/*` from the same origin, eliminating cross-origin browser issues:
   ```bash
   cat > frontend/.env <<EOF
   REACT_APP_API_URL=http://<EC2_PUBLIC_IP>:5001
   EOF
   npm run build

   cat > backend/.env <<EOF
   NODE_ENV=production
   PORT=5001
   MONGO_URI=<MONGODB_CONNECTION_STRING>
   JWT_SECRET=$(openssl rand -base64 32)
   CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>:5001
   EOF
   chmod 600 backend/.env
   ```

4. **Seed Data & Run Persistent Service (`PM2`)**:
   ```bash
   npm run seed
   npx pm2 start backend/server.js --name kadidjiny-library
   npx pm2 save
   ```

5. **Post-Deployment Verification (`T1`–`T6`)**:
   - Visit `http://<EC2_PUBLIC_IP>:5001/api/health` → confirm `{"status":"ok"}`.
   - Sign in as Administrator (`admin@kadidjiny.edu.au`), publish a draft, sign in as Student (`student@kadidjiny.edu.au`) in a separate session, filter by Study Area + Format, save to `My Library`, run `npx pm2 restart kadidjiny-library` (`T6`), confirm persistence, then withdraw the item and verify removal across search, `My Library`, and direct detail URL (`T5`).

---

## Known Limitations

- **External link availability**: In accordance with `DC1` and project scope, Kadidjiny Library stores destination URLs and provider attribution rather than hosting files; automated background link-rot checking is out of scope.
- **Single study area and format per record**: Each catalogue item is classified under one primary study area and one format to keep filtering predictable in release `v1.0.0`.
- **Session storage**: Client JWTs are stored in browser `localStorage` to match the QUT starter architecture; production institutional deployments with SSO would migrate to `HttpOnly` secure cookies and university SAML/OIDC integration.
- **Manual deployment**: CI runs automated test and build verification on GitHub Actions; EC2 deployment is performed manually as specified in the assignment brief.
