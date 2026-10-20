-- Actual constraints on the bridge, in the same throwaway database as the suite.
begin;
do $$
declare u uuid := gen_random_uuid(); o uuid := gen_random_uuid();
  p uuid := gen_random_uuid(); p2 uuid := gen_random_uuid();
  d uuid := gen_random_uuid(); a uuid := gen_random_uuid(); f uuid;
begin
  insert into auth.users(id) values(u);
  insert into public.organizations(id,name) values(o,'Bridge test');
  insert into public.properties(id,organization_id,name,created_by) values(p,o,'First',u),(p2,o,'Second',u);
  insert into public.project_documents(id,organization_id,property_id,storage_path,original_filename,byte_size,created_by)
    values(d,o,p,'bridge/original.pdf','original.pdf',4,u);
  insert into public.analysis_runs(id,organization_id,property_id,title) values(a,o,p,'Check saved plan');
  insert into public.analysis_files(analysis_id,organization_id,ordinal,kind,file_name,media_type,byte_size,storage_path,source_document_id,upload_state)
    values(a,o,1,'pdf','original.pdf','application/pdf',4,'bridge/original.pdf',d,'stored') returning id into f;
  begin
    update public.analysis_runs set property_id=p2 where id=a;
    raise exception 'TEST FAILED: analysis moved project';
  exception when raise_exception then
    if sqlerrm <> 'the project of an analysis cannot change' then raise; end if;
  end;
  begin
    update public.analysis_files set storage_path='another.pdf' where id=f;
    raise exception 'TEST FAILED: original path replaced';
  exception when raise_exception then
    if sqlerrm <> 'the linked original must match the stored document' then raise; end if;
  end;
  begin
    insert into public.analysis_files(analysis_id,organization_id,ordinal,kind,file_name,media_type,byte_size,storage_path,source_document_id)
      values(a,o,2,'pdf','copy.pdf','application/pdf',4,'bridge/original.pdf',d);
    raise exception 'TEST FAILED: original linked twice';
  exception when unique_violation then null;
  end;
  if (select storage_path from public.project_documents where id=d) <> 'bridge/original.pdf' then
    raise exception 'TEST FAILED: original changed';
  end if;
end;
$$;
rollback;
\echo 'ALL OK — saved original bridge, fixed project, immutable locator, duplicate link refused'
