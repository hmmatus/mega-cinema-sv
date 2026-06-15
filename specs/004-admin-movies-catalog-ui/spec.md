---
feature: Admin Movies Catalog UI
branch: feat/admin-movies-catalog-ui
status: draft
created: 2026-06-14
---

# Admin Movies Catalog UI

## Resumen

Interfaz admin para gestionar el catálogo de películas de MegaCinemaSv. Permite listar, buscar, crear, editar y eliminar películas. Los datos se sincronizan con la API REST (`/api/movies`). Admin y Employee pueden ver películas (GET pública), pero solo Admin puede crear, editar y eliminar (POST/PUT/DELETE requieren `admin` role).

---

## Escenarios de Usuario

### [EU-001] [P1] Admin lista todas las películas
- **Given:** Admin inicia sesión y navega a la sección de películas
- **When:** Carga la página de catálogo
- **Then:** Se muestra lista paginada de todas las películas (título, poster, status, visibility, fecha de creación)
- **And:** Cada película es seleccionable para ver detalles completos

### [EU-002] [P1] Admin busca películas por título
- **Given:** Admin está en la página de catálogo
- **When:** Ingresa texto en el campo de búsqueda
- **Then:** Lista se filtra en tiempo real por coincidencia en título
- **And:** Búsqueda es case-insensitive

### [EU-003] [P1] Admin filtra películas por status
- **Given:** Admin está en la página de catálogo
- **When:** Selecciona filtro de status (UPCOMING / PRERELEASE / RELEASED / ARCHIVED)
- **Then:** Lista muestra solo películas con ese status
- **And:** Puede aplicar múltiples filtros simultáneamente

### [EU-004] [P1] Admin filtra películas por visibility
- **Given:** Admin está en la página de catálogo
- **When:** Selecciona filtro de visibility (PUBLIC / INTERNAL / HIDDEN)
- **Then:** Lista muestra solo películas con esa visibility
- **And:** Puede combinar con otros filtros

### [EU-005] [P1] Admin crea nueva película
- **Given:** Admin hace click en botón "Crear película"
- **When:** Completa formulario con: título, descripción, duración (minutos), rating, idioma original, status, fecha de lanzamiento, poster URL, trailer URL, director, géneros, cast, featured flag, visibility
- **Then:** Se envía POST a `/api/movies` y película se crea en DB
- **And:** Admin ve confirmación de éxito y película aparece en lista
- **And:** Sistema registra `createdById` con ID del usuario logueado

### [EU-006] [P1] Admin edita película existente
- **Given:** Admin abre detalles de una película
- **When:** Hace click en "Editar" y modifica campos
- **Then:** Se envía PUT a `/api/movies/:id` con cambios
- **And:** Sistema registra `updatedById` con ID del usuario logueado
- **And:** Lista se actualiza reflejando cambios

### [EU-007] [P1] Admin elimina película
- **Given:** Admin abre detalles de una película sin showtimes asociados
- **When:** Hace click en botón "Eliminar" y confirma en modal
- **Then:** Se envía DELETE a `/api/movies/:id`
- **And:** Película se elimina de forma permanente
- **And:** Si película tiene showtimes asociados, DELETE retorna error 409 "No se puede eliminar película con sesiones programadas"

### [EU-007b] [P1] Admin archiva película con showtimes
- **Given:** Admin abre detalles de una película con showtimes futuros
- **When:** Cambia status a ARCHIVED
- **Then:** Película se marca como archivada (soft delete)
- **And:** Película desaparece de vista de clientes (GET `/api/movies` filtra ARCHIVED)
- **And:** Showtimes existentes no aceptan nuevas reservas
- **And:** Reservas pagadas existentes siguen siendo válidas

### [EU-008] [P1] Admin marca película como featured
- **Given:** Admin edita una película
- **When:** Marca checkbox "Featured"
- **Then:** Campo `featured = true` se guarda en DB
- **And:** Película aparece con badge visual en lista

### [EU-009] [P2] Admin filtra por rango de fechas de lanzamiento
- **Given:** Admin está en catálogo
- **When:** Selecciona rango de fechas (desde - hasta)
- **Then:** Lista muestra solo películas con `releaseDate` en ese rango

### [EU-010] [P2] Admin ordena lista por columna
- **Given:** Admin está viendo lista de películas
- **When:** Hace click en encabezado de columna (título, fecha creación, status)
- **Then:** Lista se ordena ascendente/descendente por esa columna

### [EU-011] [P3] Admin exporta lista de películas
- **Given:** Admin está en catálogo
- **When:** Hace click en "Exportar a CSV"
- **Then:** Descarga archivo CSV con todas las películas visibles (según filtros aplicados)

---

## Requisitos Funcionales

