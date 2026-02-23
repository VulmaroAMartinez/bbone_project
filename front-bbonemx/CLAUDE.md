# CLAUDE.md - Project Rules

> These rules guide Claude Code when working in this repository.

```
├── assets
│   ├── logo1.png
│   ├── logo2.png
│   └── logo_color.svg
├── components
│   ├── layout
│   │   ├── app-shell.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── sidebar.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button-group.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── full-page-loader.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── signature-dialog.tsx
│   │   ├── skeleton-loaders.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── status-badge.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── protected-route.tsx
│   └── providers.tsx
├── contexts
│   ├── auth-context.tsx
│   └── notification-context.tsx
├── lib
│   ├── graphql
│   │   ├── generated
│   │   │   ├── fragment-masking.ts
│   │   │   ├── gql.ts
│   │   │   ├── graphql.ts
│   │   │   └── index.ts
│   │   ├── operations
│   │   │   ├── areas.ts
│   │   │   ├── auth.ts
│   │   │   ├── catalogs.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── fragments.ts
│   │   │   ├── notifications.ts
│   │   │   └── work-orders.ts
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── types.ts
│   └── utils.ts
├── pages
│   ├── admin
│   │   ├── AdminOrdenDetallePage.tsx
│   │   ├── CrearOTPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HorariosPage.tsx
│   │   ├── OrdenesPage.tsx
│   │   └── TecnicosPage.tsx
│   ├── shared
│   │   └── PerfilPage.tsx
│   ├── solicitante
│   │   ├── CrearOTPage.tsx
│   │   ├── MisOrdenesPage.tsx
│   │   └── OrdenDetallePage.tsx
│   ├── tecnico
│   │   ├── AsignacionesPage.tsx
│   │   ├── HorarioPage.tsx
│   │   ├── OrdenTecnicoPage.tsx
│   │   └── PendientesPage.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── index.ts
├── App.tsx
├── globals.css
├── main.tsx
└── vite-env.d.ts
```


## TypeScript + React Agent Rules

## Project Context
You are an expert TypeScript developer working with React. This project is a Web App.

**Project:** bbonemx-front using React with Zod, React Hook Form, ESLint, Tailwind CSS

## Code Style & Structure
- Write clean, readable TypeScript code using modern best practices.
- Use `camelCase` naming convention for variables and functions.
- Use TypeScript strict mode with `strict: true` in `tsconfig.json` — enables `strictNullChecks`, `noImplicitAny`, and other safety checks.
- Use `const` by default; `let` only when reassignment is needed. Never use `var`.
- Use `interface` for object shapes that may be extended and `type` for unions, intersections, and mapped types.
- Prefer `unknown` over `any` — it forces type narrowing before use and catches bugs at compile time.
- Avoid `any` — use `unknown` with type guards when the type is truly unknown.
- Use discriminated unions for state management over boolean flags.
- Prefer small, focused functions under 30 lines. Extract helpers when logic grows.
- Use `readonly` for arrays and properties that should not be mutated.
- Prefer explicit return types on exported functions for documentation and faster type-checking.
- Use Google-style JSDoc docstrings for every public module, class, function, and method.
- Annotate all functions, methods, class members, and variables with specific TypeScript types.
- Structure docstrings with Args, Returns, and Throws sections for parameters, return values, and exceptions.
- Single-line docstrings suffice for simple private helpers; keep all prose concise and factual.
- Favor the most precise types possible, avoiding generic types like any unless unavoidable.
- Ensure docstrings thoroughly explain purpose, usage, parameters, returns, and raised exceptions.
- Follow SOLID principles. Write functions that do one thing well.
- Use meaningful names that reveal intent — avoid abbreviations and single-letter variables outside loops.
- Extract complex conditionals into well-named boolean functions — `isEligibleForDiscount(user)` over `user.age > 18 && user.orders > 5`.
- Keep functions under 20 lines and files under 300 lines. Extract when complexity grows.
- Avoid deep nesting — use early returns, guard clauses, and extraction to flatten logic.
- Delete dead code immediately — commented-out code is not a backup strategy.
- Don't Repeat Yourself (DRY), but prefer duplication over the wrong abstraction.

## Linting & Formatting
- Use ESLint flat config (`eslint.config.js`). Extend recommended configs for your framework.
- Run `eslint --fix .` for auto-fixable issues. Run `eslint .` in CI without `--fix`.
- Use `typescript-eslint` with `strict` and `stylistic` configs — enable type-checked rules with `parserOptions.project` for deep type analysis.
- Use `@typescript-eslint/recommended` for TypeScript projects. Enable `strict` preset for stricter checks.
- Configure `no-unused-vars`, `no-console`, `prefer-const` as errors — catch real issues, not style nits.

## Styling
- Use `@apply` in component CSS only as a last resort — prefer utility classes in templates.
- Use the `cn()` (clsx + twMerge) utility for conditional class merging — it resolves Tailwind class conflicts correctly.
- Use `tailwind.config.ts` to define design tokens: colors, spacing, fonts, breakpoints.
- Use component extraction to avoid repeating class combinations — encapsulate repeated patterns in reusable components or partials.
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for mobile-first responsive design.
- Use `dark:` variant for dark mode support. Use `group-*` and `peer-*` for conditional styling.

