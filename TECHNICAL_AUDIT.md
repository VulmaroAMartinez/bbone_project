## 1. Executive Summary

The codebase has a solid high-level module split (NestJS domain modules + React pages/components) and generally good use of DTOs, guards, and typed GraphQL operations. However, there are several production-impacting issues around authorization boundaries, GraphQL query hardening, and backend/frontend contract safety. The backend currently relies heavily on resolver/service conventions rather than explicit policy enforcement, which leaves room for insecure data access paths and inconsistent role behavior. Frontend architecture is functional but has logic duplicated in page-level components and inconsistent cache/error handling patterns.

Major risks center on: (1) missing authorization constraints in some GraphQL queries/mutations, (2) dynamic SQL order-by construction that allows unsafe field injection, (3) weak auth/session hardening (token storage and password policy), and (4) potential N+1 query behavior from multiple resolve fields without DataLoader batching.

Security posture is **moderate risk** for production: no single catastrophic RCE issue was observed in inspected files, but there are multiple high-risk design and implementation gaps that could lead to data exposure, privilege misuse, and service degradation.

---

## 2. Critical Issues (Must Fix Immediately)

### 2.1 GraphQL authorization gap on work order listing/filtering
- **Description:** `workOrdersFiltered`, `workOrder`, `workOrderByFolio`, and `createWorkOrder` are accessible to any authenticated user because they do not enforce role-specific restrictions at resolver level.
- **File(s):** `bbonemx-back/src/modules/work-orders/presentation/resolvers/work-orders.resolver.ts`
- **Why it is a problem:** Requesters/technicians can query broad work-order datasets unless downstream service logic filters strictly by ownership (not visible at resolver boundary), increasing risk of horizontal data exposure.
- **Risk level:** **High**
- **Exact improvement required:** Add explicit `@UseGuards(RolesGuard)` + `@Roles(...)` and apply user-scoped filtering in service layer for requester/technician roles. Enforce object-level authorization for `findById`/`findByFolio`.

### 2.2 Unsafe dynamic `orderBy` in repository query builder
- **Description:** Sorting uses `qb.orderBy(`wo.${sortField}`, sortOrder)` where `sortField` is user-supplied and not validated.
- **File(s):** `bbonemx-back/src/modules/work-orders/infrastructure/repositories/work-orders.repository.ts`, `bbonemx-back/src/modules/work-orders/application/dto/work-order-filters.dto.ts`
- **Why it is a problem:** Unvalidated dynamic column names can open SQL injection-like vectors and runtime query errors.
- **Risk level:** **High**
- **Exact improvement required:** Replace free-form sort fields with a strict whitelist enum (`createdAt`, `priority`, `status`, etc.) and map to hardcoded DB columns before `orderBy`.

### 2.3 REST upload endpoint may break due to GraphQL-specific global guard request extraction
- **Description:** Global `JwtAuthGuard` uses `GqlExecutionContext` request extraction unconditionally (`getRequest`), while uploads are implemented as REST controller routes.
- **File(s):** `bbonemx-back/src/common/guards/jwt-auth.guard.ts`, `bbonemx-back/src/app.module.ts`, `bbonemx-back/src/modules/uploads/uploads.controller.ts`
- **Why it is a problem:** Guard context mismatch can cause auth failures/500s for HTTP endpoints (e.g., `POST /api/uploads`) because guard is globally registered.
- **Risk level:** **High**
- **Exact improvement required:** Make `getRequest` context-aware (GraphQL + HTTP branches) or apply separate guards per transport.

### 2.4 GraphQL schema/runtime type mismatch in `deleteWorkOrder`
- **Description:** Resolver declares `@Mutation(() => WorkOrderType)` but calls `deactivate` which returns `Promise<boolean>`.
- **File(s):** `bbonemx-back/src/modules/work-orders/presentation/resolvers/work-orders.resolver.ts`, `bbonemx-back/src/modules/work-orders/application/services/work-orders.service.ts`
- **Why it is a problem:** Contract violation can break clients and cause runtime GraphQL execution/type errors.
- **Risk level:** **High**
- **Exact improvement required:** Either return the deactivated entity or change mutation return type to `Boolean` and update frontend operations accordingly.

