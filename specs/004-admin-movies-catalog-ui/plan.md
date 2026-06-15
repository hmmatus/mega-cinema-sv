---
feature: Admin Movies Catalog UI
branch: feat/admin-movies-catalog-ui
status: draft
spec: specs/004-admin-movies-catalog-ui/spec.md
created: 2026-06-14
---

# Plan Técnico: Admin Movies Catalog UI

## Resumen

Interfaz admin para gestionar catálogo de películas. Construida en `apps/admin` (Next.js) usando TanStack Query + Zod en capa de datos, componentes reutilizables de `@cinema/ui`, y patrones MVVM para viewmodels. API soportada por endpoints NestJS en `apps/api` (ya existe, usado de spec 003-movies-locations-banners-api).

---

## Contexto Técnico

| Aspecto | Decisión |
|---------|----------|
| Apps afectadas | `apps/admin` (UI), `apps/api` (endpoints ya existen) |
| Paquetes afectados | `@cinema/ui` (nuevos componentes), `@cinema/shared` (tipos Movie) |
| Cambios de schema | No — schema Movie ya existe en spec 003 |
| Nuevos endpoints | No — GET/POST/PUT/DELETE `/api/movies` ya existen (spec 003) |
| Servicios externos | Supabase (DB), JWT auth |
| Testing framework | Vitest (admin frontend) |

---

## Verificación de Constitución

Checklist contra `specs/constitution.md`:

- [x] **Principio 1 — Integridad del Dominio:** Máx 5 tickets es para reservas (no aplica). Soft delete (ARCHIVED status) respeta transiciones de estado.
- [x] **Principio 2 — Schema como Fuente de Verdad:** No hay cambios de schema. Importar tipos de `@cinema/database` + `@cinema/shared`.
- [x] **Principio 3 — Seguridad por Defecto:** GET público, POST/PUT/DELETE requieren `admin` role + JWT guard en API.
- [x] **Principio 4 — Patrones Establecidos:** Frontend usa MVVM (viewmodel hook), TanStack Query, Zod. Backend ya existe.
- [x] **Principio 5 — Calidad antes de Merge:** Tests en verde + type-check + 80%+ coverage por escenario P1.

**Desviaciones:** Ninguna.

---

## Inventario de Componentes Existentes

| Componente | Ubicación | Estado | Reutilizable |
|-----------|-----------|--------|--------------|
| Button | `@cinema/ui` | ✅ Existe | Sí |
| Input | `@cinema/ui` | ✅ Existe | Sí |
| Checkbox | `@cinema/ui` | ✅ Existe | Sí |
| Card | `@cinema/ui` | ✅ Existe | Sí |
| Modal | `@cinema/ui` | ❌ No existe | → Crear |
| Table | `@cinema/ui` | ❌ No existe | → Crear |
| Select | `@cinema/ui` | ❌ No existe | → Crear |
| DatePicker | `@cinema/ui` | ❌ No existe | → Crear |
| Badge | `@cinema/ui` | ❌ No existe | → Crear |
| Pagination | `@cinema/ui` | ❌ No existe | → Crear |

---

## Componentes a Crear (Reutilizables en `@cinema/ui`)

### Base Components

#### 1. **Modal** (`@cinema/ui/Modal/`)
```typescript
// @cinema/ui/Modal/Modal.tsx
export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  closeButtonLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, title, description, onClose, children, size = 'md'
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className={cn('bg-white rounded-lg shadow-lg', {
        'max-w-sm': size === 'sm',
        'max-w-md': size === 'md',
        'max-w-lg': size === 'lg',
      })} onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Test Contract:
// ✓ Modal hidden when isOpen = false
// ✓ Modal visible when isOpen = true
// ✓ onClose called when backdrop clicked
// ✓ onClose NOT called when content clicked
// ✓ Children rendered inside modal
// ✓ Title and description displayed
// ✓ Size classes apply correctly
```

#### 2. **Table** (`@cinema/ui/Table/`)
```typescript
// @cinema/ui/Table/Table.tsx
export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}

// Test Contract:
// ✓ Renders header row with all column labels
// ✓ Renders data rows with correct values
// ✓ rowKey used as unique key
// ✓ onRowClick called when row clicked (if provided)
// ✓ render() function used for custom cell content
// ✓ Loading skeleton shown when isLoading = true
// ✓ Empty state when data.length = 0
// ✓ Sort icon shown on sortable columns
// ✓ onSort called with column key and direction when sort clicked
```

