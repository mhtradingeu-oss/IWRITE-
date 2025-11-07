# HAIROTICMEN Writer

## Overview

HAIROTICMEN Writer is an AI-powered document writing workspace designed for professional content creation with comprehensive multi-language support (Arabic, English, German). The application provides intelligent document generation, template management, style profiles, and automated quality assurance checks for various document types including blogs, proposals, contracts, policies, presentations, product pages, and social media content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Design follows Fluent Design-inspired productivity interface principles

**Styling & Theming**
- Custom CSS variables for theme tokens (light/dark mode support)
- Multi-directional text support (LTR/RTL) for Arabic language
- Typography system using Inter for interface, Georgia for documents, and JetBrains Mono for technical text
- Consistent spacing scale based on Tailwind's spacing units

**State Management**
- React Context API for theme and language preferences
- TanStack Query for API data fetching, caching, and mutations
- Local storage persistence for user preferences (theme, language)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API endpoints
- ESM module system for modern JavaScript features
- Custom request logging middleware for API monitoring

**API Design**
- RESTful endpoints organized by resource (`/api/dashboard/stats`, `/api/documents`, `/api/templates`, etc.)
- Multer middleware for file upload handling with 50MB limit
- Zod schema validation for request payload validation using drizzle-zod integration

**AI Integration**
- OpenAI integration via Replit AI Integrations service (no API key required)
- AI capabilities include:
  - Document generation from prompts
  - Document rewriting with style profiles
  - Multi-language translation (AR/EN/DE)
  - Quality assurance checks (medical claims, disclaimers, number consistency, product codes)
- Rate limiting and retry logic with p-limit and p-retry libraries

**File Processing**
- PDF text extraction using pdfjs-dist
- DOCX text extraction using mammoth
- CSV/XLSX processing using xlsx library
- Support for images (PNG, JPEG, GIF, WebP)

**Topic Intelligence System** (Nov 2025)
- Simplified keyword-based approach (no AI embeddings to avoid memory constraints)
- Document chunking with configurable size (default 800 chars, max 200 chunks per file)
- Entity extraction: numbers, dates, medical terms, product codes, regulations
- Topic classification based on keyword matching
- Multi-source document synthesis via Topic Packs
- Keyword-based search across all topics and documents
- Memory protection: 10MB file limit, 500KB text, 1000 rows for CSV/XLSX
- **OOM Fix (Nov 7, 2025)**: Added limit support to `getChunksByTopic()` and `getEntitiesByTopic()` storage methods
  - API endpoints now respect `?limit=N` query parameter
  - `getEntitiesByTopic()` only fetches chunk IDs (not full content) to prevent memory bloat
  - Frontend limits: 50 chunks, 100 entities per topic
  - Uses Drizzle ORM `inArray()` helper for efficient SQL queries
- **XSS Fix (Nov 7, 2025)**: TopicSearch now escapes HTML before applying search highlights to prevent script injection

**Document Export**
- Multi-format export system (Markdown ✅, DOCX ✅, PDF pending)
- Markdown export with metadata and template support - fully operational
- DOCX generation using docx library with proper document structure - fully operational
- PDF export currently returns styled HTML (true PDF generation requires Puppeteer or pdf-lib library)
- Template integration for headers, footers, and branding
- Export endpoint: POST /api/documents/:id/export - confirmed working with 200 responses
- Export UI with dialog and format selection buttons - fully functional
- File uploads fixed (Nov 2025): Changed storageUrl → filePath to match database schema, uploads now persist correctly

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript types generated from Drizzle schemas

**Database Schema**
- **documents**: Core document storage with content, type, language, template/style profile references
- **templates**: Reusable document templates with header, footer, logo, and color scheme
- **styleProfiles**: Writing style definitions (tone, voice, guidelines)
- **uploadedFiles**: Metadata and storage URLs for uploaded files
- **documentVersions**: Version history for document changes
- **qaCheckResults**: Quality assurance check results with issue tracking
- **Topic Intelligence tables**:
  - **topics**: Topic definitions with name, description, keywords
  - **documentTopics**: Links uploaded files to topics for organization
  - **documentChunks**: Text chunks from uploaded files with metadata
  - **entities**: Extracted entities (numbers, dates, medical terms, product codes) from chunks
  - **topicPacks**: Pre-built topic packages for multi-source document synthesis

**Storage Strategy**
- PostgreSQL database for all persistent data (documents, templates, style profiles, versions, QA results)
- DbStorage class with Drizzle ORM for type-safe database operations
- In-memory fallback for testing when DATABASE_URL not available
- Google Cloud Storage integration for production file uploads (when `DEFAULT_OBJECT_STORAGE_BUCKET_ID` is set)
- File metadata stored in database, actual files in object storage

### Authentication & Authorization

Currently not implemented - the application operates without user authentication. Future implementation would require:
- User session management
- Document ownership and access control
- Multi-tenant data isolation

## External Dependencies

### AI Services
- **Replit AI Integrations**: OpenAI-compatible API for document generation, rewriting, translation, and QA checks
- Configuration via environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

### Database
- **Neon Postgres**: Serverless PostgreSQL database
- Connection string via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations

### Cloud Storage (Production Only)
- **Google Cloud Storage**: Object storage for uploaded files
- Bucket ID via `DEFAULT_OBJECT_STORAGE_BUCKET_ID` environment variable
- Automatic service account authentication in production environment

### Third-Party Libraries
- **Radix UI**: Unstyled, accessible component primitives for dialogs, dropdowns, tooltips, etc.
- **Uppy**: File upload widget with AWS S3 support (configured for future use)
- **React Hook Form**: Form state management with Zod resolver for validation
- **Lucide React**: Icon library for UI components

### Development Tools
- **Replit Plugins**: Development banner, cartographer for code navigation, runtime error modal
- **TypeScript**: Static type checking across client, server, and shared code
- **ESBuild**: Fast bundling for server-side code in production builds