| ID | Prioridad | Requisito |
|----|-----------|-----------|
| FR-001 | MUST | GET `/api/movies` — endpoint público, retorna lista paginada, filtra por defecto: `status != ARCHIVED` y `visibility = PUBLIC` (admin puede ver todas) |
| FR-002 | MUST | POST `/api/movies` — crear película, requiere `admin` o `employee` role, registra `createdById` |
| FR-003 | MUST | PUT `/api/movies/:id` — editar película, requiere `admin` o `employee` role, registra `updatedById` |
| FR-004 | MUST | DELETE `/api/movies/:id` — eliminar película (solo sin showtimes), requiere `admin` o `employee` role, retorna 409 si existen showtimes |
| FR-004b | MUST | PUT `/api/movies/:id` con `status = ARCHIVED` — soft delete, película desaparece de vista pública |
| FR-005 | MUST | Listar películas con paginación (limit, offset o cursor) |
| FR-006 | MUST | Buscar por título (partial match, case-insensitive) |
| FR-007 | MUST | Filtrar por status (UPCOMING, PRERELEASE, RELEASED, ARCHIVED) |
| FR-008 | MUST | Filtrar por visibility (PUBLIC, INTERNAL, HIDDEN) |
| FR-009 | SHOULD | Filtrar por rango de fechas de lanzamiento |
| FR-010 | SHOULD | Ordenar por columna (título, fecha creación, status) |
| FR-011 | COULD | Exportar a CSV |
| FR-012 | MUST | Validar campos obligatorios en formulario de creación: título, duración, status, visibility |
| FR-013 | MUST | Validar que duración sea número positivo |
| FR-014 | MUST | Validar que URLs (poster, trailer) sean URLs válidas si se proporcionan |
| FR-015 | MUST | Mostrar indicador visual si película tiene showtimes asociados |
| FR-016 | MUST | Registrar auditoría de cambios (creación, edición, eliminación) en tabla `audit_logs` |

---

## Entidades Clave

| Entidad | Atributos relevantes | Notas |
|---------|---------------------|-------|
| Movie | id, title, description, durationMinutes, rating, originalLanguage, status, releaseDate, posterUrl, trailerUrl, director, genres, cast, featured, visibility, createdById, updatedById, createdAt, updatedAt | Status enum: UPCOMING, PRERELEASE, RELEASED, ARCHIVED. Visibility: PUBLIC, INTERNAL, HIDDEN. Rating: G, PG, PG13, R, NC17. Relación 1:N con Showtime. |
| Showtime | id, movieId, roomId, startAt, endAt, status, basePrice | Permite validar si película tiene sesiones asociadas |
| User | id, roleId, firstName, lastName, email | createdById / updatedById apuntan aquí |
| AuditLog | userId, roleId, entityName, entityId, action, previousValue, newValue, eventAt | Registra cambios a películas |

---

## Criterios de Éxito

| ID | Criterio | Cómo medir |
|----|----------|------------|
| SC-001 | Listar películas sin lag | Página carga en < 2s con 100+ películas |
| SC-002 | Búsqueda funciona en tiempo real | Filtrado responde dentro de 300ms |
| SC-003 | Crear película con todos los campos | POST exitoso, película aparece en lista |
| SC-004 | Editar película existente | Cambios reflejados inmediatamente en UI |
| SC-005 | Eliminar película | DELETE exitoso, película desaparece de lista |
| SC-006 | Auditoría registra operaciones | Cada CREATE/UPDATE/DELETE genera entrada en audit_logs |
| SC-007 | Roles se aplican correctamente | GET sin restricción, POST/PUT/DELETE requieren role admin/employee |
| SC-008 | Validación de formulario | Errores mostrados claramente, submit deshabilitado si hay errores |

---

## Casos Borde

- [ ] Película sin poster URL — mostrar placeholder genérico
- [ ] Película sin descripción — mostrar campo vacío, no obligatorio
- [ ] Película con 100+ géneros — ui no se rompe, lista scrolleable
- [ ] Película con showtimes futuros — prevenir DELETE, cambiar status a ARCHIVED en su lugar
- [ ] Usuario intenta editar sin permisos — mostrar error 403
- [ ] Búsqueda retorna 0 resultados — mostrar mensaje "No se encontraron películas"
- [ ] Timeout en fetch de películas — reintentar automáticamente o mostrar error
- [ ] Usuario cierra formulario sin guardar — preguntar confirmación si hay cambios
- [ ] Crear película con título duplicado — permitido (múltiples películas pueden compartir título)

---

## Suposiciones

- GET `/api/movies` no requiere autenticación (GET pública)
- POST/PUT/DELETE requieren JWT válido con `admin` o `employee` role
- Paginación con limit/offset (10 películas por página por defecto)
- Frontend usa TanStack Query + Zod para validación
- Componentes UI vienen de `@cinema/ui`
- Tipos compartidos vienen de `@cinema/shared`
- Estilos con Tailwind v4

---

## Dependencias

- [ ] API `/api/movies` (endpoints: GET, POST, PUT, DELETE) — **Spec 003** en progreso
- [ ] Componentes base (`Button`, `Input`, `Modal`, `Table`) en `@cinema/ui`
- [ ] Tipos `Movie`, `MovieStatus`, `MovieVisibility` en `@cinema/shared` o generados de Prisma
- [ ] Supabase Auth + JWT guardado en localStorage
- [ ] TanStack Query v5+ configurado en `apps/admin`

---

## Fuera de Alcance (MVP)

- Bulk edit (seleccionar múltiples películas y editar campos en lote)
- Sincronización automática con TMDB (manual seed vía script está OK)
- Recomendaciones de películas basadas en histórico
- Caché local de películas vistas
- Integración con CDN para imágenes (almacenamiento en Supabase Storage como es hoy)