#### 3. **Select** (`@cinema/ui/Select/`)
```typescript
// @cinema/ui/Select/Select.tsx
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

// Test Contract:
// ✓ Renders placeholder when no value selected
// ✓ Shows selected label when value set
// ✓ Dropdown opens/closes on click
// ✓ onChange called with selected value
// ✓ Disabled option cannot be selected
// ✓ Multiple selection (if enabled) allows multi-check
// ✓ Clear button removes selection (if clearable)
// ✓ Keyboard navigation (arrow keys)
```

#### 4. **DatePicker** (`@cinema/ui/DatePicker/`)
```typescript
// @cinema/ui/DatePicker/DatePicker.tsx
export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: string; // 'MM/dd/yyyy'
}

export interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

// Test Contract:
// ✓ Inline calendar renders correctly
// ✓ Selected date highlighted
// ✓ onChange called when day clicked
// ✓ Disabled dates (before minDate/after maxDate) greyed out
// ✓ Navigation to previous/next month works
// ✓ Input field shows formatted date
// ✓ DateRangePicker allows start + end selection
// ✓ Dates less than minDate/greater than maxDate disabled
```

#### 5. **Badge** (`@cinema/ui/Badge/`)
```typescript
// @cinema/ui/Badge/Badge.tsx
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// Test Contract:
// ✓ Renders children text
// ✓ Variant colors apply correctly:
//   - default: gray
//   - success: green (RELEASED)
//   - warning: amber (UPCOMING)
//   - error: red (ARCHIVED)
//   - info: blue
// ✓ Size classes apply (padding, font-size)
```

#### 6. **Pagination** (`@cinema/ui/Pagination/`)
```typescript
// @cinema/ui/Pagination/Pagination.tsx
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showPageInfo?: boolean;
}

// Test Contract:
// ✓ Prev button disabled on first page
// ✓ Next button disabled on last page
// ✓ onPageChange called with correct page number
// ✓ Page info displayed (1-10 of 50 results)
// ✓ Input field accepts page number jump
// ✓ Loading state shows skeleton
```

### Feature Components

#### 7. **MoviesList** (`apps/admin/src/features/movies/components/MoviesList/`)
```typescript
// Folder structure per PascalCase component + mvvm-component skill
// - MoviesList.tsx (main component)
// - MoviesList.viewmodel.ts (useMoviesList hook)
// - MoviesList.test.tsx (component test)
// - types.ts (component-specific types)

// Test Contract:
// ✓ Renders table with columns: Poster, Title, Status, Visibility, Created, Actions
// ✓ Creates/Edits/Deletes buttons visible for admin role
// ✓ Delete button shows modal confirmation
// ✓ Row click navigates to detail view
// ✓ Search input filters by title in real-time
// ✓ Status/Visibility filters work independently and combined
// ✓ Pagination controls shown and functional
// ✓ Loading state shows skeleton table
// ✓ Error state shows retry button
// ✓ Empty state shows message: "No se encontraron películas"
```

#### 8. **MovieForm** (`apps/admin/src/features/movies/components/MovieForm/`)
```typescript
// Folder structure:
// - MovieForm.tsx
// - MovieForm.viewmodel.ts (useMovieForm)
// - MovieForm.test.tsx
// - types.ts

// Test Contract:
// ✓ Create mode: empty form, title says "Nueva película"
// ✓ Edit mode: pre-populated with movie data
// ✓ Required fields: title, duration, status, visibility
// ✓ Duration: must be positive number
// ✓ URLs (poster, trailer): valid URL format or empty
// ✓ Submit button: calls API (createMovie or updateMovie)
// ✓ Loading state: button disabled, spinner shown
// ✓ Success: toast notification, navigate back to list
// ✓ Error: show error message, allow retry
// ✓ Cancel: back button without save (with dirty check)
// ✓ Genres/Cast: array input (add/remove items)
// ✓ Featured checkbox: toggles featured flag
```

