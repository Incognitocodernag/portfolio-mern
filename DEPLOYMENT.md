# Deployment Guide — MERN Stack Portfolio

This guide details the step-by-step instructions to set up your free MongoDB Atlas database, deploy your Express backend on **Render**, and host your React frontend on **Vercel** with full cyber-security configurations.

---

## 🛠️ Step 1: Create a Free MongoDB Atlas Database

Since you do not have an account, follow these steps to get a free connection string:

1. **Sign Up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create a Database Cluster**:
   - Choose the **M0 Free Tier** cluster.
   - Select a cloud provider (AWS or Google Cloud) and a region closest to you (e.g., `us-east-1` or `ap-south-1`).
   - Click **Create**.
3. **Configure Database Security**:
   - **User Credentials**: Create a database username (e.g., `arunabha`) and secure password. Write these down!
   - **IP Access List**: To allow your Render API server to connect, set the Access List to **Allow Access from Anywhere** (`0.0.0.0/0`). Render has dynamic IP addresses, so this wildcard setting is required.
4. **Retrieve Connection String**:
   - Click on the **Database** menu, then select **Connect** next to your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     `mongodb+srv://arunabha:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with the database password you created in Step 3. Keep this string private!

---

## 🚀 Step 2: Deploy the Backend API on Render

Render will host your Express API server and connect it to MongoDB.

1. **Initialize Git**:
   - Make sure your project is committed to a GitHub repository. (Create a new private/public repository on GitHub and push the root folder containing `/backend` and `/frontend`).
2. **Log In to Render**: Go to [Render](https://render.com/) and register using your GitHub account.
3. **Create Web Service**:
   - Click **New +** and choose **Web Service**.
   - Connect your GitHub repository.
4. **Configure Deployment Settings**:
   - **Name**: `portfolio-backend`
   - **Root Directory**: `backend` (This points Render directly to your backend subfolder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Select the **Free** tier.
5. **Add Environment Variables**:
   - Scroll down to the **Environment** section.
   - Add the following variables:
     * `MONGO_URI`: `your_complete_mongodb_atlas_connection_string`
     * `JWT_SECRET`: `any_long_random_secret_string`
     * `ADMIN_USERNAME`: `admin` (or your preferred admin login name)
     * `ADMIN_PASSWORD`: `your_secure_admin_password` (used to log in to `/admin` dashboard)
     * `NODE_ENV`: `production`
     * `FRONTEND_URL`: `https://your-portfolio-frontend.vercel.app` (You can update this after Vercel deployment)
6. **Deploy**: Click **Create Web Service**. Wait for the build logs to show `Server is running...`.
7. **Run Seed Script**:
   - Once the Web Service is live, click on **Shell** in Render's sidebar.
   - Run the command: `npm run seed`
   - This seeds your database with your B.Tech timeline, the **WealthifyMe** project, and hashes your admin password.

---

## 💻 Step 3: Deploy the React Frontend on Vercel

Vercel will host your static React application and proxy calls to the Render API.

1. **Log In to Vercel**: Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. **Import Project**:
   - Click **Add New** -> **Project**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit, select the `frontend` folder, and click OK.
   - **Build and Output Settings**: Keep default values.
4. **Configure Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add the key:
     * `VITE_API_URL`: `https://your-backend-url.onrender.com` (Use the direct Web Service URL provided in your Render dashboard, e.g., `https://portfolio-backend-xxxx.onrender.com`)
5. **Deploy**: Click **Deploy**. Vercel will bundle the code and host it instantly.

---

## 🔒 Post-Deployment Security Check

Once both sites are live, update your variables for maximum protection:
1. Go back to your Render dashboard, click on **Environment**, and update `FRONTEND_URL` to the actual URL assigned by Vercel (e.g. `https://arunabha-portfolio.vercel.app`).
2. This ensures CORS strictly blocks any third-party domains or malicious scripts trying to trigger updates on your API.
