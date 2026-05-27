---
name: mvvm-component
description: Crea componentes React siguiendo el patrón MVVM. Usar cuando el usuario pida crear un componente, refactorizar uno existente, o cuando un componente mezcle lógica con UI. Genera: types.ts, consts.ts (opcional), styles.ts (opcional), utils.ts (opcional), ComponentName.viewmodel.ts (hook con toda la lógica), ComponentName.tsx (render puro), index.ts.
version: 1.0.0
source: local-repo-analysis
---

# MVVM Component

Patrón de separación de responsabilidades para componentes React/Next.js.

## Cuándo aplicar

- El usuario pide "crear un componente", "nuevo componente", "añade un [Nombre]"
- Un componente existente mezcla fetch/estado/lógica con JSX
- Se quiere refactorizar para escalabilidad

---

## Estructura de archivos

Cada componente vive en su propia carpeta PascalCase:

```
ComponentName/
  types.ts                    — interfaces y tipos TypeScript
  consts.ts                   — valores estáticos, mensajes de error   [omitir si vacío]
  styles.ts                   — clases CSS/Tailwind agrupadas por elemento [omitir si pocas]
  utils.ts                    — funciones puras sin side effects        [omitir si vacío]
  ComponentName.viewmodel.ts  — hook con toda la lógica
  ComponentName.tsx           — UI pura, solo render
  index.ts                    — re-exports públicos
```

**Regla:** si un archivo tendría menos de 2 exports reales, omitirlo.

---

## Dónde colocar el componente

### Feature-level
Si el componente **solo se usa dentro de una feature** específica:
```
src/features/movies/components/MovieCard/
src/features/auth/components/LoginForm/
```

### Shared (componentes básicos reutilizables)
Si el componente **puede usarse en múltiples features** (inputs, botones, modales, etc.):
```
src/shared/components/Button/
src/shared/components/Modal/
src/shared/components/Input/
```

> Regla práctica: si al crear el componente ya ves que otro feature lo necesitará → `shared`. Si hay duda, empieza en feature y mueve luego.

---

## Responsabilidades por archivo

### `types.ts`
Solo `interface` y `type`. Sin imports de React. Sin lógica.

```ts
export interface MovieCardProps {
  movieId: string
  onSelect: (id: string) => void
}

export interface Movie {
  id: string
  title: string
  posterUrl: string
  rating: number
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success'
```

---

### `consts.ts`
Valores readonly, strings mágicos, mensajes de error. Sin lógica.

```ts
export const ERROR_MESSAGES = {
  fetchFailed: 'No se pudo cargar la película',
  notFound: 'Película no encontrada',
} as const

export const CARD_CONFIG = {
  maxTitleLength: 50,
  defaultRating: 0,
} as const
```

---

### `styles.ts`
Clases Tailwind/CSS agrupadas por elemento del componente. Sin lógica condicional compleja.

```ts
export const styles = {
  container: 'rounded-lg border border-border bg-surface shadow-sm hover:shadow-md transition-shadow',
  poster: 'w-full aspect-[2/3] object-cover rounded-t-lg',
  body: 'p-4 flex flex-col gap-2',
  title: 'text-sm font-semibold line-clamp-2',
  rating: 'text-xs text-muted',
} as const
```

---

### `utils.ts`
Funciones puras: entrada → salida, sin hooks, sin side effects.

```ts
import type { Movie } from './types'

export function formatRating(rating: number): string {
  return `${rating.toFixed(1)} / 10`
}

export function truncateTitle(title: string, max: number): string {
  return title.length > max ? `${title.slice(0, max)}…` : title
}
```

---

### `ComponentName.viewmodel.ts`
**El cerebro.** Un único custom hook `use<ComponentName>`.

Reglas:
- Todo `useState`, `useEffect`, `useCallback`, `useMemo` va aquí
- Todas las llamadas a API (fetch, SWR, server actions) van aquí
- Toda la lógica de formularios y validación va aquí
- **Nunca importa JSX ni elementos del DOM**
- Recibe los props crudos del componente padre
- Retorna un objeto plano con todo lo que la vista necesita

```ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import type { MovieCardProps, Movie, LoadingState } from './types'
import { ERROR_MESSAGES, CARD_CONFIG } from './consts'
import { formatRating, truncateTitle } from './utils'

export function useMovieCard({ movieId, onSelect }: MovieCardProps) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [status, setStatus] = useState<LoadingState>('idle')

  useEffect(() => {
    setStatus('loading')
    fetch(`/api/movies/${movieId}`)
      .then((r) => r.json())
      .then((data) => { setMovie(data); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [movieId])

  const handleSelect = useCallback(() => {
    if (movie) onSelect(movie.id)
  }, [movie, onSelect])

  return {
    movie,
    isLoading: status === 'loading',
    isError: status === 'error',
    errorMessage: ERROR_MESSAGES.fetchFailed,
    displayRating: movie ? formatRating(movie.rating) : formatRating(CARD_CONFIG.defaultRating),
    displayTitle: movie ? truncateTitle(movie.title, CARD_CONFIG.maxTitleLength) : '',
    handleSelect,
  }
}
```

