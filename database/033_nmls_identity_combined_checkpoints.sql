-- Allows the combined checkpoint names BSI described on 2026-11-20: a student who returns
-- at a point where a Middle or FinalExam check is also due makes one stop, sent as
-- "Resuming-Middle#1", "Resuming-Middle#2" or "Resuming-FinalExam".
--
-- NOT APPLIED TO PRODUCTION BY THIS COMMIT. Needs the owner's approval, after 031.
begin;
alter table nmls_identity_challenges drop constraint if exists nmls_identity_challenges_d3_check;
alter table nmls_identity_challenges add constraint nmls_identity_challenges_d3_check
 check (d3 in ('Begin','Middle#1','Middle#2','FinalExam','Resuming','Resuming-Middle#1','Resuming-Middle#2','Resuming-FinalExam'));
commit;
