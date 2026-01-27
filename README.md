# Financial Transactions Dashboard

End-to-end financial data pipeline demonstrating production-grade CSV ingestion, async aggregation, and interactive analytics.

![Sample Screenshot](sample.png)

---

## Why This Exists

Built to demonstrate:
- Safe handling of untrusted CSV data (validation + type coercion)
- Async aggregation at scale without blocking the API
- Clean separation between data layer, business logic, and presentation

This is a **teaching artifact** showing how to build financial analytics systems that stay fast as data grows.

---

## System Architecture

**Backend:** FastAPI + async SQLAlchemy + PostgreSQL  
**Frontend:** React with interactive transaction explorer  
**Data pipeline:** Bulk CSV ingestion with schema validation  
**Analytics:** Real-time scheme-level and user-level aggregations  
**Reporting:** PDF export for offline analysis

---

## Key Engineering Decisions

### 1. Bulk Insert Pipeline
```python
# Bad: Row-by-row inserts (slow at scale)
for row in csv_rows:
    db.add(Transaction(**row))

# Good: Bulk upsert (50x faster for 10k+ rows)
db.bulk_insert_mappings(Transaction, validated_rows)
```

Optimized for high-volume batch ingestion.

---

### 2. Fail-Fast Schema Validation

Malformed CSV data fails at the API boundary with detailed error messages:
```json
{
  "error": "Invalid schema",
  "details": {
    "row": 142,
    "field": "amount",
    "expected": "decimal",
    "received": "abc123"
  }
}
```

Prevents corrupted data from entering the system.

---

### 3. Async Database Access

Analytics queries use async SQLAlchemy to prevent blocking:
```python
# Handles concurrent dashboard requests without thread overhead
async with AsyncSession(engine) as session:
    result = await session.execute(aggregation_query)
```

Keeps the API responsive under analytics load.

---

### 4. Repository Pattern

Business logic isolated from framework details:
```
routes/ → Handles HTTP
services/ → Orchestrates workflows  
repositories/ → Database access
models/ → Domain objects
```

Makes testing and swapping implementations straightforward.

---

## What's Demonstrated

✅ **CSV Upload:** Handles large files with streaming validation  
✅ **Data Normalization:** Coerces types, validates constraints  
✅ **Aggregation:** Real-time scheme/user-level analytics  
✅ **Visualization:** Interactive dashboard with filtering  
✅ **PDF Export:** Generates offline reports  
✅ **Dockerized:** Full environment via `docker-compose`  
✅ **Tested:** Backend and frontend test suites included

---

## Running with Docker Compose
```bash
# Start all services
docker compose up --build -d
```

**Services started:**
- PostgreSQL (port 5432)
- Alembic migrations (auto-run)
- FastAPI backend (port 8000)
- React frontend (port 3000)

**Access:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Dashboard: http://localhost:3000

---

## Useful Commands

**View logs:**
```bash
docker compose logs -f
```

**Restart backend after code changes:**
```bash
docker compose restart app
```

**Reset database:**
```bash
docker compose down -v  # Deletes volumes
docker compose up --build -d
```

---

## Extension Points

This system was built with clear hooks for:
- **Authentication:** Middleware ready for JWT/session integration
- **Background jobs:** Service layer structured for async task queues
- **Idempotency:** Request deduplication can be added at repository layer
- **Multi-tenancy:** User scoping already present in data model

---

## What's Intentionally Missing

- Real authentication (focus is on data pipeline architecture)
- Horizontal scaling (targets single-instance clarity)
- Real-time streaming (batch-focused design)

Added complexity without improving the core demonstration.

---

## Key Files for Review

1. **CSV ingestion:** `backend/routes/upload.py`
2. **Aggregation logic:** `backend/services/analytics.py`
3. **Repository pattern:** `backend/repositories/transaction_repo.py`
4. **Frontend dashboard:** `frontend/src/components/Dashboard.tsx`# Financial Transactions Dashboard

