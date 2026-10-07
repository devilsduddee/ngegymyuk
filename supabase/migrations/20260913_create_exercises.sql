-- ==============================================================================
-- Sprint 2: Exercise Library Migration
-- Schema, RLS, and 50+ Popular Gym Exercises Seed
-- ==============================================================================

-- 1. Create Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_muscle TEXT NOT NULL,
    secondary_muscle TEXT,
    equipment TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public / Authenticated Read Access
CREATE POLICY "Allow read access for all users"
ON public.exercises
FOR SELECT
USING (true);

-- 4. Seed Data: 50+ Popular Gym Exercises
INSERT INTO public.exercises (name, primary_muscle, secondary_muscle, equipment, description)
VALUES
-- Chest
('Barbell Bench Press', 'Chest', 'Triceps', 'Barbell', 'Gerakan compound utama untuk membangun kekuatan dan massa otot dada.'),
('Incline Dumbbell Press', 'Chest', 'Shoulders', 'Dumbbell', 'Menargetkan clavicular head (dada bagian atas) dengan rentang gerak yang luas.'),
('Cable Chest Fly', 'Chest', 'Shoulders', 'Cable', 'Memberikan kontraksi konstan sepanjang gerakan isolasi dada.'),
('Dips (Chest Focus)', 'Chest', 'Triceps', 'Bodyweight', 'Gerakan compound bodyweight dengan memcondongkan badan ke depan.'),
('Machine Chest Press', 'Chest', 'Triceps', 'Machine', 'Gerakan stabil dengan kurva resistensi tetap untuk hipertrofi dada.'),
('Decline Barbell Press', 'Chest', 'Triceps', 'Barbell', 'Menargetkan bagian bawah otot dada dengan posisi bench menurun.'),
('Pec Deck Fly', 'Chest', 'Shoulders', 'Machine', 'Isolasi adduksi horizontal otot dada secara terarah dan aman.'),
('Push-Ups', 'Chest', 'Triceps', 'Bodyweight', 'Latihan kalistenik dasar untuk dada, bahu, dan stabilitas core.'),

-- Back
('Barbell Deadlift', 'Back', 'Hamstrings', 'Barbell', 'Raja latihan posterior chain yang membangun punggung tebal dan daya ledak.'),
('Lat Pulldown', 'Back', 'Biceps', 'Cable', 'Membangun lebar latissimus dorsi untuk menciptakan bentuk V-taper.'),
('Barbell Bent-Over Row', 'Back', 'Biceps', 'Barbell', 'Membangun ketebalan punggung tengah (rhomboids dan mid-traps).'),
('Seated Cable Row', 'Back', 'Biceps', 'Cable', 'Latihan tarikan horizontal yang stabil untuk punggung tengah.'),
('Pull-Ups', 'Back', 'Biceps', 'Bodyweight', 'Latihan beban tubuh terhebat untuk menguji kekuatan tarikan latissimus dorsi.'),
('Single-Arm Dumbbell Row', 'Back', 'Biceps', 'Dumbbell', 'Melatih kekuatan punggung secara unilateral untuk mengoreksi ketidakseimbangan.'),
('T-Bar Row', 'Back', 'Biceps', 'Machine', 'Variasi row beban berat dengan sudut stabil untuk penebalan punggung.'),
('Straight-Arm Lat Pulldown', 'Back', 'Triceps', 'Cable', 'Isolasi murni latissimus dorsi tanpa melibatkan kelelahan lengan bawah atau bicep.'),

-- Shoulders
('Overhead Barbell Press', 'Shoulders', 'Triceps', 'Barbell', 'Pondasi kekuatan bahu vertikal dan stabilitas seluruh tubuh.'),
('Dumbbell Lateral Raise', 'Shoulders', NULL, 'Dumbbell', 'Isolasi lateral deltoid untuk menciptakan bahu yang lebar dan proporsional.'),
('Seated Dumbbell Shoulder Press', 'Shoulders', 'Triceps', 'Dumbbell', 'Gerakan compound bahu yang aman untuk sendi dengan pegangan netral/pronasi.'),
('Cable Lateral Raise', 'Shoulders', NULL, 'Cable', 'Tegangan kontinu pada lateral deltoid di titik awal hingga puncak gerakan.'),
('Face Pull', 'Shoulders', 'Back', 'Cable', 'Menargetkan posterior deltoid dan rotator cuff untuk kesehatan bahu optimal.'),
('Reverse Pec Deck Fly', 'Shoulders', 'Back', 'Machine', 'Isolasi terfokus untuk rear deltoid dan punggung atas.'),

