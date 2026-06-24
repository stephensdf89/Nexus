-- Enable RLS and apply ownership policies for pipeline and creator tables.
-- Safe to re-run: each policy is dropped/re-created.

-- user_settings (legacy, snake_case)
ALTER TABLE IF EXISTS public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.user_settings;
CREATE POLICY "Users can access their own data"
ON public.user_settings
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- UserSettings (Prisma ORM table, camelCase)
ALTER TABLE IF EXISTS public."UserSettings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public."UserSettings";
CREATE POLICY "Users can access their own data"
ON public."UserSettings"
FOR ALL
TO authenticated
USING ((select auth.uid()) = "userId")
WITH CHECK ((select auth.uid()) = "userId");

-- pipelines
ALTER TABLE IF EXISTS public.pipelines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.pipelines;
CREATE POLICY "Users can access their own data"
ON public.pipelines
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- pipeline_steps (owned through pipelines.user_id)
ALTER TABLE IF EXISTS public.pipeline_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.pipeline_steps;
CREATE POLICY "Users can access their own data"
ON public.pipeline_steps
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pipelines p
    WHERE p.id = pipeline_steps.pipeline_id
      AND p.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pipelines p
    WHERE p.id = pipeline_steps.pipeline_id
      AND p.user_id = (select auth.uid())
  )
);

-- pipeline_runs (owned through pipelines.user_id)
ALTER TABLE IF EXISTS public.pipeline_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.pipeline_runs;
CREATE POLICY "Users can access their own data"
ON public.pipeline_runs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pipelines p
    WHERE p.id = pipeline_runs.pipeline_id
      AND p.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pipelines p
    WHERE p.id = pipeline_runs.pipeline_id
      AND p.user_id = (select auth.uid())
  )
);

-- pipeline_run_steps (owned through pipeline_runs -> pipelines.user_id)
ALTER TABLE IF EXISTS public.pipeline_run_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.pipeline_run_steps;
CREATE POLICY "Users can access their own data"
ON public.pipeline_run_steps
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pipeline_runs pr
    JOIN public.pipelines p ON p.id = pr.pipeline_id
    WHERE pr.id = pipeline_run_steps.run_id
      AND p.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pipeline_runs pr
    JOIN public.pipelines p ON p.id = pr.pipeline_id
    WHERE pr.id = pipeline_run_steps.run_id
      AND p.user_id = (select auth.uid())
  )
);

-- notifications
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.notifications;
CREATE POLICY "Users can access their own data"
ON public.notifications
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- tasks
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.tasks;
CREATE POLICY "Users can access their own data"
ON public.tasks
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- ideas
ALTER TABLE IF EXISTS public.ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.ideas;
CREATE POLICY "Users can access their own data"
ON public.ideas
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- templates
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.templates;
CREATE POLICY "Users can access their own data"
ON public.templates
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- planner_events
ALTER TABLE IF EXISTS public.planner_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.planner_events;
CREATE POLICY "Users can access their own data"
ON public.planner_events
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- integrations
ALTER TABLE IF EXISTS public.integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own integrations" ON public.integrations;
CREATE POLICY "Users can read their own integrations"
ON public.integrations
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.integrations;
CREATE POLICY "Users can insert their own integrations"
ON public.integrations
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own integrations" ON public.integrations;
CREATE POLICY "Users can update their own integrations"
ON public.integrations
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.integrations;
CREATE POLICY "Users can delete their own integrations"
ON public.integrations
FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- integration_triggers
ALTER TABLE IF EXISTS public.integration_triggers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.integration_triggers;
CREATE POLICY "Users can access their own data"
ON public.integration_triggers
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- billing
ALTER TABLE IF EXISTS public.billing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.billing;
CREATE POLICY "Users can access their own data"
ON public.billing
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
