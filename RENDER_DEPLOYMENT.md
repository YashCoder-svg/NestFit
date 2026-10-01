# Deploying NestFit to Render

This guide outlines how to deploy **NestFit** to [Render](https://render.com).

NestFit is configured to support **two deployment strategies**:
1. **Single Full-Stack Web Service (Recommended & Free-Tier Friendly)**: Builds both the React/Vite frontend and Express backend into a single unified service. Zero CORS configuration and zero API-linking required.
2. **Decoupled Architecture**: Backend as a Render Web Service + Frontend as a Render Static Site.

---

## Method 1: 1-Click Render Blueprint (Easiest & Recommended)

NestFit includes a [`render.yaml`](./render.yaml) file configured for Render's Infrastructure-as-Code (Blueprint) feature.

1. Push your latest code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click the **"New +"** button in the top right and select **"Blueprint"**.
4. Connect your GitHub repository (`YashCoder-svg/NestFit`).
5. Render will automatically read `render.yaml` and configure:
   - **Service Name:** `nestfit`
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
6. Click **"Apply"**. Render will install dependencies, build the frontend and backend, and deploy your live URL (e.g. `https://nestfit.onrender.com`).

---

## Method 2: Manual Web Service Setup (Single Full-Stack Service)

If you prefer creating the service manually via the Render UI:

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository: `YashCoder-svg/NestFit`.
3. Configure the settings:
   - **Name:** `nestfit`
   - **Region:** Any region close to your target audience (e.g., Singapore or Oregon)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (uses repo root)
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default, Render sets this automatically)
   - `CORS_ORIGIN` = `*`
   - *(Optional)* `MONGO_URI` = Your MongoDB Atlas connection string (NestFit runs on its built-in embedded dataset if omitted)
5. Under **Advanced Settings**:
   - **Health Check Path:** `/health`
6. Click **Create Web Service**.

---

## Method 3: Decoupled Services (Static Site + Web Service)

If you want the frontend hosted on Render's dedicated global CDN (Static Site) and the API hosted separately:

### Step 1: Deploy Backend Web Service
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect `YashCoder-svg/NestFit`.
3. Set:
   - **Name:** `nestfit-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV` = `production`
     - `CORS_ORIGIN` = `*`
4. Click **Create Web Service** and note your backend URL (e.g. `https://nestfit-api.onrender.com`).

### Step 2: Deploy Frontend Static Site
1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect `YashCoder-svg/NestFit`.
3. Set:
   - **Name:** `nestfit-web`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://nestfit-api.onrender.com` (your backend URL from Step 1)
5. Under **Redirects / Rewrites**:
   - Add a rewrite rule for Single-Page Application (SPA) routing:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Action:** `Rewrite`
6. Click **Create Static Site**.

---

## Database Configuration (MongoDB Atlas - Optional)

NestFit has a built-in fallback data layer:
- **Without MongoDB:** NestFit starts immediately using embedded spatial datasets for Bangalore, Pune, and on-demand dynamic OSM city ingestion (e.g., Raigarh, Jaipur).
- **With MongoDB Atlas:** If you provide `MONGO_URI`, NestFit will automatically connect, seed micro-markets and tech parks, and persist ingested cities permanently.

To connect MongoDB Atlas:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` for Render).
3. Copy the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/nestfit?retryWrites=true&w=majority`).
4. Paste it as the `MONGO_URI` environment variable in Render.

---

## Render Free Tier Considerations

- **Cold Starts:** Free tier web services spin down after 15 minutes of inactivity. When a new request arrives, it may take 30–50 seconds for the service to wake up.
- **Swagger Documentation:** Available live at `https://<your-service>.onrender.com/api-docs`.
- **Health Check:** Monitored at `https://<your-service>.onrender.com/health`.
