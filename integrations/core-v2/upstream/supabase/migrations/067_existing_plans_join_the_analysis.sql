-- An analysis belongs to the project the owner opened. Existing originals
-- are referenced, never uploaded again or replaced by their V1 split copies.
alter table public.analysis_runs
  add column if not exists property_id uuid references public.properties(id) on delete restrict;
alter table public.analysis_files
  add column if not exists source_document_id uuid references public.project_documents(id) on delete restrict;
create index if not exists analysis_runs_by_property on public.analysis_runs(property_id, created_at desc);
create unique index if not exists analysis_original_once
  on public.analysis_files(analysis_id, source_document_id) where source_document_id is not null;

create or replace function public.analysis_project_matches()
returns trigger language plpgsql security definer set search_path = public as $$
declare p uuid; o uuid; d public.project_documents%rowtype;
begin
  if tg_table_name = 'analysis_runs' then
    if tg_op = 'UPDATE' and new.property_id is distinct from old.property_id then
      raise exception 'the project of an analysis cannot change';
    end if;
    if new.property_id is not null and not exists (
      select 1 from public.properties where id = new.property_id and organization_id = new.organization_id
    ) then raise exception 'the analysis project is in another workspace'; end if;
  else
    select property_id, organization_id into p, o from public.analysis_runs where id = new.analysis_id;
    if o is distinct from new.organization_id then raise exception 'the file is in another workspace'; end if;
    if tg_op = 'UPDATE' and new.source_document_id is distinct from old.source_document_id then
      raise exception 'the original document cannot change';
    end if;
    if new.source_document_id is not null then
      select * into d from public.project_documents where id = new.source_document_id;
      if not found or d.property_id is distinct from p or d.organization_id is distinct from o then
        raise exception 'the original is not in this analysis project';
      end if;
      if new.kind <> 'pdf' or new.storage_path is distinct from d.storage_path
         or new.byte_size is distinct from d.byte_size then
        raise exception 'the linked original must match the stored document';
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger analysis_project_matches before insert or update on public.analysis_runs
  for each row execute function public.analysis_project_matches();
create trigger analysis_original_matches before insert or update on public.analysis_files
  for each row execute function public.analysis_project_matches();
