create extension if not exists "pgcrypto";

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'twitter', 'linkedin', 'tiktok', 'reddit', 'threads')),
  topic text not null,
  prompt text,
  caption text,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  external_post_id text,
  publish_error text,
  platform_account_id text,
  content_type text default 'single' check (content_type in ('single', 'carousel')),
  carousel_images jsonb default '[]'::jsonb,
  retries int default 0,
  priority int not null default 100,
  approval_required boolean not null default false,
  approval_status text default 'approved' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_at timestamptz
);

create table if not exists social_settings (
  id uuid primary key default gen_random_uuid(),
  brand_voice text not null default 'Professional, empowering, modern',
  target_audience text not null default 'Job seekers and career switchers',
  post_frequency text not null default 'daily',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  result text not null,
  created_at timestamptz not null default now()
);

create table if not exists social_analytics (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  metric_date date not null default current_date,
  impressions int default 0,
  clicks int default 0,
  likes int default 0,
  comments int default 0,
  shares int default 0,
  created_at timestamptz not null default now()
);

create table if not exists admin_team (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists post_approvals (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social_posts(id) on delete cascade,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  requested_by text,
  reviewed_by text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists embed_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  label text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_social_posts_status on social_posts(status);
create index if not exists idx_social_posts_scheduled_time on social_posts(scheduled_time);
create index if not exists idx_social_logs_created_at on social_logs(created_at desc);
create index if not exists idx_social_analytics_platform_date on social_analytics(platform, metric_date desc);
create index if not exists idx_social_posts_priority on social_posts(priority asc, scheduled_time asc);
create index if not exists idx_social_posts_approval on social_posts(approval_status, approval_required);
create index if not exists idx_admin_team_ema;

create table if not exists social_activity_log (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  action text not null,
  username text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_created_at on social_activity_log(created_at desc);
create index if not exists idx_activity_log_platform on social_activity_log(platform);