# Wellspring Architecture Review

## What I Built and What I Skipped
I built the full core of Wellspring: multi-tenant authentication, program and session CRUD, drag-and-drop reordering, idempotent bulk CSV import, and a filtered audit log viewer. The UI follows a premium dark glassmorphic design.

I skipped an actual AWS S3 integration, providing a robust mock/simulator instead. This was a conscious decision to ensure the platform remains self-contained for the review process without requiring external AWS credentials, while maintaining the exact architectural flow (pre-signed URL request -> client-side upload -> public URL storage).

## Tenant Isolation Strategy
I implemented **Logical Isolation (Row-Level Filtering)**. Every table except for the `creators` table includes a `creator_id` column.
- **Why**: For a startup-scale multi-tenant app, this provides the best balance between performance and operational simplicity. 
- **Enforcement**: In the current version, this is enforced at the service/controller layer by always including `and(eq(table.creatorId, req.user.tenantId))` in every query. I verified this with specific automated tests (`rejects cross-tenant program access`).
- **Scalability**: At 100 creators, this is perfect. At 10,000, PostgreSQL indices on `creator_id` ensure performance remains fast. At 1,000,000+, we might consider **Physical Isolation** (Schema-per-tenant) or using **Citrus/Hyperscale** to shard the database based on `creator_id`.

## Bulk Import Design
The bulk import is designed as an **Idempotent Batch Operation**.
- **Idempotency**: The client generates a unique `clientBatchId` (UUID). The server records this in `import_jobs` upon completion.
- **Failures**: I use a single database transaction for the actual insertion. This ensures that an import either succeeds entirely or fails entirely at the database level. Row-level validation errors are collected and returned to the user without failing the whole process, allowing them to fix specific rows and re-upload.

## S3 Upload Flow
The flow uses **Pre-signed URLs** to offload file handling from the backend.
- **Security**: URLs are time-limited and the file path is prefixed with the `tenant_id`, ensuring one tenant cannot overwrite or guess another's files.
- **Evolution**: For very large files, I would evolve this to use **Multipart Uploads**, where the client requests a separate upload part URL and the backend completes the assembly.

## Confidence & Future Improvements
- **Confidence**: I am very confident in the data integrity and isolation logic. The use of Drizzle ORM ensures type safety across the board.
- **Future Changes (with 2 more days)**:
  1. **PostgreSQL RLS**: Upgrade from manual filters to actual Native Row Level Security at the DB layer using `SET LOCAL app.current_tenant`.
  2. **Real S3 Integration**: Plug in LocalStack or a temporary AWS bucket.
  3. **Frontend Polish**: Add more micro-animations (Framer Motion) and better error states for individual session edits.
  4. **Performance**: Implement Redis caching for public-facing program details.
