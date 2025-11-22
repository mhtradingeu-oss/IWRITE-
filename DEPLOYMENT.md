# IWRITE Deployment Guide

This guide covers deploying IWRITE to production environments.

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Server Configuration
NODE_ENV=production
PORT=5000

# AI Services (using Replit AI Integrations or standalone OpenAI)
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...

# Optional: Google Cloud Storage for file uploads
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
```

### Setting Up in Replit

1. **Database**
   - IWRITE uses Replit's built-in Neon PostgreSQL database
   - The `DATABASE_URL` is automatically available in Replit environments
   - No manual setup required

2. **AI Integration**
   - Use Replit AI Integrations for OpenAI access
   - Configure via Replit's integration panel (no API key needed)
   - Variables automatically populated: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

3. **Object Storage** (Optional)
   - Use Replit's object storage integration for production file uploads
   - Configure bucket ID: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
   - Without this, files are stored in database (development mode)

## Building for Production

```bash
# Install dependencies
npm install

# Run type checking
npm run check

# Build the application
npm run build

# This creates:
# - dist/index.js (server bundle)
# - client/dist/ (frontend bundle)
```

## Running in Production

```bash
# Start the application
npm run start

# The app will be available at http://0.0.0.0:5000
```

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
