-- Enable RLS on all tenant-facing tables
ALTER TABLE "programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_jobs" ENABLE ROW LEVEL SECURITY;

-- Create policies for programs
CREATE POLICY tenant_isolation_policy ON "programs"
  USING (creator_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (creator_id = current_setting('app.current_tenant')::uuid);

-- Create policies for sessions
CREATE POLICY tenant_isolation_policy ON "sessions"
  USING (creator_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (creator_id = current_setting('app.current_tenant')::uuid);

-- Create policies for audit_logs
CREATE POLICY tenant_isolation_policy ON "audit_logs"
  USING (creator_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (creator_id = current_setting('app.current_tenant')::uuid);

-- Create policies for import_jobs
CREATE POLICY tenant_isolation_policy ON "import_jobs"
  USING (creator_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (creator_id = current_setting('app.current_tenant')::uuid);
