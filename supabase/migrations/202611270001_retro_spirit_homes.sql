-- Add dedicated per-page spirit homes for Retro Internet Explorer tabs
-- Existing round-robin placement in spirit_guestbook balances 1 spirit per home automatically.
insert into spirit_private.homes (id, section) values
  ('retro-google', 'Retro Google'),
  ('retro-projects', 'Retro Projects'),
  ('retro-work', 'Retro Experience'),
  ('retro-contact', 'Retro Contact'),
  ('retro-orkut', 'Retro Orkut'),
  ('retro-github', 'Retro GitHub')
on conflict (id) do nothing;
