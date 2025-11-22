# IWRITE - Production Deployment Guide

**IWRITE** is an AI-powered, multi-language workspace for document creation, templates, songwriting, quality assurance, and topic intelligence. This guide covers production deployment.

---

## 📋 Quick Overview

- **Multi-Language:** Arabic (RTL), English, German
- **Key Features:** AI-powered document generation, songwriter, templates, style profiles, file uploads, QA checks, topic organization, multi-format export
- **Architecture:** Express.js backend + React frontend, PostgreSQL database
- **Runtime:** Node.js 18+ (tested on 18, 20)
- **Deployment:** Standard Node.js app (no special containers required)

---

## 🎯 Quick Start

### Development (Local)

```bash
# 1. Clone and install
git clone https://github.com/your-org/iwrite.git
cd iwrite
npm install

# 2. Set environment variables
export DATABASE_URL="postgresql://user:password@localhost/iwrite"
export AI_INTEGRATIONS_OPENAI_BASE_URL="https://api.openai.com/v1"
export AI_INTEGRATIONS_OPENAI_API_KEY="sk-..."
export NODE_ENV=development

# 3. Setup database (if not using existing)
npm run db:push

# 4. Start development server
npm run dev
# Opens http://localhost:5000
```

### Production (Any Host)

```bash
# 1. Clone and install
git clone https://github.com/your-org/iwrite.git
cd iwrite
npm install

# 2. Set environment variables (REQUIRED)
export DATABASE_URL="postgresql://user:password@host/iwrite"
export AI_INTEGRATIONS_OPENAI_BASE_URL="https://api.openai.com/v1"
export AI_INTEGRATIONS_OPENAI_API_KEY="sk-..."
export NODE_ENV=production

# 3. Setup database
npm run db:push

# 4. Build for production
npm run build

# 5. Start production server
npm run start
# Server runs on http://0.0.0.0:5000 (or custom PORT)
```

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/iwrite` |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI API endpoint | `https://api.openai.com/v1` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Google Cloud Storage bucket | (disabled) |

### Configuration Validation

The app validates all required env vars at startup. Missing vars will cause a clear error:

```
❌ PRODUCTION CONFIGURATION ERROR
Missing required environment variable: DATABASE_URL
```

---

## 🔒 Security & Authentication

### ⚠️ CRITICAL: No Authentication

**IWRITE v1 does NOT include authentication or user isolation.** All users share the same workspace.

**Deployment Options:**

1. **Internal Use Only** (Recommended for v1)
   - Deploy on private network or VPN
   - Behind corporate firewall
   - Suitable for internal teams

2. **With External Auth** (Production-Ready)
   - Deploy behind reverse proxy with authentication:
     - Nginx + OAuth2 proxy
     - Cloudflare Access
     - AWS ALB with Cognito
   - Add authentication layer in front

3. **Do NOT Deploy** to public internet without auth layer

### Security Features Included

✅ **Request Size Limits:** 10MB JSON/URL-encoded to prevent DoS  
✅ **CORS Configuration:** Configurable via `CORS_ORIGIN` env var  
✅ **Error Handling:** No stack traces exposed in production  
✅ **Graceful Shutdown:** SIGTERM handling for clean restarts  
✅ **Health Checks:** `/healthz` endpoint for monitoring  

---

## 📦 Building for Production

### Build Process

```bash
# 1. Type check (optional but recommended)
npm run check

# 2. Build production bundle
npm run build

# Creates:
# - dist/index.js (92.8KB server bundle, minified)
# - dist/public/ (frontend with optimized CSS/JS)
```

### Build Output Structure

```
dist/
├── public/              # Frontend static assets
│   ├── assets/         # Minified CSS, JS bundles
│   └── index.html      # React entry point
└── index.js            # Production server (ESM format)
```

### Verification

```bash
# Check build output
ls -lh dist/

# Verify bundle sizes
du -sh dist/*

# Test production build locally
NODE_ENV=production npm run start
curl http://localhost:5000/healthz
```

---

## 🚀 Deployment Scenarios

### Scenario 1: VPS (Ubuntu + Node + PM2 + Nginx)

