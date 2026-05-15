# TaskPilot — deploy anywhere (Atlas, API host, static UI)

This app is **split**: React UI (static) + Node API + MongoDB. The UI talks to the API using a **full URL** in production (`VITE_API_URL`). The API talks to MongoDB using **`MONGO_URI`** (Atlas in production).

## 0. Vercel (monorepo: frontend + backend “Services”)

If Vercel shows **“vercel.json required to deploy projects with multiple services”**, use the **root** `vercel.json` in this repo (it defines `experimentalServices` for `frontend/` and `backend/`).

1. Connect the **Git repo** with root at the folder that contains **`vercel.json`**, **`frontend/`**, and **`backend/`**.
2. In the Vercel project, set the **framework / preset** to **Services** (or accept Vercel’s detection) so it picks up **`experimentalServices`**.
3. **Environment variables**
   - **Backend (Express)** — add at least: **`MONGO_URI`**, **`JWT_SECRET`**, **`CLIENT_ORIGINS`**.  
     **`CLIENT_ORIGINS`** must be your real site origin(s), e.g. `https://your-app.vercel.app` (no trailing slash). Multiple origins: comma-separated.
   - **Frontend (Vite build)** — set **`VITE_API_URL`** to your API base on the **same** deployment:  
     `https://YOUR-APP.vercel.app/_/backend/api`  
     (That path matches the backend **`routePrefix`** `/_/backend` plus your Express routes under **`/api`**.)

Redeploy the **frontend** after any change to **`VITE_API_URL`** (Vite bakes it in at build time).

**Simpler alternative (no Services):** deploy only the UI on Vercel: set **Root Directory** to **`frontend`**, deploy the API on **Render** or **Railway**, and set **`VITE_API_URL`** to that API’s public URL (see §3). You can ignore root `vercel.json` for that layout (or remove it in a branch if Vercel keeps detecting Services).

---

## 0b. Railway (API from this monorepo)

Railway often **fails** if it builds from the **repo root** (root `package.json` has no API **`start`** script).

This repo includes:

- **`Dockerfile`** at the **root** — builds only **`backend/`** and runs `node server.js`.
- **`railway.toml`** — Docker build + **`GET /health`** probe (does not require MongoDB).

**In Railway → your service → Settings:**

1. **Root Directory:**  
   - **Recommended:** leave **empty** (clone root) so Railway uses the **root** `Dockerfile` + `railway.toml`, **or**  
   - Set **`backend`** as the root and use **Settings → Docker** / Dockerfile path **`Dockerfile`** inside that folder (this repo includes **`backend/Dockerfile`** for that layout).
2. **Variables:** `MONGO_URI`, `JWT_SECRET`; **`PORT`** is set by Railway. Set **`CLIENT_ORIGINS`** to your frontend origin (e.g. Vercel URL) if the UI is on another domain.

The server binds **`0.0.0.0:$PORT`** (needed for container health checks). If Mongo misconnects, the process **stays up** so you can read logs and use **`/api/health`** for DB status; fix **`MONGO_URI`** / Atlas **Network Access** (`0.0.0.0/0` for hosted APIs) as needed.

---

## 1. MongoDB Atlas (database in the cloud)

### Create the cluster

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in (or register).
2. Create a **project** (any name, e.g. `TaskPilot`).
3. **Build a database** → choose **M0 Free** → pick a **region** close to where your API will run (e.g. same as Render/Railway region).
4. Finish cluster creation (name it e.g. `TaskPilotCluster`).

### Database user (username + password)

1. Atlas → **Database Access** → **Add New Database User**.
2. **Authentication**: Password.
3. Choose a **username** and a **strong password** (save them; you will paste the password into the connection string).
4. **Database User Privileges**: **Read and write to any database** (fine for one app), or restrict to `taskpilot` if you create that DB name in the URI path.

### Network access (so Render/Railway can connect)

1. Atlas → **Network Access** → **Add IP Address**.
2. For hosted APIs with changing IPs, choose **Allow access from anywhere**: `0.0.0.0/0` (common for small apps).  
   For stricter setups, use Atlas **VPC peering** or your provider’s static egress (advanced).

### Get the connection string (this is your `MONGO_URI`)

1. Atlas → **Database** → your cluster → **Connect**.
2. Choose **Drivers** (or “Connect your application”).
3. Driver: **Node.js**, version **5.5+** (or latest).
4. Copy the **connection string**. It looks like:

   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

5. **Replace** `<username>` with your database user name and `<password>` with the user’s password.  
   If the password contains special characters (`@`, `#`, `/`, etc.), **URL-encode** it (Atlas UI often has “Copy” that encodes for you).
6. **Add a database name** before the query string so data goes to one DB, e.g.:

   `mongodb+srv://MYUSER:MYPASS@cluster0.xxxxx.mongodb.net/taskpilot?retryWrites=true&w=majority`

   Here `taskpilot` is the database name (you can change it; match what you want in Atlas).

That full string is your **`MONGO_URI`**. You **do not** paste this into the frontend repo — only into the **backend** host’s environment variables (below).

