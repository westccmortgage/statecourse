# MEASURED DECISION V2 — UNIFIED PRODUCTION READINESS

Срез: 2026-09-29, 07:29 UTC. Один исполнитель; production-код и конфигурация, изолированные синтетические проверки, безопасные чтения production. Реальный автономный режим не включён. Документ дополняет [исходную инвентаризацию](unified-v2-discovery-2026-09-29.md), а не заменяет фактическое состояние декларацией готовности. Публикация самого отчёта меняет только документацию, не runtime.

## 1. SHARED CORE STATUS

**PARTIAL.** Общий Core, durable WorkOrder, evidence, authority, execution, recovery и проверяемое completion связаны и проверены на ограниченных сценариях. CEO Admin и исходная Studio используют опубликованные мосты. Мост MARKEVITA реализован и проверен локально, но ещё не активирован на её production-хосте. Универсальное выполнение произвольного человеческого поручения всеми фабриками не доказано и не объявляется готовым.

Core не пересоздавался. Использованы существующие Scheduler, DomainPacks, SQL repository, бюджетный ledger, Runtime Governor, migrations 069–073 и Completion Loop. WorkOrder связывает их с продуктами; отдельного ядра MARKEVITA или ChatGPT нет.

## 2. SYSTEM STATUS

| Система | Статус | Практическая оценка |
| --- | --- | --- |
| Measured Decision Studio | PARTIAL | Существующий анализ документов связан с WorkOrder и проверяемой доставкой. Синтетический source/evidence/verification путь прошёл. Browser upload и качество реальных моделей в этом задании не проверялись. |
| MARKEVITA | BLOCKED | Готов ограниченный мост к общему Core для существующего master, локального ремонта и QA. Production остаётся на прежнем commit до доступа к Render и проверки активных заданий. Полное покрытие фабрик отсутствует. |
| CEO Admin | PARTIAL | Связка с Core опубликована: аудит, предложения, authority, атомарная синхронизация, независимое чтение результатов и receipt завершения. Сценарий task + Waiting For доказан синтетически. Свободное поручение ещё не равно автоматическому исполнению произвольной цели. |

**Проверенное размещение**

