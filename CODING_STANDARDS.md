# Booklyn Coding Standards & Conventions

## 1. Class-Based Structure
- Each feature (e.g., users, books) has its own service, controller, and route file.
- Each file exports a single class (e.g., BookService, BookController) with static methods for each operation.

## 2. File Naming and Placement
- Service logic: `src/services/feature.service.ts` (e.g., `book.service.ts`).
- Controller logic: `src/controllers/feature.controller.ts` (e.g., `book.controller.ts`).
- Routes: `src/routes/feature.routes.ts` (e.g., `book.routes.ts`).

## 3. Type Safety
- All variables, function parameters, and return types use explicit TypeScript types and interfaces (from `src/types/library.ts`).
- Ensures clarity, maintainability, and reduces runtime errors.

## 4. Error Handling
- **Services:** Never use try/catch; throw `AppError` for expected errors or let unexpected errors bubble up.
- **Controllers:** Use try/catch to handle errors and pass them to `next()` for the global error handler.
- **Global Error Handler:** Responds based on error type.

## 5. Swagger Documentation
- Swagger JSDoc comments are placed above route definitions in the route files.
- Models referenced in Swagger (`$ref`) are defined globally in the Swagger config (`src/config/swagger.ts`).

## 6. Routing
- Each module (feature) has its own router defined in a separate file in `src/routes/feature.routes.ts` (e.g., `book.routes.ts`).
- Each route file defines endpoints and connects them to the appropriate controller methods.
- All module routers are imported and used in the main router file (`src/routes/index.ts`).

## 7. Separation of Concerns
- Business logic is in services, request/response handling in controllers, and endpoint definitions in routes.

## 8. Consistency
- All endpoints follow the same pattern for maintainability and clarity.
- Naming, structure, and documentation are uniform across the codebase.

## 9. Referencing API Docs
- Endpoint specifications are always checked against the API documentation file (`prisma/seeds/API_DOCS_FULL.md`) to ensure accuracy.

---

**Summary:**
This approach results in a clean, scalable, and well-documented codebase that is easy to maintain and extend. All contributors must follow these standards for all future endpoints and features.
