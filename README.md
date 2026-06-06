# Kojast — Deployment Guide (PM2)

This project consists of two parts:

- **Frontend** — Vite + React (TypeScript), built to static files
- **Backend** — Node.js + Express API (MySQL), located in `./backend`

---

## Prerequisites

Make sure the following are installed on your server:

- Node.js >= 18
- npm
- PM2 (`npm install -g pm2`)
- MySQL (running and accessible)
- (Optional) Nginx — recommended to serve the frontend and reverse-proxy the API

---

## 1. Clone & Install Dependencies

```bash
# Root (frontend)
npm install

# Backend
cd backend && npm install && cd ..
```

---

## 2. Configure Environment Variables

### Backend

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Fill in your values:

```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=kojast

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

JWT_SECRET=your_long_random_secret
```

### Frontend

Create a `.env` file in the project root if your frontend needs to point to the backend API:

```env
VITE_API_URL=http://your-server-ip:3000
```

---

## 3. Initialize the Database

```bash
cd backend
npm run init-db
cd ..
```

---

## 4. Build the Frontend

```bash
npm run build
```

This produces a `dist/` folder with the compiled static files.

---

## 5. Run with PM2

### Option A — Start each process individually

```bash
# Start the backend API
pm2 start backend/src/server.js --name kojast-api

# Serve the frontend static files (built dist/)
pm2 start npm --name kojast-frontend -- run preview
```

> `vite preview` serves the `dist/` folder on port 4173 by default.
> For production, using Nginx to serve `dist/` directly (see below) is recommended instead.

### Option B — Use an ecosystem file (recommended)

Create `ecosystem.config.cjs` in the project root:

```js
module.exports = {
  apps: [
    {
      name: 'kojast-api',
      script: './backend/src/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--experimental-vm-modules',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'kojast-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Then start both with a single command:

```bash
pm2 start ecosystem.config.cjs
```

---

## 6. Persist PM2 on Server Reboot

```bash
pm2 save
pm2 startup
```

Follow the printed instruction (it will give you a `sudo` command to run) to register PM2 as a system service.

---

## 7. Useful PM2 Commands

| Command | Description |
|---|---|
| `pm2 list` | Show all running processes |
| `pm2 logs kojast-api` | Stream backend logs |
| `pm2 logs kojast-frontend` | Stream frontend logs |
| `pm2 restart kojast-api` | Restart the backend |
| `pm2 stop all` | Stop all processes |
| `pm2 delete all` | Remove all processes from PM2 |
| `pm2 monit` | Interactive monitoring dashboard |

---

## 8. (Optional) Nginx Configuration

Using Nginx is the recommended way to serve the frontend in production and reverse-proxy API requests.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve frontend static files
    root /path/to/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy the backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded images
    location /uploads/ {
        alias /path/to/project/backend/uploads/;
    }
}
```

After adding your config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If you use Nginx to serve `dist/`, you can stop the `kojast-frontend` PM2 process — it is no longer needed:

```bash
pm2 delete kojast-frontend
pm2 save
```

---

## API Reference

See [`README.md`](./backend/README.md) and [`backend/API_DOCUMENTATION.md`](./backend/API_DOCUMENTATION.md) for full API documentation.

Default backend port: **3000**
Default frontend preview port: **4173**
