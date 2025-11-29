# IWRITE

An AI-powered, multi-language document workspace for intelligent content creation, generation, and quality assurance.

## Overview

IWRITE is a full-stack TypeScript + React + PostgreSQL application designed for professional document creation with:

- **AI-Powered Document Generation**: Create, rewrite, translate, and improve documents using OpenAI integration
- **Multi-Language Support**: Full support for Arabic, English, and German with proper RTL handling
- **Topic Intelligence**: Keyword-based document search, entity extraction, and topic classification
- **Quality Assurance**: Automated checks for medical claims, disclaimers, numeric consistency, and product codes
- **Template & Style Management**: Reusable templates and writing style profiles with brand colors
- **Multi-Format Export**: Export to Markdown, DOCX, and styled HTML
- **File Management**: Upload and manage PDFs, DOCX, CSV, XLSX, and images (up to 50MB)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for client-side routing
- **TanStack Query (React Query)** for server state management
- **Shadcn/ui** component library built on Radix UI
- **Tailwind CSS** for utility-first styling

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** via Neon serverless driver
- **Drizzle ORM** for type-safe database queries
- **OpenAI API** for document generation and QA checks

### Additional Services
- **Google Cloud Storage** for file uploads (production)
- **pdfjs-dist**, **mammoth**, **xlsx** for file processing

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (or use Replit's built-in Neon database)
- OpenAI API key (or use Replit AI Integrations)

### Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file (if not using Replit's secrets):
   ```
   DATABASE_URL=postgresql://user:password@host/database
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   AI_INTEGRATIONS_OPENAI_API_KEY=your-api-key
   DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id  # optional
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5000 in your browser.

### Building for Production

```bash
npm run build
npm run start
```

The application will be served on port 5000.

## Docker Workflows

Dockerized dev and prod flows now live side by side with isolated networks, volumes, and environment files.

### Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Starts Postgres (`5433`), Redis (`6380`), and the Express/Vite dev server (`5000`).
- `server/.env.docker.dev` provides the runtime defaults; adjust secrets there if needed.
- Code changes are reflected immediately because the project directory is mounted into the container.

### Production

```bash
docker compose up --build
```

- Builds the full stack (backend + static frontend) and exposes the API at `http://localhost:5000` and the SPA via Nginx at `http://localhost:8080`.
- `server/.env.docker` captures production-ready secrets; update it with your OpenAI key, JWT secret, Stripe credentials, etc.
- Each service runs on its own Docker network/volume pair so the database, cache, backend, and frontend do not interfere with one another.

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # React components (UI, sidebar, header)
│   │   ├── pages/            # Page components (Dashboard, AIWriter, Documents, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and React Query config
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   └── index.html
├── server/
│   ├── topic-intelligence/   # Topic intelligence service (chunking, entity extraction)
│   ├── ai.ts                 # OpenAI integration
│   ├── export.ts             # Document export (MD, DOCX, PDF)
│   ├── fileProcessing.ts     # File upload and text extraction
│   ├── storage.ts            # Database operations
│   ├── routes.ts             # API endpoints
│   ├── index.ts              # Express server entry
│   └── vite.ts               # Vite development setup
├── shared/
│   └── schema.ts             # TypeScript schema definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── drizzle.config.ts
```

## Key Features

### 1. Document Management
- Create, edit, and delete documents
- Version history tracking
- Multi-format export (Markdown, DOCX, HTML)
- Document templates with branding support

### 2. AI Writer
- **Prompt Box**: Write custom prompts for document generation
- **Task Presets**: Predefined tasks (new doc, rewrite, summarize, expand, translate, fix style)
- **Controls**:
  - Document type selection
  - Language choice (AR/EN/DE)
  - Tone and formality settings
  - Content length preference
  - Template selection
  - Source document selection
- **Editor**: Interactive editor for AI-generated drafts with improvement options

### 3. Topic Intelligence
- **Document Chunking**: Automatically split documents into searchable passages
- **Keyword Search**: Search across all documents and passages
- **Entity Extraction**: Identify numbers, dates, medical terms, product codes
- **Topic Classification**: Organize content by topics and keywords
- **Topic Packs**: Pre-built topic packages for multi-source synthesis

### 4. Quality Assurance
- **Automated Checks**:
  - Medical/sensitive claims detection
  - Disclaimer verification
  - Numeric consistency validation
  - Product code verification
- **Results Display**: Clear UI with severity levels (green/yellow/red) and suggested fixes

### 5. Template & Brand Management
- Create and manage document templates
- Define style profiles (tone, voice, guidelines)
- Apply brand colors and layouts
- Include headers, footers, and logos

### 6. File Uploads
- Support for PDF, DOCX, CSV, XLSX, PNG, JPEG, GIF, WebP
- Automatic text extraction and processing
- Up to 50MB file size limit
- Organized file management interface

## API Endpoints

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `POST /api/documents` - Create new document
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/export` - Export document

### AI Operations
- `POST /api/documents/generate` - Generate new document from prompt
- `POST /api/documents/:id/improve` - Improve/rewrite document
- `POST /api/documents/:id/translate` - Translate document
- `POST /api/documents/:id/qa-check` - Run QA checks

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Topic Intelligence
- `GET /api/topics` - List topics
- `POST /api/topics` - Create topic
- `GET /api/topics/:id/search` - Search by keyword
- `GET /api/topics/:id/chunks` - Get document chunks
- `GET /api/topics/:id/entities` - Get extracted entities

### File Uploads
- `GET /api/uploads` - List uploaded files
- `POST /api/uploads` - Upload file
- `DELETE /api/uploads/:id` - Delete uploaded file

## Database Schema

The application uses PostgreSQL with the following main tables:

- **documents**: Core document storage
- **templates**: Reusable document templates
- **styleProfiles**: Writing style definitions
- **uploadedFiles**: File metadata and storage
- **documentVersions**: Version history
- **qaCheckResults**: QA check results
- **topics**: Topic definitions
- **documentChunks**: Text chunks from files
- **entities**: Extracted entities (numbers, dates, medical terms, etc.)
- **topicPacks**: Pre-built topic packages

See `shared/schema.ts` for detailed schema definitions.

## Known Limitations

### Topic Intelligence
- Files with extracted content >100KB cannot be processed. Upload will succeed but processing will fail. Recommendation: split large files or reduce content before upload.
- Memory protection limits (100KB max content per file, 100 chunks max per topic)

### PDF Export
- Current implementation exports as styled HTML
- True PDF generation requires Puppeteer or pdf-lib (prepared as TODO for future enhancement)

### Performance
- Designed for Replit environment with memory constraints
- Optimized for documents up to ~50MB file size
- Chunk processing limited to prevent out-of-memory errors

## Environment Variables

Required for development:
```
DATABASE_URL          # PostgreSQL connection string
PORT                  # Server port (default: 5000)
NODE_ENV              # Development or production
```

Optional for AI features:
```
AI_INTEGRATIONS_OPENAI_BASE_URL    # OpenAI API base URL
AI_INTEGRATIONS_OPENAI_API_KEY     # OpenAI API key
```

Optional for file storage:
```
DEFAULT_OBJECT_STORAGE_BUCKET_ID   # Google Cloud Storage bucket
```

## Development

### Type Checking
```bash
npm run check
```

### Database Migrations
```bash
npm run db:push
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Document Management | ✅ Working | Full CRUD operations |
| AI Document Generation | ✅ Working | Using OpenAI API |
| Template Management | ✅ Working | With brand colors |
| Style Profiles | ✅ Working | Tone and voice control |
| Topic Intelligence | ✅ Working | Keyword-based search |
| QA Checks | ✅ Working | Multiple validation types |
| Multi-Language Support | ✅ Working | AR/EN/DE with RTL |
| File Upload & Processing | ✅ Working | PDF, DOCX, CSV, XLSX, images |
| Export (Markdown) | ✅ Working | With metadata |
| Export (DOCX) | ✅ Working | Full formatting support |
| Export (PDF) | 🔶 Partial | HTML output, true PDF pending |
| Dark Mode | ✅ Working | Full light/dark theme support |

## License

MIT

## Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.