---

### `ComponentName.tsx`
**Solo render.** Sin `useState`, `useEffect`, ni fetch.

```tsx
'use client'
import { useMovieCard } from './MovieCard.viewmodel'
import { styles } from './styles'
import type { MovieCardProps } from './types'

export function MovieCard(props: MovieCardProps) {
  const { movie, isLoading, isError, errorMessage, displayRating, displayTitle, handleSelect } =
    useMovieCard(props)

  if (isLoading) return <div className={styles.container}>Cargando...</div>
  if (isError)   return <div className={styles.container}>{errorMessage}</div>
  if (!movie)    return null

  return (
    <button onClick={handleSelect} className={styles.container}>
      <img src={movie.posterUrl} alt={displayTitle} className={styles.poster} />
      <div className={styles.body}>
        <p className={styles.title}>{displayTitle}</p>
        <p className={styles.rating}>{displayRating}</p>
      </div>
    </button>
  )
}
```

---

### `index.ts`
Solo API pública. El viewmodel hook NO se re-exporta.

```ts
export { MovieCard } from './MovieCard'
export type { MovieCardProps } from './types'
```

---

## Sub-componentes

Si el `.tsx` principal crece o tiene partes claramente delimitadas, extraerlas como sub-componentes **dentro de la misma carpeta**, siguiendo el mismo patrón MVVM:

```
MovieCard/
  types.ts
  consts.ts
  styles.ts
  MovieCard.viewmodel.ts
  MovieCard.tsx
  index.ts
  MovieRating/                  ← sub-componente interno
    types.ts
    styles.ts
    MovieRating.viewmodel.ts
    MovieRating.tsx
    index.ts
```

- Sub-componente NO se exporta desde el `index.ts` del padre (es detalle interno).
- Si el sub-componente se vuelve útil en otro lugar → promoverlo a `shared/`.

---

## Cuándo dividir el viewModel

Si `ComponentName.viewmodel.ts` supera ~100 líneas o tiene responsabilidades claramente distintas:

### Opción A — Extraer hook especializado
```
MovieCard/
  hooks/
    useMovieData.ts       ← fetch y estado de datos
    useMovieSelection.ts  ← lógica de selección/interacción
  MovieCard.viewmodel.ts  ← orquesta los hooks, retorna vista
```

### Opción B — Crear sub-componente dedicado
Si la complejidad viene de una sección de UI específica, extraer esa sección como sub-componente con su propio viewmodel.

> Regla: si el viewmodel hace dos cosas que no se comunican entre sí → Opción A. Si la complejidad es de render → Opción B.

---

## Reglas del patrón

1. **La vista es tonta.** Si hay lógica en el `.tsx` más allá de llamar al viewmodel y renderizar, moverla.
2. **El viewmodel es TypeScript puro.** Sin JSX, sin refs al DOM.
3. **Types primero.** Definir el contrato (`types.ts`) antes de escribir el hook o la vista.
4. **Un viewmodel por vista.** La lógica compartida va en `utils.ts` del componente o en `lib/`.
5. **Los props fluyen en una dirección.** La vista pasa sus props directo al hook.
6. **No barrel files internos.** `index.ts` es solo para la API pública del componente.
7. **`styles.ts` centraliza Tailwind.** Evita strings de clases inline largos en el `.tsx`.

---

## Checklist de ejecución (en orden)

- [ ] Decidir ubicación: ¿feature-level o shared?
- [ ] Crear `types.ts` con la interface de props y los tipos de dominio
- [ ] Crear `consts.ts` si hay 2+ valores estáticos o mensajes de error
- [ ] Crear `styles.ts` si hay 3+ elementos con clases Tailwind
- [ ] Crear `utils.ts` si hay 2+ funciones puras helper
- [ ] Escribir `ComponentName.viewmodel.ts` — hook `use<ComponentName>` con toda la lógica
- [ ] Si viewmodel > 100 líneas → extraer hooks en `hooks/` o crear sub-componente
- [ ] Escribir `ComponentName.tsx` — render puro que llama al viewmodel, usa `styles`
- [ ] Identificar sub-secciones complejas → crear sub-componentes con su propio MVVM
- [ ] Escribir `index.ts` — re-exports públicos únicamente
- [ ] Verificar: `grep` el `.tsx` por `useState|useEffect|fetch` — si aparece, mover al viewmodel
