-- ==============================================================================
-- Sprint 3: Workout Builder Migration
-- Tables: workout_templates & workout_template_exercises
-- Includes: Foreign Keys, Indexes, Triggers, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Create workout_templates Table
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create workout_template_exercises Table
CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_number INTEGER NOT NULL DEFAULT 1,
    target_sets INTEGER NOT NULL DEFAULT 4,
    target_reps INTEGER NOT NULL DEFAULT 8,
    rest_timer_seconds INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id 
    ON public.workout_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_template_id 
    ON public.workout_template_exercises(template_id);

CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_order 
    ON public.workout_template_exercises(template_id, order_number);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for workout_templates
CREATE POLICY "Users can view own workout templates"
    ON public.workout_templates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout templates"
    ON public.workout_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout templates"
    ON public.workout_templates
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout templates"
    ON public.workout_templates
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for workout_template_exercises
-- Accessible only if user owns the parent template
CREATE POLICY "Users can view exercises of own templates"
    ON public.workout_template_exercises
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_id AND wt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert exercises to own templates"
    ON public.workout_template_exercises
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_id AND wt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update exercises in own templates"
    ON public.workout_template_exercises
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_id AND wt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete exercises from own templates"
    ON public.workout_template_exercises
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_id AND wt.user_id = auth.uid()
        )
    );