### 2.5 Incorrect `@ResolveField` decorator signature
- **Description:** `@ResolveField(() => [WorkOrderPhotoType, {name: 'photos'}])` passes options incorrectly inside type array.
- **File(s):** `bbonemx-back/src/modules/work-orders/presentation/resolvers/work-orders.resolver.ts`
- **Why it is a problem:** Can generate wrong GraphQL metadata/schema and unexpected runtime behavior.
- **Risk level:** **High**
- **Exact improvement required:** Use `@ResolveField(() => [WorkOrderPhotoType], { name: 'photos' })`.

---

## 3. Backend Findings

### 3.1 JWT secret fallback is insecure
- **Location:** `bbonemx-back/src/config/jwt.config.ts`
- **Description:** Uses default fallback secret `'default-secret-change-in-production'`.
- **Technical impact:** If env var missing, token forgery risk is significant.
- **Recommended improvement:** Fail fast on startup when `JWT_SECRET` is absent in non-dev environments.

### 3.2 Password policy too weak at login contract level
- **Location:** `bbonemx-back/src/modules/auth/application/dto/login.input.ts`
- **Description:** Minimum password length is 4.
- **Technical impact:** Low-entropy credentials increase brute-force success.
- **Recommended improvement:** Raise minimum length (8–12), enforce complexity on password set/change flow, add lockout/rate limiting.

### 3.3 GraphQL hardening not implemented despite placeholder comments
- **Location:** `bbonemx-back/src/infrastructure/graphql/graphql.module.ts`
- **Description:** `validationRules` empty; no depth/complexity limiting.
- **Technical impact:** Expensive nested queries can degrade service.
- **Recommended improvement:** Add `graphql-query-complexity` / depth-limit validation and operation cost thresholds.

### 3.4 N+1 risk in resolve fields for work order graph
- **Location:** `bbonemx-back/src/modules/work-orders/presentation/resolvers/work-orders.resolver.ts`
- **Description:** Multiple resolve fields (`photos`, `technicians`, `signatures`, `materials`, etc.) fetch per-parent entity with individual service calls.
- **Technical impact:** Query amplification and latency spikes for list endpoints.
- **Recommended improvement:** Introduce DataLoader batching or prefetch strategies.

### 3.5 Mixed soft-delete semantics may cause data inconsistencies
- **Location:** `bbonemx-back/src/modules/work-orders/infrastructure/repositories/work-orders.repository.ts`
- **Description:** Some queries use `withDeleted: true` while also filtering `isActive`; custom soft-delete logic duplicates TypeORM soft-delete concepts.
- **Technical impact:** Harder reasoning about lifecycle state and risk of accidental inclusion/exclusion.
- **Recommended improvement:** Standardize on one soft-delete strategy and repository conventions.

---

## 4. Frontend Findings

### 4.1 Access token stored in `localStorage`
- **Location:** `bbonemx-front/src/contexts/auth-context.tsx`, `bbonemx-front/src/lib/graphql/client.ts`
- **Description:** Token persisted in localStorage and attached client-side.
- **UX/technical impact:** Vulnerable to token theft via XSS; session compromise risk.
- **Recommended fix:** Move to secure HttpOnly cookies with CSRF protection, or at minimum implement hardened CSP and short-lived tokens + refresh rotation.

### 4.2 Apollo defaults favor stale/mixed error handling
- **Location:** `bbonemx-front/src/lib/graphql/client.ts`
- **Description:** `errorPolicy: 'all'` globally can mask operational errors as partial success; `watchQuery` uses `cache-and-network` broadly.
- **UX/technical impact:** Inconsistent UI state and harder failure diagnosis.
- **Recommended fix:** Use operation-specific policies; default to stricter error behavior for mutations and critical reads.

### 4.3 Route-level role checks can diverge from backend auth policy
- **Location:** `bbonemx-front/src/components/protected-route.tsx`, `bbonemx-front/src/App.tsx`
- **Description:** Client role gating is extensive but backend does not mirror all constraints consistently.
- **UX/technical impact:** Users can access route shells yet fail API calls unpredictably (or vice versa).
- **Recommended fix:** Align frontend role map with backend authorization matrix and centralize policy constants shared across teams.

### 4.4 Large page components reduce maintainability
- **Location:** Example `bbonemx-front/src/pages/admin/orders/OrdenesPage.tsx`
- **Description:** Complex UI rendering, filter logic, and GraphQL wiring co-exist in one page.
- **UX/technical impact:** Harder testing, higher regressions, unnecessary re-renders.
- **Recommended fix:** Split into container + presentational components, memoize expensive derived lists, extract reusable hooks.

