# Wellspring Code Summary

This document provides a module-by-module summary of the Wellspring codebase.

## Auth (backend/src/routes/auth.ts)
Handles creator signup and login. It uses JWT for session management and bcrypt for password hashing. The `creator_id` is used as the `tenant_id` throughout the system to ensure multi-tenant isolation. Key choice: Using the unique creator UUID as the partition key for all data.

## Database & Schema (backend/src/db/schema.ts)
Defines the PostgreSQL schema using Drizzle ORM. Includes tables for `creators`, `programs`, `sessions`, `audit_logs`, and `import_jobs`. Every table (except `creators`) contains a `creator_id` to enforce data isolation at the storage level. Key choice: Redundant `creator_id` on sessions (which already have `program_id`) to allow simpler, 1-hop isolation checks.

## Programs & Sessions (backend/src/routes/programs.ts, sessions.ts)
Core CRUD modules for wellness content. Implements drag-reorder logic via a `reorder` endpoint that updates positions in a database transaction. Key choice: Position-based ordering for sessions to support arbitrary drag-and-drop sequences.

## Bulk Import (backend/src/services/importService.ts)
A robust service for CSV processing. It implements row-level validation and idempotency using a `clientBatchId`. It records the results in `import_jobs` so that retried requests with the same ID return the existing results without duplicating rows. Key choice: Transaction-based batch insertion with a row-level uniqueness check as a secondary safety net.

## Audit Logging (backend/src/utils/audit.ts)
A centralized utility that captures administrative actions. It logs the actor, action type, target entity, and a snapshot of the request. It's integrated into all write-heavy routes. Key choice: Structured metadata storage in JSONB to allow flexible logging of different entity changes.

## Frontend (frontend/src/app)
Built with Next.js (App Router) and Tailwind CSS. It uses `dnd-kit` for session reordering and `lucide-react` for iconography. The UI uses a premium glassmorphic dark theme. Key choice: Using a shared `SortableItem` component to abstract drag-and-drop complexity from the main program view.
