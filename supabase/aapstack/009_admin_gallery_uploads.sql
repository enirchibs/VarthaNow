-- Admins add images to the library from the admin Galleries (e.g. images made in ChatGPT).
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.
drop policy if exists "Admins add images" on image_library;
create policy "Admins add images" on image_library for insert to authenticated with check (is_admin());
grant insert on image_library to authenticated;
-- the review columns from 008 plus label/tags, so an admin can correct an uploaded image
grant update (label, title, tags, keywords_en, keywords_te, category, focus) on image_library to authenticated;
