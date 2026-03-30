# 🚀 HydroSenseAI — Free Deployment Plan

Deploy the full platform for **$0/month** using free-tier cloud services.

---

## Stack Overview

| Layer | Service | Free Tier |
|-------|---------|-----------|
| **Frontend** | [Vercel](https://vercel.com) | Unlimited deploys, 100GB bandwidth |
| **Backend** | [Render](https://render.com) | 750 hrs/month, auto-sleep after 15min inactivity |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | 512MB storage (already configured) |
| **Models** | Bundled in Docker image on Render | Included in build |

> [!NOTE]
> Render's free tier spins down after 15 min of inactivity. First request after sleep takes ~30s to cold-start. This is acceptable for demos/college projects.

---

## Step 1: Prepare Backend for Render

### 1.1 Create `Dockerfile`

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system deps for torch/ultralytics
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code + saved models
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 1.2 Create `.dockerignore`

```
__pycache__/
*.pyc
.env
venv/
.pytest_cache/
```

### 1.3 Update [main.py](file:///C:/Users/Ayush%20Kumar/Documents/HydrosenseAI/backend/main.py) CORS for production

Replace the `allow_origins=["*"]` with:

```python
origins = [
    "http://localhost:3000",
    "https://hydrosense-ai.vercel.app",  # ← your Vercel domain
]
app.add_middleware(CORSMiddleware, allow_origins=origins, ...)
```

---

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `ayush6447/HydroSenseAI`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `hydrosense-api` |
| **Root Directory** | `backend` |
| **Runtime** | Docker |
| **Instance Type** | Free |
| **Region** | Singapore (closest to India) |

4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | (generate a random 32-char string) |
| `MONGO_URI` | `mongodb+srv://rishav1306singh_db_user:b806BGT7RmKSZIx4@cluster0.zzahalg.mongodb.net/?appName=Cluster0` |
| `MONGO_DB` | `hydrosense` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |

5. Click **Create Web Service** → Wait for build (~5-10 min)
6. Your API will be at: `https://hydrosense-api.onrender.com`

> [!IMPORTANT]
> Render's free Docker builds have **512MB RAM**. The PyTorch + YOLOv8 stack may exceed this. If the build fails, use **Render's native Python runtime** instead of Docker (set Build Command to `pip install -r requirements.txt` and Start Command to `uvicorn main:app --host 0.0.0.0 --port $PORT`).

---

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import: `ayush6447/HydroSenseAI`
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |

4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://hydrosense-api.onrender.com` |

5. Click **Deploy** → Live in ~2 minutes
6. Your dashboard will be at: `https://hydrosense-ai.vercel.app`

---

## Step 4: MongoDB Atlas (Already Done ✅)

Your Atlas cluster is already configured. Just ensure:

- [x] **Network Access** → `0.0.0.0/0` (Allow from anywhere — needed for Render's dynamic IPs)
- [x] Database: `hydrosense`
- [x] Collection: `orchestration_logs` (auto-created on first write)

---

## Step 5: Post-Deploy Checklist

- [ ] Hit `https://hydrosense-api.onrender.com/docs` to verify Swagger loads
- [ ] Update Vercel `NEXT_PUBLIC_API_URL` env var with exact Render URL
- [ ] Update [main.py](file:///C:/Users/Ayush%20Kumar/Documents/HydrosenseAI/backend/main.py) CORS origins with your Vercel domain
- [ ] Test simulation mode toggle from the live dashboard
- [ ] Verify orchestration logs appear in MongoDB Atlas → Collections

---

## Architecture (Deployed)

```
┌──────────────────────────┐          ┌──────────────────────────┐
│   Vercel (Free)          │  REST    │   Render (Free)          │
│   Next.js Frontend       │────────→│   FastAPI + ML Models    │
│   hydrosense.vercel.app  │          │   hydrosense.onrender.com│
└──────────────────────────┘          └─────────┬────────────────┘
                                                │
                                     ┌──────────▼────────────────┐
                                     │   MongoDB Atlas (Free)    │
                                     │   512MB / Shared Cluster  │
                                     └──────────────────────────┘
```

---

## Alternative: Render RAM Limit Workaround

If the free 512MB RAM isn't enough for PyTorch + YOLOv8 + XGBoost:

| Option | How |
|--------|-----|
| **A. Use ONNX** | Convert [.pt](file:///c:/Users/Ayush%20Kumar/Documents/HydrosenseAI/yolo26n.pt) models to `.onnx` (smaller, CPU-only, no torch needed) |
| **B. Disable YOLOv8** | Keep the 3 lightweight models, skip the 3MB YOLO weight |
| **C. Use Railway** | [railway.app](https://railway.app) has a $5 free credit/month with 8GB RAM |
| **D. Use Koyeb** | [koyeb.com](https://koyeb.com) offers free Docker hosting with 512MB + no sleep |

> [!TIP]
> For a college demo, **Option C (Railway)** is the best balance — $5 free credit is more than enough, and you get always-on with 8GB RAM.
