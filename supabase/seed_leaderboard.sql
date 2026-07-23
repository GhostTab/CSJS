-- CSJS Learn — Leaderboard seed data (test students + quiz attempts)
-- Run in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: deletes previous seed users first (emails ending with @csjs-seed.test)

-- Extensions
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Remove previous seed users (cascades to profiles + quiz_attempts)
-- ---------------------------------------------------------------------------
delete from auth.users
where email like '%@csjs-seed.test';

-- ---------------------------------------------------------------------------
-- 2) Insert 5 seed students into auth.users
-- Password for all: SeedPass123!
-- ---------------------------------------------------------------------------
do $$
declare
  v_instance_id uuid;
  u1 uuid := '11111111-1111-4111-8111-111111111111';
  u2 uuid := '22222222-2222-4222-8222-222222222222';
  u3 uuid := '33333333-3333-4333-8333-333333333333';
  u4 uuid := '44444444-4444-4444-8444-444444444444';
  u5 uuid := '55555555-5555-4555-8555-555555555555';
  pwd text := crypt('SeedPass123!', gen_salt('bf'));
begin
  select id into v_instance_id from auth.instances limit 1;
  if v_instance_id is null then
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values
    (v_instance_id, u1, 'authenticated', 'authenticated', 'ana.reyes@csjs-seed.test', pwd,
      now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ana Reyes"}',
      now(), now(), '', '', '', ''),
    (v_instance_id, u2, 'authenticated', 'authenticated', 'ben.santos@csjs-seed.test', pwd,
      now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ben Santos"}',
      now(), now(), '', '', '', ''),
    (v_instance_id, u3, 'authenticated', 'authenticated', 'carla.diaz@csjs-seed.test', pwd,
      now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Carla Diaz"}',
      now(), now(), '', '', '', ''),
    (v_instance_id, u4, 'authenticated', 'authenticated', 'diego.cruz@csjs-seed.test', pwd,
      now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Diego Cruz"}',
      now(), now(), '', '', '', ''),
    (v_instance_id, u5, 'authenticated', 'authenticated', 'ella.ramos@csjs-seed.test', pwd,
      now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ella Ramos"}',
      now(), now(), '', '', '', '');

  -- Identities (required for email login)
  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values
    (u1, u1, format('{"sub":"%s","email":"ana.reyes@csjs-seed.test"}', u1)::jsonb, 'email', u1::text, now(), now(), now()),
    (u2, u2, format('{"sub":"%s","email":"ben.santos@csjs-seed.test"}', u2)::jsonb, 'email', u2::text, now(), now(), now()),
    (u3, u3, format('{"sub":"%s","email":"carla.diaz@csjs-seed.test"}', u3)::jsonb, 'email', u3::text, now(), now(), now()),
    (u4, u4, format('{"sub":"%s","email":"diego.cruz@csjs-seed.test"}', u4)::jsonb, 'email', u4::text, now(), now(), now()),
    (u5, u5, format('{"sub":"%s","email":"ella.ramos@csjs-seed.test"}', u5)::jsonb, 'email', u5::text, now(), now(), now());

  -- Ensure profiles exist with nice display names (trigger may already create them)
  insert into public.profiles (id, email, display_name, role)
  values
    (u1, 'ana.reyes@csjs-seed.test', 'Ana Reyes', 'student'),
    (u2, 'ben.santos@csjs-seed.test', 'Ben Santos', 'student'),
    (u3, 'carla.diaz@csjs-seed.test', 'Carla Diaz', 'student'),
    (u4, 'diego.cruz@csjs-seed.test', 'Diego Cruz', 'student'),
    (u5, 'ella.ramos@csjs-seed.test', 'Ella Ramos', 'student')
  on conflict (id) do update
    set display_name = excluded.display_name,
        email = excluded.email;

  -- ---------------------------------------------------------------------------
  -- 3) Quiz attempts (points = score * 5) — varied totals for ranking
  -- Expected leaderboard order (highest points first):
  --   1 Ana    ~ 145 pts (5+4+5+5+5+5)*5 wait let me calculate properly
  --   Ana: 5+5+4+5+5 = 24*5 = 120? I'll set explicit points below
  -- ---------------------------------------------------------------------------
  delete from public.quiz_attempts where user_id in (u1, u2, u3, u4, u5);

  -- Ana Reyes — top (120 points)
  insert into public.quiz_attempts (user_id, lesson_id, grade_id, subject_id, score, total, points, completed_at) values
    (u1, 'integers-and-basic-operations', '7', 'math', 5, 5, 25, now() - interval '5 days'),
    (u1, 'algebraic-expressions', '7', 'math', 5, 5, 25, now() - interval '4 days'),
    (u1, 'fractions-and-decimals', '7', 'math', 4, 5, 20, now() - interval '3 days'),
    (u1, 'ratios-and-proportions', '7', 'math', 5, 5, 25, now() - interval '2 days'),
    (u1, 'percent-and-discount-problems', '7', 'math', 5, 5, 25, now() - interval '1 day');

  -- Ben Santos — 2nd (95 points)
  insert into public.quiz_attempts (user_id, lesson_id, grade_id, subject_id, score, total, points, completed_at) values
    (u2, 'integers-and-basic-operations', '7', 'math', 4, 5, 20, now() - interval '6 days'),
    (u2, 'algebraic-expressions', '7', 'math', 5, 5, 25, now() - interval '5 days'),
    (u2, 'fractions-and-decimals', '7', 'math', 5, 5, 25, now() - interval '4 days'),
    (u2, 'basic-geometry-and-angles', '7', 'math', 5, 5, 25, now() - interval '2 days');

  -- Carla Diaz — 3rd (70 points)
  insert into public.quiz_attempts (user_id, lesson_id, grade_id, subject_id, score, total, points, completed_at) values
    (u3, 'integers-and-basic-operations', '7', 'math', 3, 5, 15, now() - interval '7 days'),
    (u3, 'fractions-and-decimals', '7', 'math', 4, 5, 20, now() - interval '3 days'),
    (u3, 'ratios-and-proportions', '7', 'math', 5, 5, 25, now() - interval '1 day'),
    (u3, 'algebraic-expressions', '7', 'math', 2, 5, 10, now() - interval '8 days');

  -- Diego Cruz — 4th (45 points)
  insert into public.quiz_attempts (user_id, lesson_id, grade_id, subject_id, score, total, points, completed_at) values
    (u4, 'integers-and-basic-operations', '7', 'math', 4, 5, 20, now() - interval '2 days'),
    (u4, 'fractions-and-decimals', '7', 'math', 5, 5, 25, now() - interval '1 day');

  -- Ella Ramos — 5th (25 points)
  insert into public.quiz_attempts (user_id, lesson_id, grade_id, subject_id, score, total, points, completed_at) values
    (u5, 'integers-and-basic-operations', '7', 'math', 5, 5, 25, now() - interval '1 day');

end $$;

-- ---------------------------------------------------------------------------
-- Preview expected ranking
-- ---------------------------------------------------------------------------
select
  p.display_name,
  p.email,
  count(q.id) as quizzes,
  coalesce(sum(q.points), 0) as total_points
from public.profiles p
join public.quiz_attempts q on q.user_id = p.id
where p.email like '%@csjs-seed.test'
group by p.id, p.display_name, p.email
order by total_points desc;
