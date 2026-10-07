-- ==============================================================================
-- Sprint 4A: Core Workout Session Migration
-- Tables: workout_sessions & workout_sets
-- Includes: Foreign Keys, Indexes, Cascade Delete, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Create workout_sessions Table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
    workout_name TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    total_volume NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_sets INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- 2. Create workout_sets Table
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight NUMERIC(8,2) NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    volume NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id 
    ON public.workout_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at 
    ON public.workout_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id 
    ON public.workout_sets(session_id);

CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id 
    ON public.workout_sets(exercise_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for workout_sessions
CREATE POLICY "Users can view own workout sessions"
    ON public.workout_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout sessions"
    ON public.workout_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
    ON public.workout_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
    ON public.workout_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for workout_sets (via parent session user_id check)
CREATE POLICY "Users can view sets of own workout sessions"
    ON public.workout_sets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = session_id AND ws.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sets to own workout sessions"
    ON public.workout_sets
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = session_id AND ws.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sets of own workout sessions"
    ON public.workout_sets
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = session_id AND ws.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sets from own workout sessions"
    ON public.workout_sets
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = session_id AND ws.user_id = auth.uid()
        )
    );
