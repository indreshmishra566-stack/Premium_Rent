# Luxury Car Rental

A full-stack luxury car rental application.

- **Backend**: Django 6 + Django REST Framework (Python 3.12)
- **Frontend**: React 19 (Create React App) + Tailwind CSS
- **Database**: SQLite locally, PostgreSQL in production (via `DATABASE_URL`)
- **Static serving**: WhiteNoise (backend admin/static), Nginx (frontend SPA)

## Repository layout

```
luxury-car-rental/
├── backend/            # Django project (Dockerized)
│   ├── backend/        # Django settings, urls, wsgi
│   ├── cars/           # Cars + bookings app (REST API)
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/           # React SPA (Dockerized + Vercel-ready)
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
├── docker-compose.yml  # Local one-command stack
├── render.yaml         # Render Blueprint (backend + DB + frontend)
├── .env.example        # All supported env vars
└── .gitignore
```

## Run locally with Docker

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8000 (REST API at `/api/...`, admin at `/admin/`)

The backend container migrates the schema and seeds the car catalog on first
boot. SQLite data persists in the `backend_data` Docker volume.

## Run locally without Docker

```bash
# --- Backend ---
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_cars
python manage.py runserver 127.0.0.1:8000

# --- Frontend (in a second terminal) ---
cd frontend
npm install
npm start
```

## Configuration

Copy `.env.example` to `.env` and edit as needed. Key variables:

| Variable                | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `DJANGO_DEBUG`          | `1` for dev, `0` for production                               |
| `DJANGO_SECRET_KEY`     | Required in production                                        |
| `DJANGO_ALLOWED_HOSTS`  | Comma-separated hostnames                                     |
| `CSRF_TRUSTED_ORIGINS`  | Comma-separated origins (supports `https://*.example.com`)    |
| `CORS_ALLOWED_ORIGINS`  | Comma-separated; if unset, all origins are allowed            |
| `DATABASE_URL`          | Postgres URL; falls back to SQLite when unset                 |
| `PORT`                  | Port to bind (defaults: backend 8000, frontend nginx 80)      |
| `REACT_APP_API_BASE_URL`| Baked into the React build at build time                      |

---

## Deployment

### 1. Push to GitHub

From inside the `luxury-car-rental/` directory:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-user>/luxury-car-rental.git
git push -u origin main
```

### 2. Deploy the frontend to Vercel

The frontend is a standard Create React App with a `vercel.json` configured for
SPA routing.

1. On https://vercel.com, click **Add New → Project** and import the GitHub repo.
2. Set the **Root Directory** to `frontend`.
3. Framework preset is auto-detected as **Create React App**. Build/output
   commands are read from `frontend/vercel.json`.
4. Add an environment variable:
   - `REACT_APP_API_BASE_URL` = your backend URL (e.g. the Render URL from step 3).
5. Click **Deploy**.

> CRA inlines `REACT_APP_*` at build time, so you must redeploy the frontend
> any time the backend URL changes.

### 3. Deploy the backend (and optionally the frontend) to Render

`render.yaml` is a [Render Blueprint](https://render.com/docs/blueprint-spec)
that provisions:

- A Dockerized Django web service (`backend/Dockerfile`)
- A managed PostgreSQL database, wired in via `DATABASE_URL`
- A static-site frontend (use this *or* Vercel — pick one)

To deploy:

1. On https://render.com/, click **New → Blueprint** and connect the repo.
2. Render reads `render.yaml` and proposes the services. Click **Apply**.
3. After the first deploy, set the remaining `sync: false` env vars in the
   Render dashboard:
   - Backend: `CORS_ALLOWED_ORIGINS` = your frontend URL
     (e.g. `https://your-app.vercel.app,https://luxury-car-rental-frontend.onrender.com`)
   - Frontend (Render-hosted): `REACT_APP_API_BASE_URL` = your backend URL
     (e.g. `https://luxury-car-rental-backend.onrender.com`), then trigger a
     manual redeploy of the static site so the new value is baked in.

Health check path is `/api/cars/`. Migrations and seeding run automatically
on container start.

### Quick decision matrix

| Service          | Where to host    |
| ---------------- | ---------------- |
| React frontend   | Vercel **or** Render Static |
| Django backend   | Render Web Service (Docker) |
| PostgreSQL       | Render Postgres (provisioned by `render.yaml`) |

---

## API surface

Base path: `/api`

| Method | Path                  | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/api/cars/`          | List cars                    |
| POST   | `/api/cars/`          | Create a car                 |
| GET    | `/api/cars/{id}/`     | Retrieve a car               |
| GET    | `/api/bookings/`      | List bookings                |
| POST   | `/api/bookings/`      | Create a booking             |
| POST   | `/api/auth/signup/`   | Sign up + log in             |
| POST   | `/api/auth/login/`    | Log in                       |
| POST   | `/api/auth/logout/`   | Log out                      |
| GET    | `/api/auth/me/`       | Current user                 |

Admin: `/admin/` (create a superuser with `python manage.py createsuperuser`).
