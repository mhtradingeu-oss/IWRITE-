# IWRITE - Design Guidelines

## Design Approach

**System Selection**: Fluent Design-inspired productivity interface
**Rationale**: This is an information-dense, utility-focused application where efficiency, professional aesthetics, and clear information hierarchy are paramount. The workspace needs to handle complex workflows while remaining approachable.

**Key Design Principles**:
- Clarity over decoration - every element serves a functional purpose
- Efficient information density - maximize workspace utility
- Professional trust - enterprise-grade visual language
- Multi-language excellence - seamless RTL/LTR support

## Typography System

**Font Families**:
- **Primary Interface**: Inter (via Google Fonts) - exceptional multi-language support, excellent readability at all sizes
- **Document Content**: Georgia for serif warmth in document previews, Inter for UI elements
- **Code/Technical**: JetBrains Mono for file names and technical identifiers

**Hierarchy**:
- Page Titles: 2xl font weight 700
- Section Headers: xl font weight 600  
- Body Text: base font weight 400
- Captions/Meta: sm font weight 500
- RTL Support: Ensure proper alignment and text direction switching for Arabic

## Layout Architecture

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Micro spacing (2-4): Component internal padding
- Standard spacing (6-8): Between related elements  
- Section spacing (12-16): Between component groups
- Major spacing (20-24): Between distinct sections

**Grid Structure**:
- Sidebar navigation: 280px fixed width
- Main workspace: flex-1 with max-w-7xl container
- Multi-column layouts: 2-column for document/preview split, 3-column for file grid
- Responsive breakpoints: Single column mobile, 2-column tablet, full layout desktop

## Core Components

### Navigation & Structure
- **Sidebar**: Fixed left panel with nested navigation for Projects → Documents → Versions
- **Top Bar**: Breadcrumb navigation, language switcher (AR/EN/DE flags), user profile
- **Action Bar**: Sticky top-of-workspace toolbar for primary actions (New Document, Upload, Export)

### Document Workspace
- **Editor Panel**: Full-height, clean white background with subtle border
- **Preview Panel**: Side-by-side split view, live document preview with template applied
- **Properties Panel**: Collapsible right sidebar for document metadata, QA checks, version history

### File Management
- **Upload Zone**: Large drag-drop area with dotted border, prominent upload icon, file type badges
- **File Grid**: Card-based layout showing thumbnails, file names, upload dates, processing status
- **File Cards**: Compact with icon, name, size, actions menu (view, download, delete)

### AI Generation Interface
- **Prompt Input**: Expandable textarea with character count, template selector dropdown
- **Generation Controls**: Document type selector (blog, proposal, contract, etc.), tone/style presets, language toggle
- **Progress Indicator**: Clear loading states with percentage, estimated time remaining
- **Result Display**: Generated content in editable rich text editor with diff highlighting for revisions

### Quality Assurance Dashboard
- **Check Results Panel**: Color-coded badges for passed/failed checks (green/yellow/red)
- **Issue Cards**: Each QA issue displayed with severity, description, suggested fix, accept/reject actions
- **Validation Summary**: Header metrics showing total checks, passed, warnings, errors

### Template Management
- **Template Library**: Grid of template cards with preview thumbnails
- **Template Editor**: Split view with template code (left) and preview (right)
- **Brand Assets**: Upload zones for logos, headers, footers with position/sizing controls

### Export & Archive
- **Export Modal**: Format selection (MD/DOCX/PDF), version selection, download button
- **Version History**: Timeline view showing version numbers, timestamps, author, change summary
- **Archive Browser**: Filterable list with search, date range picker, restore capability

## Visual Treatment

**Surfaces**:
- Background: Soft neutral (gray-50)
- Cards/Panels: White with subtle shadow
- Sidebar: Light gray (gray-100) for depth
- Active states: Subtle blue tint (blue-50)

**Borders & Dividers**:
- Standard borders: 1px solid gray-200
- Focus borders: 2px solid blue-500
- Section dividers: gray-200

**Elevation**:
- Level 1 (cards): shadow-sm
- Level 2 (modals): shadow-lg
- Level 3 (dropdowns): shadow-xl

## Interactive Elements

**Buttons**:
- Primary: Solid background, medium size, rounded corners
- Secondary: Outlined with hover fill
- Text buttons: For tertiary actions
- Icon buttons: For toolbars and compact spaces

**Form Inputs**:
- Text fields: Full-width with clear labels, helper text below
- Dropdowns: Custom styled with search for long lists
- File inputs: Custom upload button with drag-drop zone
- Toggle switches: For binary settings (enable/disable features)

**Feedback Mechanisms**:
- Toast notifications: Top-right corner for success/error messages
- Inline validation: Real-time feedback on form inputs
- Loading skeletons: For async content loading
- Progress bars: For file uploads and AI generation

## Data Display

**Tables**: Striped rows for readability, sortable headers, fixed header on scroll
**Lists**: Alternating background subtle tint, hover highlight
**Metrics/Stats**: Large numbers with descriptive labels, use cards for grouping
**Status Indicators**: Colored dots with text labels (processing, completed, failed)

## RTL/Multi-Language Considerations

- Mirror layout completely for Arabic (sidebar right, text alignment right)
- Maintain consistent spacing regardless of direction
- Icon positions adapt to reading direction
- Date/time formats localized per language
- Number formatting respects locale (Arabic numerals in AR context)

## Images & Media

**Hero Section**: Professional workspace imagery showing document collaboration or AI assistance
**Placeholder Content**: Use document icons, file type illustrations
**Empty States**: Friendly illustrations encouraging first actions
**Avatars**: Circular user avatars, fallback to initials with colored backgrounds

This design system prioritizes **professional functionality** while maintaining visual refinement suitable for enterprise document workflows.