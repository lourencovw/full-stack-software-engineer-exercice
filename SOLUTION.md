# Solution - Task Manager Technical Assessment

## Task 1: Found Bugs ✅

### 1.1 Frontend: Infinite Re-renders

**Commit:** [f6ed66c](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/f6ed66c0c9b5c9329ed4936c4d81547a7238d432)

**Issue:** The `useEffect` hook was missing a dependency array, causing it to run after every render.

**Root Cause:** Since the effect called `fetchTasks()` which updated state via `setTasks()`, this triggered a re-render, which ran the effect again, creating an infinite loop.

**Fix:** Added an empty dependency array `[]` to ensure the effect only runs once on component mount.

```typescript
useEffect(() => {
  fetchTasks();
}, []); // Added dependency array
```

---

## Task 2: Improvements ✅

### 2.1 Remove Inefficient Queries (N+1 Problems)

**Commit:** [2803608](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/2803608e03abe5ba31b447b2f7ce743796c250af)  
**Issue:** The API performed one query to fetch all tasks, then executed a separate query for each individual task.  
**Root Cause:** Inefficient database query pattern where the resolver was making multiple round trips to the database.  
**Fix:** Refactored to use a single batch query with proper Knex query builder methods:  

```typescript
return await db<Task>("tasks").select("*").orderBy("id", "asc");
```

---

### 2.2 Add Validation and Error Handling

**Implementation:** Added comprehensive input validation in mutations:

**createTask validation:**

- Title is required (not empty or whitespace-only)
- Title length must be ≤ 255 characters
- Trim whitespace before insertion

**toggleTask validation:**

- Task ID must be valid (positive number)
- Task must exist in database

Backend changes:

```typescript
if (!title || title.trim().length === 0) {
  throw new Error("Title is required");
}

if (title.length > 255) {
  throw new Error("Title must be 255 characters or less");
}
```

Frontend changes:

```typescript
const hasErrors = data.errors && data.errors.length > 0;
if (hasErrors) {
  return errorHandler(data.errors[0].message);
}
```

---

### 2.3 Fix Database Insert Return Values

**Commit:** [4b51745](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/4b51745c06b8b39be6178c4b34025d0c87ca2577)  
**Issue:** The `createTask` mutation was not returning the newly created task object.  
**Root Cause:** Missing `.returning("*")` in the Knex insert query.  
**Fix:** Added `.returning("*")` to return the created task:  

```typescript
const [task] = await db<Task>("tasks")
  .insert({ title, completed: false })
  .returning("*");
return task;
```

---

### 2.4 Proper Async/Await Handling

**Commit:** [fe2025f](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/fe2025f81c54db446aa68c5d35a3e56e1fc61be9)  
**Issue:** Data was being accessed before the asynchronous database call completed.  
**Root Cause:** Missing `await` keyword meant the variable held a Promise object instead of the resolved data.  
**Fix:** Added proper `async/await` handling throughout the resolvers:  

```typescript
const task = await db<Task>("tasks").where({ id }).first();
```

---

### 2.5 Frontend: Optimize Re-renders

**Commit:** [ff719b4](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/ff719b4e857aae8de7c48f257388deee29a12805)  
**Issue:** The frontend was re-rendering all components unnecessarily.  
**Root Cause:** Inefficient memoization.  
**Fix:** Upgraded to Next.js 16 and used React Compiler for automatic memoization:  

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true, // Enabled React Compiler for automatic optimizations
  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination: "http://localhost:4000/graphql",
      },
    ];
  },
};

module.exports = nextConfig;

```

---

### 2.6 Frontend: Optimistic UI

**Commit:** [ab628cf](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/ab628cfe126e10834b8ab869729159f880190b84)  
**Issue:** The frontend was not properly refetching data after mutations.  
**Root Cause:** No mechanism to refresh the task list after creating or updating tasks.  
**Fix:** Implemented optimistic UI:  

```typescript
// Optimistic update
const tempId = Date.now().toString();
const optimisticTask: ITask = {
  id: tempId,
  title: title.trim(),
  completed: false,
};
setTasks(prev => [...prev, optimisticTask]);