End-to-end financial data pipeline demonstrating production-grade CSV ingestion, async aggregation, and interactive analytics.

![Sample Screenshot](sample.png)

---

## Why This Exists

Built to demonstrate:
- Safe handling of untrusted CSV data (validation + type coercion)
- Async aggregation at scale without blocking the API
- Clean separation between data layer, business logic, and presentation

This is a **teaching artifact** showing how to build financial analytics systems that stay fast as data grows.

---

## System Architecture

**Backend:** FastAPI + async SQLAlchemy + PostgreSQL  
**Frontend:** React with interactive transaction explorer  
**Data pipeline:** Bulk CSV ingestion with schema validation  
**Analytics:** Real-time scheme-level and user-level aggregations  
**Reporting:** PDF export for offline analysis

---

## Key Engineering Decisions

### 1. Bulk Insert Pipeline
```python
# Bad: Row-by-row inserts (slow at scale)
for row in csv_rows:
    db.add(Transaction(**row))

# Good: Bulk upsert (50x faster for 10k+ rows)
db.bulk_insert_mappings(Transaction, validated_rows)
```

Optimized for high-volume batch ingestion.

---

### 2. Fail-Fast Schema Validation

Malformed CSV data fails at the API boundary with detailed error messages:
```json
{
  "error": "Invalid schema",
  "details": {
    "row": 142,
    "field": "amount",
    "expected": "decimal",
    "received": "abc123"
  }
}
```

Prevents corrupted data from entering the system.

---

### 3. Async Database Access

Analytics queries use async SQLAlchemy to prevent blocking:
```python
# Handles concurrent dashboard requests without thread overhead
async with AsyncSession(engine) as session:
    result = await session.execute(aggregation_query)
```

Keeps the API responsive under analytics load.

---

### 4. Repository Pattern

Business logic isolated from framework details:
```
routes/ → Handles HTTP
services/ → Orchestrates workflows  
repositories/ → Database access
models/ → Domain objects
```

Makes testing and swapping implementations straightforward.

---

## What's Demonstrated

✅ **CSV Upload:** Handles large files with streaming validation  
✅ **Data Normalization:** Coerces types, validates constraints  
✅ **Aggregation:** Real-time scheme/user-level analytics  
✅ **Visualization:** Interactive dashboard with filtering  
✅ **PDF Export:** Generates offline reports  
✅ **Dockerized:** Full environment via `docker-compose`  
✅ **Tested:** Backend and frontend test suites included

---

## Running with Docker Compose
```bash
# Start all services
docker compose up --build -d
```

**Services started:**
- PostgreSQL (port 5432)
- Alembic migrations (auto-run)
- FastAPI backend (port 8000)
- React frontend (port 3000)

**Access:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Dashboard: http://localhost:3000

---

## Useful Commands

**View logs:**
```bash
docker compose logs -f
```

**Restart backend after code changes:**
```bash
docker compose restart app
```

**Reset database:**
```bash
docker compose down -v  # Deletes volumes
docker compose up --build -d
```

---

## Extension Points

This system was built with clear hooks for:
- **Authentication:** Middleware ready for JWT/session integration
- **Background jobs:** Service layer structured for async task queues
- **Idempotency:** Request deduplication can be added at repository layer
- **Multi-tenancy:** User scoping already present in data model

---

## What's Intentionally Missing

- Real authentication (focus is on data pipeline architecture)
- Horizontal scaling (targets single-instance clarity)
- Real-time streaming (batch-focused design)

Added complexity without improving the core demonstration.

---

## Key Files for Review

1. **CSV ingestion:** `backend/routes/upload.py`
2. **Aggregation logic:** `backend/services/analytics.py`
3. **Repository pattern:** `backend/repositories/transaction_repo.py`
4. **Frontend dashboard:** `frontend/src/components/Dashboard.tsx`