| Поверхность | Репозиторий / production | Состояние |
| --- | --- | --- |
| Shared Core / Studio | `westccmortgage/measured-decision-ai`, `measureddecision.ai`; Supabase `hbqlhplgqwuesrovbiye` | Runtime commit `44ea8eb217deee281d46d6f28bdbdc41ee580790`; [deploy 36534816016](https://github.com/westccmortgage/measured-decision-ai/actions/runs/36534816016) success. Netlify `6abb63bcdcc6800008285783`, ready на том же commit. Миграции до 075. |
| CEO Admin | `westccmortgage/anatoliykanevsky`, `anatoliykanevsky.com`; Supabase `visfvdtmvycpyggkxjlp` | Runtime commit `a14ca07154b52574e53c4fac3d6f9bde5704c935`, Netlify `6abb64448a43870008bb83bf`, ready. Последующий commit тестов `269f84b54b1b150c18de2878740c75edab4f340c` опубликован как Netlify `6abb65aabdf6100008944757`, ready 07:16:08 UTC. Последняя DB migration `20260929070752 core_v2_delivery_readback`. |
| MARKEVITA | `westccmortgage/markevita`, `markevita.onrender.com` | Реальная production-ветка `claude/series-studio`, commit `a34d577891a401af9e926c49e496a5c23c45566c`; это не `main`. Health сообщает Supabase и включённую возможность платных вызовов; в этом задании она не использовалась. Точный DB project/миграции через доступные подключения не установлены. |

Живые Edge Functions: `core-v2-analysis` v39, `core-v2-runner` v36, `core-v2-runner-tick` v38, `core-v2-ceo-admin` v34, `core-v2-canary` v16, `core-v2-factory` v5. Неподписанный запрос к factory door получает HTTP 401. Factory door опубликован без предоставления новой исполнительной или финансовой authority.

**Матрица готовности.** PASS означает доказанный ограниченный контракт строки в существующем доменном пути. Это не сертификат качества любых пользовательских задач. PARTIAL означает конкретное ограничение покрытия или production-доказательства; BLOCKED — недоступную живую связь.

| Capability | Measured Decision Studio | MARKEVITA | CEO Admin | Shared Core |
| --- | --- | --- | --- | --- |
| Intent intake | PASS | BLOCKED | PASS | PASS |
| Context expansion | PARTIAL | PARTIAL | PARTIAL | PASS |
| Planning | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Evidence | PASS | PARTIAL | PASS | PASS |
| Decision | PASS | PARTIAL | PASS | PASS |
| Authority | PASS | PARTIAL | PASS | PASS |
| Action planning | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Execution | PASS | PARTIAL | PARTIAL | PASS |
| Verification | PASS | PARTIAL | PASS | PASS |
| Recovery | PASS | PARTIAL | PASS | PASS |
| Human review | PASS | PARTIAL | PASS | PASS |
| Memory | PASS | PARTIAL | PASS | PASS |
| Cost | PASS | PARTIAL | PASS | PASS |
| Idempotency | PASS | PARTIAL | PASS | PASS |
| Result sync | PASS | BLOCKED | PASS | PASS |
| ChatGPT bridge | NOT APPLICABLE | NOT APPLICABLE | PARTIAL | PASS |
| Realtime/event trigger | PASS | PARTIAL | PARTIAL | PASS |
| Final delivery | PASS | BLOCKED | PARTIAL | PASS |

У Admin и Studio PASS в отдельных строках относится к поддерживаемым аудитам/анализам. Он не распространяется автоматически на новый custom WorkOrder, непроверенный browser flow или внешние Google-эффекты. Cost PASS означает сохранение ограничений и честный учёт unknown, а не то, что исторический unknown был разрешён.

## 3. BRIDGES IMPLEMENTED

1. **Core → Admin atomic result sync.** Полный снимок одной ревизии, compare-and-set, idempotency key, supersession, история снимков и commit-or-nothing. Полный уникальный индекс `decision_runs_core_subject` подтверждён в production; прежний `42P10` воспроизведён и устранён. [Engine #240](https://github.com/westccmortgage/measured-decision-ai/pull/240), [Admin #37](https://github.com/westccmortgage/anatoliykanevsky/pull/37).
2. **Общий WorkOrder и MCP intake.** Сохраняются цель, surface/user/org, context, критерии, authority, budget, references, состояние и события. Повторный ключ возвращает ту же работу; изменённый запрос с тем же ключом отвергается. Создание даёт только PROPOSE/$0. [Engine #241](https://github.com/westccmortgage/measured-decision-ai/pull/241), [Admin #38](https://github.com/westccmortgage/anatoliykanevsky/pull/38).
3. **Selective context.** Запросы с типом, identifier, revision, reason и scope; чтение выбранных task, Waiting For, project, calendar, prior decision и Gmail thread. Thread ограничен 50 сообщениями/90 тысячами символов; чужие и неподходящие объекты отвергаются. Полная автоматическая добыча всех типов attachments/истории пока не реализована.
4. **Evidence → internal action proposals.** Неизменяемые source fields/version/hash; подтверждённые commitments, явное outbound waiting и priority связываются с существующими исполнителями и проектами. Нет вывода Waiting For только по отправителю. Текущий email adapter сам не заполняет весь typed waiting-контекст. [Engine #242](https://github.com/westccmortgage/measured-decision-ai/pull/242), [Admin #39](https://github.com/westccmortgage/anatoliykanevsky/pull/39).
5. **Independent executor readback.** Существующие 14 типов действий проверяют фактическое состояние; стабильные ID для task/Waiting For, неизвестный результат при потере ответа, reconciliation без слепого повтора. Authority/token gate сохраняется.
6. **Technical failure → recovery.** Ошибка независимости чтений не превращается в бизнес-решение владельца. Настоящие disagreements продолжают использовать owner-bound adjudication. Изменения [#236](https://github.com/westccmortgage/measured-decision-ai/pull/236) уже merged: owner boundary, hold запрета новых leases, idempotent adjudication, guarded resume и сохранение settlement-пути ранее отправленных attempts.
7. **MARKEVITA → shared factory recovery.** Отдельная HMAC-связь, tenant/membership boundary, existing-assets-only dispatch, durable incident/fence, assembly/QA и измеренное completion. [Engine #243](https://github.com/westccmortgage/measured-decision-ai/pull/243) опубликован; [MARKEVITA #8](https://github.com/westccmortgage/markevita/pull/8), head `f4d3cddfac175d6c38c761c10ed6fe62f90a91fb`, ожидает production-доступа. Новый Instant `done` требует общего WorkOrder COMPLETED и сохраняет digest; прежняя история не объявляется задним числом проверенной.
8. **Studio → verified source deliverable.** Повторное чтение сохранённого результата, source hash/page/anchor checks, отсутствие unresolved/unknown/open reservations и привязанный digest; custom criteria не получают ложного completion. [Engine #244](https://github.com/westccmortgage/measured-decision-ai/pull/244).
9. **Outcome memory → existing router.** До 200 последних попыток за 30 дней внутри того же tenant/domain/model/role version; минимум три сопоставимых измеренных исхода. Независимое качество влияет на выбор среди уже разрешённых моделей; HTTP success не считается качеством. Стоимость и latency записываются, но пока не участвуют в многофакторной оптимизации. Миграция 075.
10. **Admin → delivery receipt → Core completion.** Отдельная server-only SQL-проверка перечитывает текущие audit/evidence/proposals. Подписанный receipt сверяется с актуальной ревизией Core. Завершает стандартную задачу подготовки аудита, не задачу исполнения предложений. Потерянное подтверждение можно повторить без действий. [Engine #245](https://github.com/westccmortgage/measured-decision-ai/pull/245), [Admin #42](https://github.com/westccmortgage/anatoliykanevsky/pull/42).
11. **Current migration runbook → CI.** Весь актуальный набор Admin migrations, atomic probe, повреждённый evidence, permissions, rollback/reapply delivery verifier проверяются на PostgreSQL 16.15 через `npm run verify:migrations`. [Admin #43](https://github.com/westccmortgage/anatoliykanevsky/pull/43).

## 4. ACCEPTANCE TESTS

| Тест | Результат | Доказательство и предел |
| --- | --- | --- |
| A — CEO Admin | PASS, synthetic | Реальный Core planner/repository + две PostgreSQL PGlite DB, scripted independent readers, SQL authority/token, существующие task/Waiting For executors и отдельное чтение. Ровно 2 действия в правильном project, restart, потерянный ответ, без дублей. [Подробности](unified-bridge-proof-2026-09-29.md). |
| B — Original Studio | PASS, synthetic | Подготовленные non-sensitive PDF/PNG/text, настоящий SourceDocumentsPack/material resolver, два независимых scripted reader, critic, evidence, persisted result, restart и shared completion. Digest `2c856eb7dd423c246b5450d6135e7de702dd287a99655d319fa8d976be5b9a26`. Browser upload/preparation не доказан. [Подробности](studio-delivery-and-outcome-memory-2026-09-29.md). |
| C — MARKEVITA | PASS локально, live BLOCKED | Настоящие ffmpeg-файлы; удалённый master при сохранённом assembly checkpoint; Core выбирает bounded repair, новая QA привязана к hash, scene bytes/предыдущий ledger не изменены, после restart completion читается из SQL. 0 новых provider calls/$0. [Подробности](shared-factory-recovery-proof-2026-09-29.md). |
| Live ChatGPT/MCP intake | PASS | WorkOrder `0d9f890f-2bb5-5e73-afbd-ff1514242f9b`: два одинаковых запроса → один ID/revision 1; отдельный `get_today` читает REQUESTED/PROPOSE/$0. Это intake, не live end-to-end completion. |
| Admin regression + native migrations | PASS | [CI 36535445846](https://github.com/westccmortgage/anatoliykanevsky/actions/runs/36535445846): 282 tests, lint/typecheck/build; PostgreSQL 16.15, `ALL MIGRATION CHECKS PASS`. |
| Core regression | PASS | [CI 36534407614](https://github.com/westccmortgage/measured-decision-ai/actions/runs/36534407614) и предыдущий [36533607510](https://github.com/westccmortgage/measured-decision-ai/actions/runs/36533607510): schema/invariants, owner/human hold/resume, recovery, source completion, routing, signatures и Edge typecheck. |
| MARKEVITA regression | PASS | Финальный head `f4d3cdd…`: **795 passed, 1 skipped, 10 warnings**, production startup PASS; [CI 36535201594](https://github.com/westccmortgage/markevita/actions/runs/36535201594), 990.78 s. Cross-repository proof, пропущенный обычным CI из-за отсутствия соседних репозиториев, отдельно прошёл локально за 14.04 s. Instant gate targeted suite: 32 passed. |

HMAC fixed vector закреплён для CEO Admin и factory transport. Migration 071 проверена безопасным forward repair с сохранением incident evidence; разрушительный rollback 071 не выполнялся и не заявляется. Реальные model/provider/Google действия не подменяются этими доказательствами.

## 5. CROSS-SYSTEM FLOW

Доказанный изолированный путь:

`Synthetic Admin intent → общий WorkOrder → Core DomainPack/plan → два independent scripted readers → evidence/decision → atomic Admin projection → SQL readback receipt → audit COMPLETED → persisted synthetic owner approval → одноразовый token → существующие task + Waiting For executors → независимое чтение обеих записей → execution WorkOrder COMPLETED → повторное чтение того же результата`.

WorkOrder `536996fd-7c6f-5da6-8ef4-921ffc6b5192`, workflow `9b8c9493-9f0f-5229-95d0-ac91442ae6ba`, digest `cf0d0a638fa854069c240ea082ed534360d195ec058f9b186a3fa07f3013a075` принадлежат throwaway DB. Финальный verifier custom execution-сценария — доверенный адаптер теста. Это не доказательство, что произвольное live-поручение автоматически получает такой план/verifier. Live MCP отдельно подтвердил тот же контракт хранения и чтения.

## 6. EXECUTION / AUTHORITY

Сейчас новые WorkOrders автоматически получают **PROPOSE, $0**. Разрешены чтение в пределах текущего доступа, подготовка плана/предложений и проверка уже существующего результата. Сама классификация действия как обратимого не выдаёт права выполнить его.

| Действия | Реальная граница |
| --- | --- |
| Classify email в Admin, create task, create Waiting For, set priority, close Waiting For | EXECUTE_REVERSIBLE по типу; существующее сохранённое approval и одноразовый token обязательны. Синтетические approval были только в изолированной DB. |
| Gmail read/unread/archive | Существующий Google scope и индивидуальное approval; в этом задании не выполнялись. |
| Send email, trash, delete event, изменения с attendees | Consequential; индивидуальное approval, для high-risk отдельное подтверждение, нужный OAuth scope. Никаких таких эффектов не было. |
| Calendar create/update/cancel | Существующие authority/scope/organizer checks и independent readback; live-проверка отложена. |
| Локальные MARKEVITA assembly/QA/rebuild | Только существующие assets, разрешённая Core recovery operation, lease/fence и ограничение попыток. Production activation ещё закрыта. |
| Paid generation, новые расходы, publication, новые OAuth права | Не разрешены этим заданием. Нужна конкретная существующая или новая owner authority. |

Draft creation, contacts и ручные product controls уже существуют, но это не означает, что Core умеет сам строить все соответствующие планы из свободного текста. Прямые безопасные MCP-команды сохраняют собственный путь; сложный запрос создаёт WorkOrder. Новый каталог MCP tools может потребовать обновления подключения клиента; работающий `[V2]` intake в `capture_items` уже проверен.

## 7. RECOVERY

Проверены потеря ответа после SQL commit task, повтор execution/token, stale revision, ошибка посередине result sync, повреждение сохранённого evidence, потеря completion acknowledgement, restart нового runner, missing master при старом checkpoint, устаревшая QA, повтор fenced recovery с изменившимися facts и unknown paid outcome.

Task восстанавливается независимым чтением без второго INSERT; неуспешная atomic sync сохраняет предыдущую полную ревизию; receipt повторяется без execution; master пересобирается из тех же assets и проходит свежую QA. Технические неисправности этих сценариев не требовали ложного человеческого бизнес-решения. Unknown provider outcome сохраняет reservation и запрещает повторную покупку.

Переходы restart между шагами и сохранённое состояние проверены; настоящий rolling deployment посередине внешнего платного или Google-действия намеренно не запускался. Полную resilience всей совокупности фабрик это не доказывает.

## 8. DATA / MEMORY

В общем Core сохраняются WorkOrder/events, workflow/task/attempt, source revisions, claims/anchors, decisions/disagreements, authority references, incidents/recovery fences, budget/cost, completion gates/digest и outcome memory. Ссылки включают tenant, surface, project, инициатора и immutable source identity.

В Admin остаются Gmail/Calendar projections, tasks, Waiting For, projects, contacts, drafts, approvals/tokens и атомарные audit snapshots. В MARKEVITA остаются canonical assets, выбранные takes, manifests, jobs, private checkpoints, provider ledger и media. Общая связь строится через WorkOrder/workflow/source/revision/digest; базы не объединялись.

Следующее выполнение может восстановить эти записи без памяти беседы. Это operational memory. Доказанное обучение routing пока ограничено сопоставимым качеством в существующих Core-доменах; нет доказательства универсального обучения всех фабрик по всем метрикам.

## 9. MONEY

| Показатель | Это задание | Исторический workflow `59f322b8…6070` |
| --- | --- | --- |
| New authorized provider spend | $0 | Ранее authorized $1.000000 |
| Reserved | $0 новых | $0.491520, 4 открытых reservation |
| Spent / settled | $0 | Учтённый settled $0.314398; полный фактический provider bill по unknown не установлен |
| Released | $0 изменений исторического ledger | Сумма исторически освобождённых максимумов reservation $1.781760; это повторно используемые лимиты, не расход и не возврат денег |
| Uncertain | $0 новых | 4 outcome_unknown, неопределённость $0.491520 сохраняется |
| Provider generation calls | **0** | Новых вызовов не делалось |

Synthetic media fixture использует фиктивный предыдущий ledger $4, неизменный до/после ремонта; это не реальный расход.

Исторический workflow строго **PARTIAL**: 185/185 units пройдены, но это не доказывает выполненные acceptance criteria или урегулированные unknown. Последнее изменение workflow осталось `2026-09-28 04:45:04.592901+00`. Резервы не освобождались и попытки не покупались повторно. `af4eb392…` не затрагивался. Эта финансовая история не использовалась как причина остановить инженерную подготовку.

## 10. REMAINING BLOCKERS

1. **MARKEVITA production access.** Нет доступа к Render configuration и authenticated active-job state. Нельзя безопасно перезапустить процесс с действующими платными jobs или подтвердить живую factory-связь. Нужны dedicated secret на обеих сторонах и привязка к уже разрешённому organization/submitter; новая owner authority не создавалась.
2. **Полное фабричное покрытие.** Новый мост покрывает technical master recovery. Course/Assessment Factory пока вызывает provider по собственному пути без общего WorkOrder/ledger на каждый вызов; Marketing entrance не равен готовому campaign pipeline. Это инженерные ограничения, не вопрос согласования владельцем. Они исключены из real-mode допуска.
3. **Произвольные поручения.** Intake/context contract реализован; автоматический planner, action mapping и trusted verifier существуют для поддерживаемых доменов, но не для любого текста. Custom WorkOrder честно остаётся незавершённым без доменного плана и доказательства.
4. **Контекст и triggers.** Нет полного покрытия произвольных attachments/истории и автоматического превращения каждого входящего события в безопасный завершённый WorkOrder. Waiting For требует явных typed facts. Новые MCP tools ещё не были вызваны через обновлённый каталог клиента.
5. **Отложенные реальные acceptance.** Нужны browser intake, real-model semantic quality, реальные разрешённые Google эффекты и creative/domain QA. Они не запускались по условиям этого задания. Synthetic technical PASS не заменяет профессиональную оценку видео, assessment или campaign.
6. **Исторический settlement.** По четырём unknown нет достаточного provider evidence. Их reservation сохраняется. Это ограничение исторического workflow, не блокировка новых безопасных инженерных работ.

## 11. OWNER ACTION

**Минимальное действие сейчас:** предоставить доступ к Render-сервису MARKEVITA в нужном аккаунте, позволяющий читать активные jobs и управлять deploy/config. Проверку jobs, подключение существующей authority, настройку dedicated transport, merge/deploy и проверку выполнит инженерный агент. Владельцу не требуется запускать SQL или собирать код.

Новых расходов или реальных внешних тестов сейчас не требуется. Позднее, перед выбранным реальным пилотом, владелец задаёт только конкретный разрешённый scope и, если нужен платный provider, бюджет. Это не blanket approval всей системы.

## 12. REAL-MODE RECOMMENDATION

**NOT READY FOR REAL MODE.** Реальную автономную работу трёх поверхностей не активировать.

Разрешённая сейчас область проверки: read-only observation, PROPOSE/$0 WorkOrders, синтетические источники и изолированные executor-тесты. В production нет нового разрешения на исполнение даже обратимых действий. После устранения указанных инженерных/доступных ограничений первый кандидат на controlled pilot — только внутренние task/Waiting For в выбранном тестовом project, по сохранённому owner approval, без provider spend, писем, Calendar mutations, публикации или удаления. Этот будущий pilot здесь не объявляется разрешённым.

Подготовка стала проверяемой: опубликованы конкретные мосты и воспроизводимые тесты. Заявление «V2 работает на 100%» текущие факты не поддерживают.
