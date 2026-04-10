# Backend Architecture Refactoring

## New Architecture: Service-Repository Pattern

### Architecture Flow

```
Route
  ↓
Controller (HTTP Handler)
  ↓
Service (Business Logic)
  ↓
Repository (Database Queries)
  ↓
Model (MongoDB Schema)
```

---

## Layer Responsibilities

### 🔴 **Routes** (`src/routes/`)

- **Defines** endpoint paths and HTTP methods
- **Maps** requests to controller handlers
- **No business logic** - purely routing configuration

Example:

```javascript
router.get("/requests/:id", getRequest);
router.post("/requests", createRequest);
```

---

### 🟠 **Controller** (`src/controllers/`)

- **Handles** HTTP requests and responses
- **Validates** request input
- **Returns** appropriate HTTP status codes
- **Delegates** all business logic to services
- **Catches** errors and passes to error middleware

Example:

```javascript
export const getRequest = async (req, res, next) => {
  try {
    const data = await requestService.getRequestById(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

---

### 🟡 **Service** (`src/services/`)

- **Implements** business logic and rules
- **Manages** workflow and operations
- **Validates** data according to business rules
- **Throws** `AppError` for business rule violations
- **Uses** repositories for all database operations
- **No direct** database queries

Example:

```javascript
export const setFounderDecisionOnRequest = async (id, decisionData) => {
  const { decision, comment } = decisionData;

  // Business logic: validate decision
  if (!["accept", "reject"].includes(decision)) {
    throw new AppError("Invalid decision", 400);
  }

  // Get request from repository
  const request = await requestRepository.findByIdForUpdate(id);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  // Apply business rules
  request.founderDecision = { decision, comment, decidedAt: new Date() };
  request.requestStatus = decision === "accept" ? "pending_mentor" : "rejected";

  // Save via repository
  return await requestRepository.save(request);
};
```

---

### 🟣 **Repository** (`src/repositories/`)

- **Handles** database queries only
- **No business logic** - pure data operations
- **Provides** CRUD operations for models
- **Returns** data to services
- **Single responsibility**: Database communication

Example:

```javascript
export const findById = async (id) => {
  return await Request.findById(id).lean();
};

export const create = async (payload) => {
  return await Request.create(payload);
};

export const save = async (doc) => {
  return await doc.save();
};
```

---

### 🟢 **Model** (`src/models/`)

- **Defines** MongoDB schema structure
- **Enforces** data types and validation rules
- **No business logic** - schema definition only
- **Unchanged** in this refactoring

---

## Error Handling

### AppError Class

```javascript
throw new AppError("User not found", 404);
```

- **Message**: Human-readable error description
- **Status Code**: HTTP status code

### Error Middleware

The global error handler catches all errors:

```javascript
app.use(errorHandler); // Must be last middleware
```

---

## File Structure

```
backend/src/
├── controllers/          🟠 HTTP Handlers
│   ├── requestController.js
│   └── startupController.js
├── services/            🟡 Business Logic
│   ├── requestService.js
│   └── startupService.js
├── repositories/        🟣 Database Operations
│   ├── requestRepository.js
│   └── startupRepository.js
├── models/              🟢 Schema Definitions
│   ├── Request.js
│   └── Startup.js
├── routes/              🔴 Route Definitions
│   ├── index.js
│   └── v1/
│       └── index.js
├── middlewares/         Middleware
│   └── error.middleware.js
├── utils/
│   └── AppError.js
├── config/
│   └── db.js
├── app.js               Main Express App
└── server.js            Server Entry Point
```

---

## Benefits of This Architecture

✅ **Separation of Concerns** - Each layer has a single responsibility
✅ **Testability** - Services and repositories are easy to unit test
✅ **Maintainability** - Business logic is centralized in services
✅ **Reusability** - Services can be used by multiple controllers
✅ **Scalability** - Easy to add new endpoints or features
✅ **Database Independence** - Change DB by updating repository only
✅ **Error Handling** - Consistent error handling across the app

---

## Example Request Flow

### Creating a Request

```
1. POST /api/v1/requests
   └─> requestController.createRequest()
       └─> requestService.createNewRequest()
           ├─> Validate input (required fields)
           ├─> Ensure createdBy is set
           └─> requestRepository.create()
               └─> Request.create() → MongoDB
               └─> Return created document
           └─> Return to service
       └─> Return to controller
   └─> Response: 201 Created { data: {...} }
```

---

## Configuration Notes

### Error Handler Activation

The error middleware is registered at the end of `app.js`:

```javascript
app.use("/api", router);
app.use(errorHandler); // Must be last
```

Controllers pass errors to middleware using `next(error)`:

```javascript
try {
  // ... controller logic
} catch (error) {
  next(error); // Passed to error middleware
}
```

---

## Migration Notes

All existing functionality is preserved:

- ✅ All endpoints work the same way
- ✅ Request/Response formats unchanged
- ✅ Database operations identical
- ✅ Error handling improved
- ✅ Code organization improved