## React Patterns
- Define a `Props` interface for every component and type the function signature: `function Button({ label, onClick }: Props)`.
- Use generic hooks for type safety: `useState<User | null>(null)`, `useRef<HTMLInputElement>(null)`, `useReducer<Reducer<State, Action>>`.
- Type event handlers explicitly: `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`.
- Use `React.FC` sparingly — prefer explicit return types: `function Card({ title }: Props): React.ReactElement`. Use generic components: `function List<T>({ items, renderItem }: ListProps<T>)`.
- Prefer `interface Props` over `React.FC<Props>` — define props as an interface and use a regular function declaration for components.
- Use `React.ComponentPropsWithoutRef<'button'>` to extend native HTML element props when wrapping built-in elements.
- Type children explicitly: use `React.ReactNode` for renderable content, `React.ReactElement` when only JSX elements are accepted.
- Create typed context with a factory: `createContext<ContextType | null>(null)` and a custom hook that throws if used outside the provider.
- Use discriminated unions for component variants: `type Props = { variant: 'link'; href: string } | { variant: 'button'; onClick: () => void }`.

## Architecture
- Separate code into layers: domain (entities, business rules), application (use cases), infrastructure (frameworks, DB, APIs).
- Dependencies point inward: infrastructure depends on application, application depends on domain. Never the reverse.
- Define ports as TypeScript interfaces in the domain layer — adapters implement these interfaces in the infrastructure layer.
- Define interfaces (ports) in the domain/application layer. Implement them in infrastructure (adapters).
- Use cases orchestrate domain logic for specific operations: one use case = one business operation.
- Wire layers together with dependency injection at the application entry point.
- Design mobile-first: write base styles for small screens and use min-width media queries to enhance for larger viewports.
- Use relative units (rem, em, %, vw/vh) instead of fixed pixels for layout dimensions, font sizes, and spacing.
- Set the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">.
- Test on real devices at common breakpoints (320px, 768px, 1024px, 1440px) — browser resize alone misses touch and rendering differences.
- Use CSS Grid or Flexbox for layouts instead of floats or absolute positioning. Grid for two-dimensional layouts, Flexbox for one-dimensional alignment.
- Implement fluid typography with clamp() — e.g., font-size: clamp(1rem, 2.5vw, 2rem) — to scale text smoothly between breakpoints.
- Make images responsive with max-width: 100% and height: auto. Use <picture> with srcset for art direction and resolution switching.
- Design touch-friendly interactions: minimum 44px tap targets, adequate spacing between interactive elements, no hover-only interactions.
- Use container queries (@container) for component-level responsiveness instead of relying solely on viewport-based media queries.
- Hide or reorganize navigation for small screens — use a hamburger menu or bottom navigation pattern. Never horizontally scroll the main layout.
- Separate UI components, business logic, and data fetching into distinct layers.
- Choose rendering strategy intentionally: SSR for SEO, CSR for interactivity, SSG for static content.
- Use server-side rendering (SSR) or static generation (SSG) for initial page loads — hydrate on the client for interactivity.
- Implement client-side routing with proper loading and error states for each route.
- Use a state management approach appropriate to complexity — local state first, global store when needed.

## Security
- Validate and sanitize all user inputs from external sources.
- NEVER hardcode secrets (API keys, passwords) in the codebase. Use environment variables.
- Use parameterized queries for all database access — never concatenate user input into SQL, command strings, or template expressions.
- If you detect a hardcoded secret, stop immediately and prompt the user to remove it.
- Use parameterized queries or ORMs to prevent SQL injection.
- Ensure code handles edge cases and failures gracefully, not just the happy path.
- Set security headers (CSP, HSTS, X-Frame-Options) on all responses.
- Escape all user-generated output to prevent XSS — use framework-provided sanitization, never raw HTML insertion.
- Set HTTP security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- Set cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.

## Error Handling
- Use try/catch blocks for error handling. Catch specific error types, not generic exceptions.
- Never catch errors silently — always log, handle, or rethrow with additional context.
- Log the full error stack trace at the catch site — re-throw with additional context if the error needs to propagate up the call chain.
- Provide meaningful error messages that include what operation failed and why.
- Use typed error hierarchies: ValidationError, NotFoundError, AuthenticationError — not generic Error.
- Log errors with structured data: operation name, input parameters, stack trace, and timestamp.
- Use finally blocks for cleanup that must run regardless of success or failure.

## Libraries & Tools
- Define schemas with `z.object({})` for validation — use `z.infer<typeof schema>` to derive TypeScript types from schemas.
- Validate at system boundaries: API inputs, form data, environment variables, config files — fail fast with descriptive error messages.
- Use `z.enum()` for string literals, `z.discriminatedUnion()` for tagged unions, `z.transform()` for parsing and coercion.
- Use `.parse()` to throw on invalid data, `.safeParse()` to get a Result-like `{ success, data, error }`.
- Compose schemas: use `.extend()`, `.merge()`, `.pick()`, `.omit()` to build variants from base schemas.
- Use `.transform()` for coercion and normalization (trimming strings, parsing dates).
- Use `useForm<FormValues>()` with a schema resolver for type-safe, schema-validated forms.
- Use `register()` for uncontrolled inputs, `Controller` for controlled components (Select, DatePicker).
- Use `useFormContext<FormData>()` in nested components with `FormProvider` — maintains full TypeScript types without prop drilling.
- Use `handleSubmit` wrapper — it validates before calling your submit handler.
- Use `formState.errors` for field-level error display. Show errors next to the relevant input.
- Use `watch()` sparingly — prefer `useWatch()` for isolated re-renders on specific fields.
- Use `defaultValues` to initialize forms. Use `reset()` to clear forms after successful submission.


---

## Working Conventions
- When modifying files, preserve existing code style and formatting or improve it if needed.
- Run tests after making changes to verify nothing is broken.
- Prefer small, focused changes over large refactors.
- Ask for clarification rather than making assumptions about requirements.