-- Biceps
('Barbell Bicep Curl', 'Biceps', 'Forearms', 'Barbell', 'Latihan beban berat utama untuk menambah ukuran dan kekuatan bicep.'),
('Incline Dumbbell Curl', 'Biceps', NULL, 'Dumbbell', 'Menghasilkan peregangan maksimal pada long head bicep pada sudut sandaran miring.'),
('Hammer Curl', 'Biceps', 'Forearms', 'Dumbbell', 'Mengembangkan brachialis dan brachioradialis untuk ketebalan lengan.'),
('Preacher Curl', 'Biceps', NULL, 'Barbell', 'Mencegah momentum tubuh dan mengisolasi short head bicep secara penuh.'),
('Cable Rope Bicep Curl', 'Biceps', 'Forearms', 'Cable', 'Variasi curl dengan resistensi stabil untuk pompa darah maksimal.'),

-- Triceps
('Cable Tricep Pushdown', 'Triceps', NULL, 'Cable', 'Isolasi klasik lateral head tricep menggunakan bar atau tali.'),
('Skull Crushers', 'Triceps', NULL, 'Barbell', 'Peregangan mendalam pada medial dan long head tricep.'),
('Close-Grip Bench Press', 'Triceps', 'Chest', 'Barbell', 'Gerakan compound beban tinggi untuk membangun massa tricep yang kokoh.'),
('Overhead Dumbbell Tricep Extension', 'Triceps', NULL, 'Dumbbell', 'Menargetkan long head tricep melalui peregangan bahu ke atas.'),
('Dip Machine', 'Triceps', 'Chest', 'Machine', 'Gerakan ekstensi siku vertikal dengan beban terukur dan aman bagi persendian.'),

-- Quads
('Barbell Back Squat', 'Quads', 'Glutes', 'Barbell', 'Raja latihan kaki untuk pengembangan kekuatan paha depan dan pinggul.'),
('Leg Press', 'Quads', 'Glutes', 'Machine', 'Mendorong beban berat untuk paha depan tanpa membebani tulang belakang.'),
('Leg Extension', 'Quads', NULL, 'Machine', 'Isolasi murni paha depan (rectus femoris dan vastus medialis).'),
('Bulgarian Split Squat', 'Quads', 'Glutes', 'Dumbbell', 'Latihan unilateral yang menantang keseimbangan dan kekuatan masing-masing kaki.'),
('Hack Squat', 'Quads', 'Glutes', 'Machine', 'Gerakan squat dengan sudut 45 derajat yang menumpukan beban pada paha depan.'),
('Goblet Squat', 'Quads', 'Glutes', 'Dumbbell', 'Squat dengan dumbbell di depan dada, cocok untuk memperbaiki kedalaman squat.'),

-- Hamstrings & Glutes
('Romanian Deadlift (RDL)', 'Hamstrings', 'Glutes', 'Barbell', 'Peregangan beban pada paha belakang dan pembebanan engsel pinggul (hip hinge).'),
('Lying Leg Curl', 'Hamstrings', 'Calves', 'Machine', 'Fleksi lutut terisolasi untuk membangun kekuatan dan bentuk hamstring.'),
('Barbell Hip Thrust', 'Glutes', 'Hamstrings', 'Barbell', 'Gerakan terbaik untuk aktivasi dan pembesaran otot gluteus maximus.'),
('Seated Leg Curl', 'Hamstrings', NULL, 'Machine', 'Melatih hamstring dalam posisi pinggul menekuk untuk peregangan lebih dalam.'),
('Dumbbell Romanian Deadlift', 'Hamstrings', 'Glutes', 'Dumbbell', 'Variasi RDL dengan dumbbell untuk rentang gerak yang lebih alami.'),
('Cable Glute Kickback', 'Glutes', 'Hamstrings', 'Cable', 'Isolasi ekstensi pinggul untuk pembentukan otot bokong secara terarah.'),

-- Calves
('Standing Calf Raise', 'Calves', NULL, 'Machine', 'Menargetkan otot gastrocnemius pada posisi lutut lurus.'),
('Seated Calf Raise', 'Calves', NULL, 'Machine', 'Menargetkan otot soleus dengan posisi lutut ditekuk 90 derajat.'),
('Single-Leg Dumbbell Calf Raise', 'Calves', NULL, 'Dumbbell', 'Melatih kekuatan betis secara unilateral pada step board.'),

-- Abs & Core
('Hanging Leg Raise', 'Abs', NULL, 'Bodyweight', 'Latihan inti tingkat lanjut untuk melatih rectus abdominis bagian bawah.'),
('Cable Crunch', 'Abs', NULL, 'Cable', 'Fleksi tulang belakang dengan beban terukur untuk progressive overload otot perut.'),
('Plank', 'Abs', 'Shoulders', 'Bodyweight', 'Latihan isometrik dasar untuk stabilitas panggul dan kekuatan inti.'),
('Ab Wheel Rollout', 'Abs', 'Back', 'Other', 'Latihan anti-ekstensi yang sangat intensif untuk seluruh dinding perut.'),

-- Forearms
('Barbell Wrist Curl', 'Forearms', NULL, 'Barbell', 'Mengembangkan fleksor pergelangan tangan dan kekuatan genggaman.'),
('Reverse Barbell Curl', 'Forearms', 'Biceps', 'Barbell', 'Melatih ekstensor lengan bawah dan brachioradialis secara intensif.');