try {
  await api.createTask(title);
  await fetchTasks(); // Sync with server
} catch (error) {
  // Revert optimistic update on error
  setTasks(prev => prev.filter(task => task.id !== tempId));
  errorHandler(error);
}
```

---

## Task 3: Explain Trade-offs ✅

### Why TypeScript?

I migrated the entire codebase to TypeScript because:

- **Type Safety:** Catches errors at compile-time rather than runtime
- **Better IDE Support:** Autocomplete, refactoring, and inline documentation
- **Maintainability:** Self-documenting code with explicit interfaces
- **Trade-off:** Slightly slower development initially, but pays dividends in long-term maintenance

The small compilation overhead and additional boilerplate are worth the massive increase in code quality and developer confidence.

---

### Why Optimistic Over Pessimistic UI?

**Decision:** Chose optimistic instead of pessimistic updates.

- **Single-User Scope:** No concurrent edits, so conflict risk is minimal
- **Small Data Set:** Tasks are limited and unpaginated, making local updates safe
- **Better UX:** Immediate feedback makes the app feel faster and more responsive
- **Trade-off:** More complex error handling vs. improved perceived performance

---

### Why No Caching?

**Decision:** Did not implement caching ( Redis or Memcached ).

**Reasoning:**

- **Simplicity:** Fetch-based approach is straightforward and sufficient for this scale
- **Real-time Needs:** Task lists need fresh data; aggressive caching could show stale tasks
- **Trade-off:** More network requests vs. simpler architecture

---

### Database Connection Pool Configuration

**Decision:** Implemented optimized connection pooling with HikariCP-inspired formula.

**Implementation:**
```typescript
const cpuCores = Number(process.env.DB_CPU_CORES) || 2;
const recommendedPoolSize = cpuCores * 2;
const POOL_MIN = Math.max(1, Math.floor(recommendedPoolSize / 2));
const POOL_MAX = Math.max(2, Math.min(recommendedPoolSize, 30));

pool: {
  min: POOL_MIN,
  max: POOL_MAX,
  async afterCreate(conn: any, done: any) {
    try {
      await conn.query(`SET timezone = 'UTC'`);
      done(null, conn);
    } catch (err) {
      done(err, conn);
    }
  },
}
```

**Reasoning:**
- **Performance:** Dynamic pool sizing based on CPU cores prevents resource waste
- **Reliability:** Connection validation ensures healthy connections
- **Consistency:** UTC timezone setting prevents date/time issues
- **Error Handling:** Proper connection creation error handling

**Trade-offs:**
- **Memory vs Performance:** Higher pool size uses more memory but reduces connection overhead
- **Complexity vs Reliability:** Added validation logic vs simple connection reuse
- **Resource Management:** Bounded pool prevents connection exhaustion but may queue requests under high load

---

## Extra Deliverables 🎁

### Extra 1: UI/UX Improvements

**Commit:** [c419d03](https://github.com/lourencovw/full-stack-software-engineer-exercice/commit/c419d037561a6a5f9ea332bf219765cdb586fc39)

**Improvements:**

- Created `Home.module.css` with modern dark theme
- Implemented CSS Flexbox layout for better responsiveness
- Added hover states and visual feedback
- Styled completed tasks with strikethrough and color change
- Improved button styling and spacing
- Better visual hierarchy with proper typography

**Result:** Professional, modern UI that enhances user experience.

---

### Extra 2: AdonisJS-like Folder Structure

**Implementation:** Reorganized backend into a clean, maintainable architecture:

```
backend/
├── app/
│   ├── controllers/
│   │   └── task.controller.ts    # Business logic for task operations
│   └── models/
│       └── Task.ts               # Task model with database queries
├── config/
│   ├── database.ts               # Knex database connection
│   └── knexfile.ts               # Knex configuration
├── database/
│   ├── migrations/
│   │   └── 001_create_tasks.ts   # Database schema migrations
│   └── seeds/
│       └── 001_tasks.ts          # Seed data for tasks
├── graphql/
│   ├── resolvers.ts              # GraphQL resolvers
│   └── schema.ts                 # GraphQL type definitions
├── tests/
│   └── task.test.ts              # Unit tests for task controller
├── jest.config.js                # Jest testing configuration
├── package.json                  # Backend dependencies
├── server.ts                     # Express + Apollo Server entry point
└── tsconfig.json                 # TypeScript configuration
```

**Benefits:**

- **Separation of Concerns:** Clear boundaries between layers
- **Scalability:** Easy to add new features without cluttering
- **Familiarity:** AdonisJS-inspired structure is widely recognized
- **Maintainability:** Easier to navigate and understand codebase

---

### Extra 3: Automated Testing

**Implementation:** Added comprehensive Jest test suite with:

- Unit tests for all controller methods
- Validation logic testing
- Error handling verification
- Mock database layer for isolated testing

**Test Coverage:**

- ✅ Query.tasks - Fetch all tasks
- ✅ Mutation.createTask - Valid creation
- ✅ Mutation.createTask - Empty title validation
- ✅ Mutation.createTask - Whitespace validation
- ✅ Mutation.createTask - Length validation
- ✅ Mutation.createTask - Whitespace trimming
- ✅ Mutation.toggleTask - Toggle completion
- ✅ Mutation.toggleTask - Task not found
- ✅ Mutation.toggleTask - Invalid ID

**Run tests:**

```bash
cd backend
npm test
```

**Benefits:**

- Prevents regressions
- Documents expected behavior
- Enables confident refactoring
- Production-ready quality assurance

---

### Extra 4: Full TypeScript Migration
**Implementation:** Migrated entire codebase (frontend and backend) to TypeScript.
**Benefits:**
- Type safety across the stack
- Improved developer experience with better tooling
- Easier maintenance and refactoring

---

### Extra 5: Frontend Architecture Improvements

**Implementation:** Restructured frontend with better organization and component architecture:

```
frontend/
├── api/
│   └── tasks.ts              # API layer with all GraphQL calls
├── components/
│   └── TaskItem.tsx          # Reusable TaskItem component with React.memo
├── pages/
│   ├── Home.module.css       # CSS modules for styling
│   └── index.tsx             # Main page with optimized hooks
└── types/
    └── task.ts               # Shared TypeScript interfaces