#### 9. **MovieFilters** (`apps/admin/src/features/movies/components/MovieFilters/`)
```typescript
// Folder structure:
// - MovieFilters.tsx
// - MovieFilters.viewmodel.ts
// - MovieFilters.test.tsx
// - types.ts

// Test Contract:
// ✓ Search input: changes applied in real-time
// ✓ Status select: filters by UPCOMING|PRERELEASE|RELEASED|ARCHIVED
// ✓ Visibility select: filters by PUBLIC|INTERNAL|HIDDEN
// ✓ Date range: filters movies between startDate and endDate
// ✓ Clear filters button: resets all to default
// ✓ Applied filters shown as badges
// ✓ onChange callbacks called with updated filters
```

#### 10. **MovieDetails** (`apps/admin/src/features/movies/components/MovieDetails/`)
```typescript
// Folder structure:
// - MovieDetails.tsx
// - MovieDetails.viewmodel.ts (useMovieDetails)
// - MovieDetails.test.tsx
// - types.ts

// Test Contract:
// ✓ Displays all movie fields: title, description, poster, rating, etc.
// ✓ Edit button: navigates to edit form
// ✓ Delete button: shows confirmation modal
// ✓ Archive button (status = ARCHIVED): soft delete
// ✓ Shows "Associated showtimes" section (if exists)
// ✓ Loading state: skeleton
// ✓ Error state: retry button
// ✓ Back button: navigate to list
```

---

## Estructura de Archivos (Frontend)

### Base Components (`@cinema/ui/`)

```
packages/ui/src/
  Modal/
    Modal.tsx
    Modal.test.tsx
    index.ts
  Table/
    Table.tsx
    Table.test.tsx
    index.ts
  Select/
    Select.tsx
    Select.test.tsx
    index.ts
  DatePicker/
    DatePicker.tsx
    DateRangePicker.tsx
    DatePicker.test.tsx
    index.ts
  Badge/
    Badge.tsx
    Badge.test.tsx
    index.ts
  Pagination/
    Pagination.tsx
    Pagination.test.tsx
    index.ts
  index.ts ← export all components
```

**Component Guidelines (per `mvvm-component` skill):**
- Each component in its own folder with PascalCase name
- `Component.tsx` — pure render (no logic, only props)
- `Component.viewmodel.ts` — hooks + state management
- `Component.test.tsx` — test-first (write before implementation)
- `types.ts` — component-specific types
- `index.ts` — barrel export
- No inline styling; use Tailwind v4 classes
- No business logic in component; delegate to viewmodel hook

### Feature Components (`apps/admin/`)

```
apps/admin/src/
  domain/movies/                 ← hooks + keys (like auth domain)
    use-movies-list.ts           ← query hook with filters, pagination
    use-movie-form.ts            ← mutation hook for create/update/delete
    use-movie-details.ts         ← query hook for single movie
    movies.keys.ts               ← TanStack Query key factory
    movies.schema.ts             ← Zod schemas for validation
    movies.types.ts              ← domain types (request/response)
    
  features/movies/
    api/
      movies.api.ts              ← fetch functions (GET/POST/PUT/DELETE)
    components/
      MoviesList/
        MoviesList.tsx
        MoviesList.viewmodel.ts  ← wraps useMoviesList hook
        MoviesList.test.tsx
        types.ts
        index.ts
      MovieForm/
        MovieForm.tsx
        MovieForm.viewmodel.ts   ← wraps useMovieForm hook
        MovieForm.test.tsx
        types.ts
        index.ts
      MovieFilters/
        MovieFilters.tsx
        MovieFilters.viewmodel.ts
        MovieFilters.test.tsx
        types.ts
        index.ts
      MovieDetails/
        MovieDetails.tsx
        MovieDetails.viewmodel.ts ← wraps useMovieDetails hook
        MovieDetails.test.tsx
        types.ts
        index.ts
    pages/
      page.tsx                   ← /admin/movies (layout + MoviesList)
      [id]/
        page.tsx                 ← /admin/movies/:id (detail view)
        edit/
          page.tsx               ← /admin/movies/:id/edit (edit form)
```

---

## Creación de Componentes (MVVM Pattern)

**Para CADA nuevo componente:**

