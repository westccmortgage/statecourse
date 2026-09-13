-- Own private review grants only. Additive; does not authorize enrollment or CE.
begin;
create function public.nmls_review_list(p_student_id uuid)
returns jsonb language sql security definer set search_path = pg_catalog, public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'grantId', g.id, 'courseKey', g.course_key, 'contentDigest', g.content_digest,
    'expiresAt', g.expires_at, 'status', coalesce(a.runtime->>'status', 'not_started')
  ) order by g.created_at desc, g.id), '[]'::jsonb)
  from public.nmls_review_access_grants g
  left join public.nmls_review_attempts a on a.grant_id = g.id and a.student_id = p_student_id
  where g.student_id = p_student_id and g.status = 'active'
    and g.access_mode = 'non_credit_review' and g.expires_at > clock_timestamp();
$$;
revoke all on function public.nmls_review_list(uuid) from public, anon, authenticated;
grant execute on function public.nmls_review_list(uuid) to service_role;
commit;