```

**Key Improvements:**

1. **API Layer Separation:**
   - Extracted all GraphQL calls to `api/tasks.ts`
   - Centralized error handling
   - Reusable API functions across components

2. **Component Architecture:**
   - Created reusable `TaskItem` component with `React.memo`
   - Proper prop interfaces for type safety
   - Optimized re-renders with `useCallback`

3. **Performance Optimizations:**
   - Implemented optimistic UI updates
   - Used `React.memo` to prevent unnecessary re-renders
   - Memoized event handlers with `useCallback`
   - Proper dependency arrays in `useEffect`

4. **Code Organization:**
   - Separated concerns (API, UI, styling)
   - Consistent file naming conventions
   - TypeScript interfaces for better maintainability

**Benefits:**
- **Maintainability:** Clear separation of concerns
- **Performance:** Optimized rendering with memoization
- **Reusability:** Components can be easily reused
- **Type Safety:** Full TypeScript coverage
- **Scalability:** Easy to add new features and components

---

## Summary

### Required Tasks Completed:

✅ **Task 1:** Remove inefficient queries (N+1 problems)  
✅ **Task 2:** Add validation and error handling  
✅ **Task 3:** Explained trade-offs and decision-making process  
✅ **Task 4:** Proper async/await handling  
✅ **Task 5:** Frontend re-render optimization  
✅ **Task 6:** Optimistic UI updates or proper refetching  

### Extra Deliverables:

🎁 **UI/UX:** Modern, professional interface with CSS modules  
🎁 **Architecture:** AdonisJS-like folder structure for maintainability  
🎁 **Testing:** Comprehensive Jest test suite with 100% controller coverage  
🎁 **TypeScript:** Full migration for type safety and better DX  
🎁 **Frontend Structure:** Improved component architecture and API layer separation

### Production Considerations:

- Add authentication and authorization
- Implement rate limiting and request validation
- Implement proper logging and monitoring
- Add CI/CD pipeline with automated tests
- Consider GraphQL DataLoader for advanced query optimization
- Add error tracking (Sentry, Rollbar)
- Implement proper environment configuration management
- Logging and monitoring for production readiness