1. Create folder: `ComponentName/`
2. Write test-first: `ComponentName.test.tsx` (from spec Contract above)
3. Create types: `ComponentName.viewmodel.ts` (hooks + state)
4. Implement component: `ComponentName.tsx` (pure render, props-driven)
5. Barrel export: `index.ts` → `export { ComponentName }`
6. Use skill `/mvvm-component` with:
   - Path: `packages/ui/src/ComponentName/` or `apps/admin/src/features/movies/components/ComponentName/`
   - Component name: `ComponentName`
   - Props interface defined in `types.ts`

**Example workflow:**
```bash
# 1. Create folder structure
mkdir -p packages/ui/src/Modal

# 2. Write test file (TDD)
# packages/ui/src/Modal/Modal.test.tsx — RED (failing)

# 3. Invoke skill
/mvvm-component Modal packages/ui/src/Modal

# 4. Implement component to make test GREEN
# packages/ui/src/Modal/Modal.tsx
# packages/ui/src/Modal/Modal.viewmodel.ts

# 5. Verify test passes
pnpm test -- Modal.test.tsx
```

---

## Plan de Testing (Frontend)

Escribir tests ANTES de componentes (TDD).

### Schemas & APIs (Unit)
```typescript
// specs/004-admin-movies-catalog-ui/__tests__/movies.api.test.ts
describe('movies.api', () => {
  // Test getMovies() with filters, pagination
  // Test createMovie() with valid/invalid data
  // Test updateMovie() with partial updates
  // Test deleteMovie() with error handling
  // Test Zod schema validation for response/request
});
```

### Viewmodels (Unit)
```typescript
// specs/004-admin-movies-catalog-ui/__tests__/use-movies-list.test.ts
describe('useMoviesList', () => {
  // Test initial state: loads movies
  // Test search: filters by title
  // Test filters: status, visibility, date range
  // Test pagination: next/prev, offset handling
  // Test refresh: clear filters, reload
  // Test error handling: retry on failure
});

// specs/004-admin-movies-catalog-ui/__tests__/use-movie-form.test.ts
describe('useMovieForm', () => {
  // Test create: empty form, validation errors, success submission
  // Test edit: pre-populate from data, update submission
  // Test validation: required fields, URL format, duration > 0
  // Test loading state during submission
  // Test error display
});
```

### Components (Unit + Integration)
```typescript
// specs/004-admin-movies-catalog-ui/__tests__/MoviesList.test.tsx
describe('MoviesList', () => {
  // Render with sample data
  // Test table columns: title, poster, status, visibility, createdAt
  // Test row click: navigate to detail
  // Test delete button: show modal, confirm, call API
  // Test create button: navigate to form
  // Test search input: calls filter hook
  // Test pagination: shows page controls, navigates
  // Test loading state
  // Test empty state: "No se encontraron películas"
  // Test error state: retry button
});

// specs/004-admin-movies-catalog-ui/__tests__/MovieForm.test.tsx
describe('MovieForm', () => {
  // Test create mode: empty form
  // Test edit mode: pre-populated fields
  // Test submit: calls appropriate API method
  // Test validation: error messages on required fields
  // Test file upload (poster): [NEEDS CLARIFICATION if needed]
  // Test cancel: back navigation without saving
  // Test loading state during submission
  // Test success toast/notification
});
```

### E2E (critical flows)
```typescript
// specs/004-admin-movies-catalog-ui/__tests__/movies.e2e.test.ts
describe('Admin Movies Catalog E2E', () => {
  // EU-001: List movies, paginate
  // EU-002: Search by title
  // EU-003: Filter by status
  // EU-004: Filter by visibility
  // EU-005: Create new movie
  // EU-006: Edit existing movie
  // EU-007: Delete movie (with modal confirmation)
  // EU-008: Archive movie (status = ARCHIVED)
});
```

---

## API Contract (Reuses Spec 003)

### GET /api/movies
```typescript
Request: {
  limit?: number;        // default 10
  offset?: number;       // default 0
  search?: string;       // partial title match
  status?: MovieStatus;  // UPCOMING|PRERELEASE|RELEASED|ARCHIVED
  visibility?: MovieVisibility;  // PUBLIC|INTERNAL|HIDDEN
  fromDate?: string;     // ISO date
  toDate?: string;       // ISO date
}

Response: {
  data: Movie[];
  total: number;
  limit: number;
  offset: number;
}
```