**Setup:**

```bash
# 1. Install Node.js (Ubuntu 22.04)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2 globally
sudo npm install -g pm2

# 3. Clone and build
cd /opt
sudo git clone https://github.com/your-org/iwrite.git
cd iwrite
npm install
npm run build

# 4. Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "iwrite",
    script: "./dist/index.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log"
  }]
};
EOF

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

**Nginx Reverse Proxy:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /healthz {
        proxy_pass http://localhost:5000/healthz;
        access_log off;
    }
}
```

**HTTPS (Let's Encrypt):**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Scenario 2: Managed Node Host (Render / Railway)

**Render.com:**

1. Connect GitHub repo
2. Create Web Service:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
3. Add Environment Variables:
   - DATABASE_URL
   - AI_INTEGRATIONS_OPENAI_BASE_URL
   - AI_INTEGRATIONS_OPENAI_API_KEY
   - NODE_ENV=production
4. Click Deploy

**Railway.app:**

1. Connect GitHub
2. Create Service → Select repo
3. Add variables same as above
4. Deploy automatically

### Scenario 3: Docker (Any Host)

**Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy source and build
COPY . .
RUN npm run build

# Remove source (optional, for smaller image)
RUN rm -rf server client shared

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start production server
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

**Build and Run:**

```bash
# Build image
docker build -t iwrite:latest .

# Run container
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e AI_INTEGRATIONS_OPENAI_BASE_URL="https://api.openai.com/v1" \
  -e AI_INTEGRATIONS_OPENAI_API_KEY="sk-..." \
  -e NODE_ENV=production \
  -p 5000:5000 \
  iwrite:latest
```

**Docker Compose:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      AI_INTEGRATIONS_OPENAI_BASE_URL: ${AI_INTEGRATIONS_OPENAI_BASE_URL}
      AI_INTEGRATIONS_OPENAI_API_KEY: ${AI_INTEGRATIONS_OPENAI_API_KEY}
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: iwrite
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 💾 Database Setup

### PostgreSQL Requirements

- PostgreSQL 12+
- For Neon (Replit): Automatically provisioned

### Schema Migration

```bash
# Apply schema to database
npm run db:push

# This creates all tables from shared/schema.ts
# Safe to run multiple times (idempotent)
```

### Connection String Format

```
postgresql://[user[:password]@][host][:port][/database]

Examples:
postgresql://localhost/iwrite
postgresql://user:password@db.example.com:5432/iwrite
postgresql://...neon.tech/iwrite?sslmode=require
```

---

## 📊 Monitoring & Health Checks

### Health Endpoint

```bash
GET /healthz

# Response (200 OK):
{
  "status": "ok",
  "timestamp": "2025-11-22T12:30:45.123Z",
  "environment": "production"
}
```

### Use Cases

- Load balancer health checks
- Uptime monitoring (UptimeRobot, PagerDuty)
- Kubernetes liveness probes
- Container health checks (Docker HEALTHCHECK)

### Logging

All requests logged to stdout:

```
🚀 IWRITE server running on port 5000
📍 Environment: production
🔗 Health check: http://localhost:5000/healthz
POST /api/documents 201 in 245ms
GET /api/documents 200 in 52ms
```

Integrate with:
- ELK Stack
- Datadog
- CloudWatch
- Papertrail
- Splunk

---

## 🐛 Troubleshooting

### Config Validation Error

```
Missing required environment variable: DATABASE_URL
```

**Fix:**
```bash
# Verify env var is set
echo $DATABASE_URL

# Set if missing
export DATABASE_URL="postgresql://user:password@host/iwrite"

# Try again
npm run start
```

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
```bash
# 1. Verify database is running
psql $DATABASE_URL

# 2. Check connection string format
# Should be: postgresql://user:password@host:port/database

# 3. Check firewall/network access
telnet host port

# 4. Check credentials
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```bash
# Option 1: Kill existing process
lsof -i :5000 | grep node | awk '{print $2}' | xargs kill -9

# Option 2: Use different port
PORT=3000 npm run start

# Option 3: Check what's using port
lsof -i :5000
```

### Build Fails with Module Errors

```
Cannot find module '@shared/schema'
```

**Fix:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Out of Memory

```
JavaScript heap out of memory
```

**Fix:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Or reduce file limits in server/routes.ts (line 23)
# limits: { fileSize: 50 * 1024 * 1024 } // reduce to 25MB
```

### API Returning 500 Errors

```
Errors in server logs but no clear message
```

**Fix:**
```bash
# Check server logs for full error
npm run start 2>&1 | tee app.log

# Verify env vars
env | grep -E "DATABASE_URL|AI_INTEGRATIONS|NODE_ENV"

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📋 Known Limitations (v1)

- ❌ **No Authentication:** All users share same workspace
- ❌ **PDF Export:** Returns HTML; use browser print-to-PDF or external converters
- ❌ **Embeddings:** Disabled (memory safety); keyword search only
- ⚠️ **File Limits:** 50MB max per file, 100KB for topic processing
- ⚠️ **Not Containerized:** Requires Node.js runtime on host

### Planned for v2

- [ ] User authentication & multi-tenancy
- [ ] True PDF export (Puppeteer/pdf-lib)
- [ ] AI embeddings with vector search
- [ ] File streaming for large uploads
- [ ] Request rate limiting

---

## 📝 Maintenance Checklist

### Weekly

- [ ] Monitor disk usage: `df -h`
- [ ] Check error logs for patterns
- [ ] Verify health endpoint: `curl /healthz`
- [ ] Monitor database size: `psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database"`

### Monthly

- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review and optimize slow queries
- [ ] Test disaster recovery

### Before Major Updates

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Test in staging
git checkout main && npm install && npm run build

# 3. Type check
npm run check

# 4. Run schema migration
npm run db:push

# 5. Test key features
curl http://localhost:5000/healthz
npm run start
```

---

## 🎓 Additional Resources

- **Architecture:** See `replit.md`
- **Arabic Guide:** See `docs/IWRITE-Full-Guide-AR.md`
- **API Schema:** See `shared/schema.ts`
- **Type Definitions:** Check `server/routes.ts` and `client/src/pages/`

---

## ✅ Production Readiness Checklist

- [x] Config validation at startup
- [x] Health check endpoint (/healthz)
- [x] CORS configuration
- [x] Request size limits (10MB)
- [x] Error handling middleware
- [x] Graceful shutdown (SIGTERM)
- [x] Comprehensive logging
- [x] Documentation (this file)
- [ ] User authentication (v2)
- [ ] Rate limiting (v2)

---

**Status:** Production Ready for Internal/VPN Use  
**Last Updated:** November 2025  
**Version:** 1.0

### Memory Considerations

IWRITE is optimized for Replit's memory constraints:

- **File Processing**: Files limited to 50MB upload size
- **Topic Intelligence**: Content limited to 100KB max per file
- **Database Queries**: Chunk and entity retrieval use LIMIT to prevent OOM
- **Frontend**: Built with Vite for optimal bundle size

If encountering out-of-memory errors:
1. Reduce file upload size limits in `server/routes.ts` (line 23)
2. Reduce topic intelligence chunk limits in `server/routes.ts` 
3. Split large documents into smaller files

## Database Migrations

IWRITE uses Drizzle ORM for type-safe migrations.

### Creating Migrations

```bash
npm run db:push
```

This creates the database schema from `shared/schema.ts`.

### Schema Locations

- Main schema: `shared/schema.ts`
- Drizzle config: `drizzle.config.ts`

## Replit-Specific Deployment

### Using Replit's Publishing

1. In Replit, click **Publish** button
2. Configure domain (auto-generated `.replit.dev` or custom)
3. The app is immediately available on the web

### Using Replit Workflows

The project is configured with:
- **Workflow**: "Start application"
- **Command**: `npm run dev` (development) or `npm run start` (production)
- **Port**: 5000 (standard, non-configurable)

## Docker Deployment

If deploying outside Replit:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY client/dist/ ./client/dist/

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t iwrite:latest .
docker run -e DATABASE_URL=... -e NODE_ENV=production -p 5000:5000 iwrite:latest
```

## Performance Optimization

### Frontend
- Built with Vite for fast loading
- Tailwind CSS with PurgeCSS for minimal CSS bundle
- Code splitting via React Router
- TanStack Query for efficient data fetching

### Backend
- Express.js for lightweight routing
- Drizzle ORM with efficient queries
- Request logging for monitoring
- Error handling middleware for stability

### Database
- PostgreSQL indexes on frequently queried fields
- Connection pooling via Neon serverless driver
- Efficient pagination for large datasets

## Monitoring & Logging

### API Logging
All API endpoints log:
- Method and path
- HTTP status code
- Response time in milliseconds
- Response JSON (truncated at 80 chars)

Example log output:
```
POST /api/documents 201 in 245ms
GET /api/documents 200 in 52ms
POST /api/documents/:id/export 200 in 1823ms
```

### Error Handling
- Try-catch blocks on all routes
- Validation using Zod schemas
- Clear error messages in JSON responses
- 500 status for server errors, 400 for client errors

## Troubleshooting

### "Out of Memory" Errors
- Check file sizes being uploaded (50MB limit)
- Verify topic intelligence content limits (100KB per file)
- Reduce concurrent AI requests
- Split large documents

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon database is running (in Replit)
- Test connection: `psql $DATABASE_URL`
- Review connection pooling settings

### AI Service Timeouts
- Verify `AI_INTEGRATIONS_OPENAI_API_KEY` is valid
- Check rate limits (if using standalone OpenAI)
- Increase timeout in `server/ai.ts` if needed
- Monitor API usage in OpenAI dashboard

### File Upload Failures
- Verify file type is supported (PDF, DOCX, CSV, XLSX, images)
- Check file size is under 50MB
- Ensure Google Cloud Storage bucket is configured (if using)
- Review multer error messages in logs

## Scaling Considerations

### For Higher Traffic
1. **Database**: Use Neon's auto-scaling or upgrade tier
2. **Storage**: Migrate to dedicated Google Cloud Storage
3. **API**: Add load balancer / reverse proxy
4. **Caching**: Implement Redis for query caching
5. **Workers**: Add background job processing for AI tasks

### For Larger Files
1. Increase file size limits (currently 50MB)
2. Implement streaming file uploads
3. Add chunk-based processing for large PDFs
4. Use worker processes for file extraction

### For High User Count
1. Add user authentication and multi-tenancy
2. Implement request rate limiting
3. Add query result caching
4. Optimize database indexes
5. Consider CQRS pattern for complex queries

## Maintenance

### Regular Tasks
- Monitor disk space and database size
- Review error logs for patterns
- Update dependencies monthly
- Backup database regularly
- Test disaster recovery procedures

### Database Backups
For Neon in Replit:
1. Use Replit's database backup feature
2. Or export via SQL: `pg_dump $DATABASE_URL > backup.sql`
3. Store backups in Google Cloud Storage or secure location

### Updating IWRITE
1. Test changes in development
2. Run `npm run check` for type errors
3. Run `npm run db:push` for migrations
4. Build: `npm run build`
5. Deploy: Push to production environment
6. Verify: Test key features in production

## Support & Documentation

- GitHub: [IWRITE repository]
- Docs: See README.md for features and architecture
- Issues: Report bugs and feature requests
- Schema: See `shared/schema.ts` for data model

## FAQ

**Q: Can I use a different database?**
A: Yes, update `DATABASE_URL` to any PostgreSQL connection string. Drizzle ORM handles compatibility.

**Q: How do I add custom file types?**
A: Edit `server/routes.ts` line 25 to add MIME types to `allowedMimes`.

**Q: Can I use a different AI provider?**
A: Yes, modify `server/ai.ts` to use your API (Claude, Llama, etc.).

**Q: How do I implement user authentication?**
A: See `replit.md` for authentication architecture. Consider using Passport.js (already installed).

**Q: Is there a free tier?**
A: IWRITE itself is free and MIT-licensed. Database, AI, and storage services may have costs.