---

## 2. Deploy the backend (API)

Deploy the folder **`backend/`** (root of the service = `backend`, start command `npm start` or `node server.js`).

### Environment variables on the API host (Render, Railway, Fly.io, VPS, etc.)

Add these in the dashboard: **Settings → Environment** (names must match exactly):

| Variable | Where you get it | Example |
|----------|------------------|---------|
| **`MONGO_URI`** | Atlas connection string (step 1.6) | `mongodb+srv://user:pass@cluster.../taskpilot?retryWrites=true&w=majority` |
| **`JWT_SECRET`** | Generate a long random string (any password generator, 32+ chars) | `a1b2c3...` (keep secret) |
| **`PORT`** | Often **automatic** on PaaS (Render/Railway set `PORT`). If the platform requires it, use their docs; your code already uses `process.env.PORT \|\| 5000`. | *(optional on many hosts)* |
| **`CLIENT_ORIGINS`** | **Comma-separated** origins of your **live website** (no path, no trailing slash). Required when the UI is on another domain than the API. | `https://taskpilot.vercel.app` or `https://taskpilot.vercel.app,https://www.mydomain.com` |

**Where to paste `MONGO_URI`:** only in the **backend** service’s environment variable named **`MONGO_URI`** (Render “Environment”, Railway “Variables”, etc.) — not in Vercel for the DB string.

**Build / start (typical):**

- **Install command:** `npm install`
- **Start command:** `npm start` (runs `node server.js`)

After deploy, open **`https://<your-api-host>/api/health`** in a browser. You should see JSON like `{"status":"OK",...}`.

Copy your API **origin** (scheme + host, no path), e.g. `https://taskpilot-api.onrender.com`. Your frontend will use **`https://taskpilot-api.onrender.com/api`** as `VITE_API_URL` (see section 3).

---

## 3. Deploy the frontend (React / Vite)

Deploy the folder **`frontend/`** (build output is `frontend/dist`).

### Environment variable for production API URL

Vite bakes env vars in at **build time**. Set this in **Vercel / Netlify / Cloudflare Pages** project settings → **Environment variables** (production):

| Variable | Value |
|----------|--------|
| **`VITE_API_URL`** | Your deployed API base path: **`https://<your-api-host>/api`** (no trailing slash after `api`) |

Examples:

- `https://taskpilot-api-xxxx.onrender.com/api`
- `https://taskpilot.up.railway.app/api`

**Local development:** do **not** set `VITE_API_URL` (or leave it empty). The app uses **`/api`** and Vite’s proxy sends it to `http://localhost:5000`.

Copy `frontend/.env.example` to `frontend/.env.local` only if you want to test production API from your machine:

```env
VITE_API_URL=https://your-api.onrender.com/api
```

### Build settings (typical)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

### SPA routing (refresh on `/dashboard`, etc.)

- **Vercel:** `frontend/vercel.json` is included (rewrites to `index.html`).
- **Netlify:** `frontend/public/_redirects` is copied into `dist` for the fallback rule.

---

## 4. Checklist

- [ ] Atlas: cluster + DB user + **Network Access** `0.0.0.0/0` (or your chosen rule).
- [ ] **`MONGO_URI`** set on **backend** host only.
- [ ] **`JWT_SECRET`** set on **backend** host.
- [ ] **`CLIENT_ORIGINS`** = your **frontend** URL(s), comma-separated.
- [ ] Backend health: `https://<api-host>/api/health` works.
- [ ] **`VITE_API_URL`** = `https://<api-host>/api` on **frontend** host at **build** time.
- [ ] Redeploy frontend after changing `VITE_API_URL` (rebuild required).

---

## 5. Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| API exits on start / “connect ECONNREFUSED” | Wrong `MONGO_URI`, Atlas IP not allowed, or bad password encoding. |
| Browser: CORS error | Set **`CLIENT_ORIGINS`** on the API to the **exact** origin of the UI (`https://...`), no trailing slash. |
| Login fails / network error from UI | Wrong **`VITE_API_URL`**, or frontend not rebuilt after setting it. |
| 401 after deploy | **`JWT_SECRET`** changed between signups and login — keep one stable secret per environment. |
| Atlas looks empty but login still works with an old account | Your OS or terminal may have **`MONGO_URI`** set to **local** MongoDB; Node loads that first and **ignores** `backend/.env` unless `dotenv.config({ override: true })` is used (this repo does). Remove the stray variable, or rely on the updated server. After restart, the API log should show **`MONGO_URI in use: mongodb+srv://...`** and host **`*.mongodb.net`**, not **`127.0.0.1`**. |

---

## 6. Optional: local Mongo with Docker

For **local** development only, you can use `docker compose up -d` at the repo root and `MONGO_URI=mongodb://127.0.0.1:27017/taskpilot` in **`backend/.env`**. That Docker MongoDB is **not** used automatically when you deploy the UI/API to the cloud; production should use **Atlas** (or another managed Mongo you control).