### POST /api/movies
```typescript
Request: CreateMovieDTO {
  title: string;         // required
  description?: string;
  durationMinutes: number;  // required, > 0
  rating?: MovieRating;
  originalLanguage?: string;
  status: MovieStatus;   // required
  releaseDate?: Date;
  posterUrl?: string;    // valid URL if provided
  trailerUrl?: string;   // valid URL if provided
  director?: string;
  genres: string[];
  cast: string[];
  featured?: boolean;
  visibility: MovieVisibility;  // required
}

Response: Movie (with createdById set to current user)
```

### PUT /api/movies/:id
```typescript
Request: UpdateMovieDTO (same as Create, all optional)
Response: Movie (with updatedById set to current user)
```

### DELETE /api/movies/:id
```typescript
Response: 200 OK (movie deleted)
Error 409: if movie has showtimes → "Cannot delete movie with active showtimes"
```

---

## Flujo de Datos (Frontend)

```
User clicks "New Movie"
  ↓
Navigate to /admin/movies/create
  ↓
MovieForm rendered (empty)
  ↓
Form validation (Zod schema)
  ↓
User clicks "Save"
  ↓
useMovieForm.submit() → movies.api.createMovie()
  ↓
TanStack Query mutation
  ↓
POST /api/movies
  ↓
API response validated with Zod
  ↓
Invalidate movies query cache
  ↓
Navigate to /admin/movies
  ↓
MoviesList reloads (cache miss → refetch)
```

---

## Dependencias Externas

- **TanStack Query v5+** — already in `apps/admin`
- **Zod** — validation library
- **axios** — HTTP client (already configured in `apps/admin`)
- **Supabase Auth** — JWT from localStorage
- **react-router** — navigation (already in `apps/admin`)

---

## Tareas Ordenadas (ver `/speckit.tasks`)

1. **Crear componentes base en `@cinema/ui`** [P] parallelizable
   - Modal (test-first)
   - Table + Pagination
   - Select
   - DatePicker
   - Badge

2. **API layer: schemas + fetch functions** [P]
   - Zod schemas (Movie, CreateMovieDTO, responses)
   - movies.api.ts (GET/POST/PUT/DELETE)
   - Tests for each function

3. **Viewmodel hooks** [P]
   - use-movies-list.ts + tests
   - use-movie-form.ts + tests

4. **Components: MoviesList, MovieForm, etc.** [sequence after viewmodels]
   - Write test files first (TDD)
   - Implement components

5. **Pages: /admin/movies and sub-routes**
   - Layout + navigation
   - Integrate MoviesList, MovieForm, MovieDetails

6. **E2E tests** [final]
   - Critical user flows

7. **Audit logging** [verify with backend]
   - Ensure API creates audit_logs entries

---

## Consideraciones de Seguridad

- [x] GET `/api/movies` — no auth required (public)
- [x] POST/PUT/DELETE `/api/movies` — require JWT + `admin` role (api guard)
- [x] Frontend: check user.role before showing edit/delete buttons (UX gate)
- [x] Sensitive fields not in responses: no passwords, no service role keys
- [x] File uploads (poster): use Supabase Storage with signed URLs

---

## Definiciones Hechas

| Decisión | Razón |
|----------|-------|
| MVVM + TanStack Query | Patrón establecido en codebase (spec 4 — principio 4) |
| Zod for validation | Type-safe runtime validation + generated types |
| Components from `@cinema/ui` | Reusability, shared design system |
| TDD (test-first) | Highest confidence in behavior before implementation |
| Soft delete (ARCHIVED status) | Preserve history, safer than cascading hard delete |
| GET public, others auth-protected | Match security principle 3 + domain rules |

---

## Señales de Alerta

- [ ] Endpoint no valida con Zod → test falla
- [ ] Component test fails without implementation → RED, fix first
- [ ] User can edit/delete without admin role → security bug
- [ ] Archived movie still shows in customer view → implement filter
- [ ] DELETE cascade on showtimes → should fail with 409

---

## Siguiente Paso

1. ✅ Spec creado y clarificado
2. ✅ Plan técnico (este documento)
3. → `/speckit.tasks` — generar tareas ordenadas con dependencias
4. → `/speckit.implement` — ejecutar tareas