---

## 5. Backend ↔ Frontend Contract Issues

1. **`deleteWorkOrder` return contract mismatch**
   - Backend mutation currently advertises `WorkOrderType` but service returns boolean; frontend generated types may become invalid after schema generation.
   - **Change required:** Normalize schema to actual return and regenerate frontend GraphQL types.

2. **Role-based visibility assumptions are inconsistent**
   - Frontend routes imply strict role partitions, while backend exposes some work-order queries without role decorators.
   - **Change required:** enforce backend object-level + role-level policy and document expected role behavior in GraphQL schema descriptions.

3. **Password policy inconsistency**
   - Frontend login validation enforces min 6, backend accepts min 4.
   - **Change required:** define policy centrally and keep both validators synchronized.

---

## 6. Security Findings

### Critical
- None confirmed in inspected files.

### High
1. **Authorization gaps in work-order resolver operations** (horizontal data exposure risk).  
2. **Unsafe dynamic sorting field in SQL query builder** (injection/runtime abuse risk).  
3. **Global guard transport mismatch affecting REST security behavior** (unreliable enforcement).

### Medium
1. **JWT secret insecure fallback default** (misconfiguration leads to token compromise).  
2. **Token storage in localStorage** (XSS session theft vector).  
3. **Missing GraphQL query depth/complexity/rate protections** (DoS risk).

### Low
1. **Verbose GraphQL/client error logging in production paths** (`console.log`/`console.error` patterns) may expose internals.

---

## 7. UI / UX Issues

1. **Role-based navigation can feel inconsistent** when frontend allows route access but backend query permissions differ.  
   - Improve by preloading capability matrix and rendering explicit “no permission” states.

2. **Potential weak error-state standardization** across large pages.  
   - Adopt shared async state components (`loading`, `empty`, `error`) and enforce pattern in page templates.

3. **Large administrative pages increase interaction latency perception** due to heavy synchronous filtering/rendering.  
   - Virtualize long lists and move filtering to server where practical.

---

## 8. Performance Risks

1. **N+1 in GraphQL resolve fields** for work-order related entities.  
   - Use DataLoader and batched repository methods.

2. **Potential over-fetching from broad relations in repository methods** (`findAll`, `findWithFilters`).  
   - Return lightweight projections for list endpoints.

3. **Frontend list pages likely to rerender full card lists on every filter keystroke** (e.g., orders page).  
   - Debounce search, memoize filtered collections, paginate aggressively.

4. **GraphQL server lacks query complexity guardrails.**  
   - Add depth/cost limits + timeout metrics.

---

## 9. Code Quality Improvements

1. Introduce centralized authorization policy service (resource + action + ownership).
2. Replace ad-hoc query DTO string fields with strict enums/unions and mapping tables.
3. Consolidate repeated role/route logic into shared frontend config with typed guards.
4. Refactor large page components into feature folders: `hooks/`, `components/`, `queries/`, `view-models/`.
5. Add architectural tests/lint rules for resolver guard coverage and forbidden raw dynamic query construction.

---

## 10. Recommended Refactoring Plan

1. **Critical fixes (Week 1)**
   - Patch resolver guard coverage + object-level auth for work orders.
   - Fix `deleteWorkOrder` GraphQL return type mismatch.
   - Correct `@ResolveField` decorator signature.
   - Whitelist sort fields in repository.

2. **Security fixes (Week 1–2)**
   - Remove JWT secret fallback in production.
   - Add rate limiting and account lockout controls around login.
   - Add GraphQL depth/complexity limits.
   - Plan migration from localStorage tokens to HttpOnly cookie strategy.

3. **Architectural improvements (Week 2–4)**
   - Introduce DataLoader for work-order nested relations.
   - Standardize soft-delete semantics.
   - Define backend/frontend shared auth capability matrix.

4. **Code quality improvements (Week 3–5)**
   - Break down large frontend pages and extract hooks.
   - Tighten DTO validation with enums and typed sort fields.
   - Add integration tests for authorization-critical resolvers.

5. **UI/UX improvements (Week 4–6)**
   - Standard loading/error/empty states across pages.
   - Improve unauthorized messaging and guided redirects.
   - Optimize list rendering with pagination/virtualization where needed.
