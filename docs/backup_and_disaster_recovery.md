# KursantAI / DriveAdmin

## Архитектура за backups и disaster recovery с Hetzner

## 1. Цел на документа

Този документ описва най-добрия practically-safe backup и disaster recovery модел за продукта KursantAI / DriveAdmin, ако основната production инфраструктура е върху Hetzner.

Фокусът е:

- да не се губят документи;
- да не се губят критични записи от PostgreSQL;
- да има възстановяване при човешка грешка, ransomware, дефектна миграция, изтриване, компрометиране на сървър или инфраструктурен инцидент;
- да има реален restore процес, а не само “имаме backup”.

## 2. Честна архитектурна позиция

Абсолютна гаранция за “нулева загуба” не може да се даде от нито една нормална SaaS архитектура.

Може обаче да се изгради модел, който практически свежда риска до минимум чрез:

- няколко независими копия;
- различни storage слоеве;
- immutable защита;
- offsite копие;
- point-in-time recovery за базата;
- доказуем restore процес.

За този продукт правилната цел е:

- `документи`: практически zero-loss архитектура;
- `база данни`: много нисък RPO чрез WAL archiving и PITR;
- `цялата система`: бързо и повторяемо възстановяване.

## 3. Архитектурен извод

Най-добрият вариант с Hetzner не е “всичко да е само един backup в Hetzner”.

Най-добрият вариант е:

- Hetzner като primary hosting платформа;
- Hetzner Object Storage като primary document storage;
- PostgreSQL backup architecture, независима от server snapshots;
- immutable backup слой;
- второ offsite копие извън основната production trust boundary;
- регулярни restore тестове.

Това на практика е модел, близък до `3-2-1-1-0`:

- `3` копия на критичните данни;
- `2` различни storage слоя;
- `1` offsite copy;
- `1` immutable copy;
- `0` непроверени backup-и, защото restore-ът се тества.

## 4. Какво не трябва да правим

Не трябва да разчитаме само на:

- Hetzner Cloud server backups;
- server snapshots;
- backups на root disk;
- един bucket без versioning;
- един provider без offsite copy;
- backup-и без restore drills.

Причините са:

- Hetzner Cloud backups са полезни, но са disk-level и не са достатъчни за чувствителна PostgreSQL база;
- snapshots и backups на server disk не включват attached volumes;
- Hetzner препоръчва изключване на сървъра за по-добра consistency, което не е добър основен механизъм за production PostgreSQL;
- documents и database имат различни recovery нужди;
- single-provider backup все още оставя provider-wide и credential-compromise risk.

## 5. Препоръчана backup архитектура

### 5.1 Слой 1: Production данни

- `PostgreSQL primary database`
- `Hetzner Object Storage` за документи
- `Application servers`
- `Redis`

### 5.2 Слой 2: Primary backup layer в Hetzner

- отделен backup bucket за PostgreSQL backups и WAL archive;
- versioned и object-lock-enabled buckets за документи;
- daily server backups само като допълнителен recovery layer;
- периодични machine snapshots преди рискови infrastructure промени.

### 5.3 Слой 3: Offsite backup layer

Най-добрият вариант е offsite копие извън primary blast radius.

Препоръка:

- втори storage target в отделен account/project;
- по възможност втори provider за най-критичните backup-и;
- отделни credentials;
- immutable или append-only политика за offsite backup copy.

### 5.4 Локално emergency копие на админ лаптоп

Като допълнителна защита може да се поддържа и автоматичен локален backup на админ лаптоп.

Това е полезно:

- при временен проблем с Hetzner;
- при нужда от бърз достъп до последен архив;
- като допълнителен business continuity слой.

Но този слой не трябва да се счита за основен backup механизъм.

Правилната му роля е:

- `last-resort emergency copy`
- `human-controlled recovery copy`
- `extra fallback layer`

## 6. Архитектура за PostgreSQL backups

## 6.1 Основен принцип

За PostgreSQL не трябва да разчитаме на VM backups като основен restore механизъм.

Правилният модел е:

- `base backups`
- `continuous WAL archiving`
- `point-in-time recovery`
- отделен restore workflow

Това е директно в духа на PostgreSQL документацията за continuous archiving и PITR.

## 6.2 Препоръчана технология

За production-ready PostgreSQL backup слой препоръката е:

- `pgBackRest`

Причини:

- поддържа full, differential и incremental backup стратегия;
- поддържа WAL archiving;
- поддържа retention правила;
- подходящ е за PITR и за по-сериозен operational модел.

## 6.3 Препоръчана схема

- `weekly full backup`
- `daily differential backup`
- `continuous WAL archiving`
- WAL upload към backup repository на кратки интервали

За по-висока защита може да се ползва и:

- `full backup` всяка нощ, ако размерът е разумен и operationally удобен

Но за повечето production среди по-балансираният вариант е:

- weekly full
- daily differential
- continuous WAL

## 6.4 RPO и RTO за базата

Препоръка:

- `RPO`: 5 до 15 минути
- `RTO`: 1 до 2 часа

Ако WAL archiving е настроен дисциплинирано, реалният RPO може да е и по-нисък.

## 6.5 Backup repository за PostgreSQL

PostgreSQL backup repository не трябва да е на същия disk path като production данните.

Препоръка:

- repository в отделен backup bucket;
- encryption at rest;
- отделни backup credentials;
- ограничени права само за backup service account;
- offsite sync към втори target.

## 6.6 Restore сценарии за базата

Системата трябва да поддържа поне:

- restore на цяла база от последен backup;
- point-in-time restore до конкретен timestamp;
- restore в изолирана staging среда за проверка;
- recovery след дефектна миграция;
- recovery след логическо изтриване на данни;
- recovery след компрометиран app server.

## 7. Архитектура за документи

## 7.1 Основен принцип

Документите са по-критични от app server-а.

Правилният модел е:

- production copy;
- immutable protection;
- offsite replica;
- checksum validation;
- restore на единичен документ и на масив от документи.

## 7.2 Primary storage модел

Документите трябва да се пазят в:

- `Hetzner Object Storage`

Задължително:

- `private buckets`
- `versioning enabled`
- `object lock enabled on bucket creation`
- signed access only
- checksum/hash metadata
- server-side validation на MIME type и размер
- malware scanning преди активиране за крайна употреба

## 7.3 Versioning и Object Lock

Versioning е задължителен.

Object Lock също трябва да бъде планиран от ден 1, защото Hetzner изисква той да е enabled при създаване на bucket-а и не може да бъде добавен по-късно към bucket, създаден без тази опция.

Препоръка:

- bucket за критични документи с включен `Object Lock`
- по подразбиране `Governance retention`
- `Legal Hold` за специални случаи

Причина:

- `Compliance mode` е много силен, но може да е твърде твърд за operational и legal нужди, ако по-късно се наложи управляемо изтриване;
- `Governance mode` дава много силна защита срещу случайно или злонамерено изтриване, но позволява строго контролиран bypass само с отделни права.

## 7.4 Два document buckets

Препоръка:

- `docs-primary`
- `docs-offsite-archive`

`docs-primary`:

- production read/write bucket;
- versioning;
- object lock enabled;
- по-кратка operational retention логика за noncurrent versions.

`docs-offsite-archive`:

- offsite target;
- versioning;
- object lock enabled;
- по-дълга retention политика;
- write path само за replication process;
- без нормален application delete access.

## 7.5 Кога upload се счита за успешен

Ако наистина искаме practically-zero-loss модел за документи, не е достатъчно файлът просто да е качен в един bucket.

Най-силният модел е:

1. файлът се качва в временен ingestion/staging bucket;
2. изчислява се checksum;
3. прави се antivirus и format validation;
4. файлът се записва в `docs-primary`;
5. прави се второ записване или потвърдена репликация към `docs-offsite-archive`;
6. чак след това документът се маркира като `active` в приложението.

Това е по-бавно от прост upload, но е архитектурно най-сигурният вариант за критични документи.

## 7.6 Ако latency е проблем

Ако двоен write path при upload е operationally твърде тежък, може да се използва компромисен модел:

- synchronous write към `docs-primary`;
- много бърза async replication към `docs-offsite-archive`;
- документът е `pending_protection`, докато offsite копието не се потвърди;
- системата алармира, ако replication SLA бъде нарушен.

Това е по-практично, но е малко по-слабо от strict dual-write acknowledgement.

## 7.7 Препоръка за този продукт

За ID карти, шофьорски книжки, подписи и критични административни документи препоръката е:

- strict protection path;
- документът да не се счита за напълно защитен, преди да има:
- primary copy;
- checksum;
- metadata запис;
- offsite protected copy.

## 8. Hetzner server backups и snapshots

## 8.1 Каква е ролята им

Hetzner Cloud backups и snapshots са полезни, но само като допълнителен infrastructure recovery слой.

Те са добри за:

- бързо възстановяване на app server;
- rollback на machine image;
- recovery на конфигурация;
- дублиране на server setup.

Те не са достатъчни като основна data protection стратегия за:

- PostgreSQL;
- документи;
- compliance-sensitive архив.

## 8.2 Как да ги използваме правилно

Препоръка:

- `daily server backups` за app и worker инстанции;
- snapshot преди рискови OS / infra промени;
- да не се използват като основен database restore механизъм;
- да не се смята, че пазят attached volumes.

## 9. Offsite стратегия

## 9.1 Най-добрият вариант

Най-добрият вариант не е просто “друг bucket в същия account”.

Най-добрият вариант е:

- отделен backup trust boundary;
- отделни credentials;
- отделен project или account;
- по възможност отделен provider за най-критичните архиви.

## 9.2 Защо не само един provider

Ако всичко живее само в една инфраструктурна среда, остават рискове като:

- account compromise;
- операторска грешка;
- misconfigured lifecycle policy;
- provider-wide operational incident;
- грешен automation script, който трие на всички места.

## 9.3 Препоръка

Практичен best-of-both-worlds модел:

- primary hosting и primary object storage в Hetzner;
- offsite immutable backup copy в отделен target;
- минимум втори account/project;
- идеално втори provider за backup archive на най-критичните данни.

## 9.4 Daily local backup на админ лаптоп

Ако искаш локално копие на лаптопа на администратора всеки ден в `18:00`, това е добра допълнителна защита.

Препоръчана структура:

- `D:\DriveAdmin-Backups\2026-03-25\`
- `D:\DriveAdmin-Backups\2026-03-26\`
- `D:\DriveAdmin-Backups\2026-03-27\`

Тоест всеки ден се създава нова папка по дата.

Най-добре е вътре да има:

- `database-backup.enc`
- `documents-archive.enc` или `documents-manifest.json`
- `checksums.txt`
- `backup-report.json`

Препоръчаният поток е:

1. в `18:00` стартира автоматичен backup job;
2. създава се нова папка с текущата дата;
3. прави се encrypted database backup;
4. прави се encrypted export или защитен архив на критичните документи;
5. записват се checksum и report файл;
6. backup-ът се валидира;
7. при проблем се изпраща alert.

## 9.5 Какво е правилно да се пази на лаптопа

Добър вариант е да се пазят:

- encrypted PostgreSQL dump или backup package;
- encrypted архив на най-критичните документи;
- manifest на документите;
- кратък restore note;
- дневен backup report.

Не е добра идея да се пазят:

- незашифровани лични документи;
- суров production database directory;
- единственото копие на backup-а;
- credentials в plain text вътре в backup папката.

## 9.6 Security правила за локалния backup

Ако ще има такива backup-и на лаптоп, задължително:

- `BitLocker` или друга full-disk encryption защита;
- силна парола и автоматичен screen lock;
- ограничен локален достъп до backup папката;
- encrypted backup файлове;
- MFA за акаунтите, които управляват backup job-а;
- отделни credentials за backup процеса;
- retention политика, за да не се препълни дискът.

## 9.7 Важно ограничение

Локалният backup на лаптопа не трябва да бъде единственият offsite слой.

Причините са:

- лаптопът може да се повреди;
- лаптопът може да бъде откраднат;
- ransomware на крайно устройство е реален риск;
- човек може случайно да изтрие локалните папки.

Затова правилният модел е:

- `Hetzner primary`
- `offsite immutable backup`
- `local admin laptop emergency copy`

## 10. Retention политика

## 10.1 PostgreSQL

Препоръка:

- daily differential backups за 30 дни;
- weekly full backups за 8 до 12 седмици;
- monthly backups за 12 месеца;
- WAL retention според PITR целите и backup window-а;
- отделни правила за legal/compliance exports ако се изисква.

## 10.2 Документи

Препоръка:

- current version се пази активно;
- noncurrent versions се пазят според lifecycle политика;
- critical buckets имат Object Lock retention;
- legal-hold capability за особено чувствителни случаи;
- delete операции са soft-delete на application ниво, не директно физическо триене.

## 10.3 Audit и exports

Препоръка:

- audit exports и security exports да имат отделна retention политика;
- критичните одитни следи да имат по-дълъг живот от ежедневните operational backups.

## 11. Backup security controls

Задължително:

- backup credentials да са отделни от application credentials;
- least-privilege service accounts;
- MFA за администраторски действия;
- encryption in transit;
- encryption at rest;
- ограничен достъп до restore операции;
- audit log за backup, delete, retention change и restore действия;
- защитен процес за промяна на lifecycle и object lock политики.

Особено важно:

- application runtime не трябва да има права да чисти offsite immutable архива;
- bypass на governance retention трябва да е силно ограничен;
- restore процесът не трябва да презаписва production без отделна explicit процедура;
- локалният laptop backup трябва да е encrypted и да не съдържа незашифровани масиви от чувствителни документи.

## 12. Monitoring и alerting

Системата трябва да алармира при:

- провален PostgreSQL backup;
- прекъснат WAL archiving;
- replication lag към offsite archive;
- checksum mismatch;
- failed document replication;
- failed local 18:00 backup job;
- липсваща дневна local backup папка;
- object lock policy drift;
- необичайно много delete действия;
- restore failure;
- backup job, който не е стартирал навреме.

## 13. Restore playbooks

Backup архитектурата е непълна без restore playbooks.

Трябва да има документирани и тествани процедури за:

- restore на единичен документ;
- restore на изтрита document version;
- restore на student profile metadata;
- restore на база до конкретен момент;
- restore след дефектна миграция;
- пълно възстановяване на production в нова среда;
- security incident recovery.

## 14. Restore test cadence

Препоръка:

- `всяка седмица`: автоматична проверка, че backup jobs са успешни;
- `всеки месец`: restore на PostgreSQL в test environment;
- `всеки месец`: проверка на restore на избрани документи;
- `всяко тримесечие`: tabletop disaster recovery упражнение;
- `всяко полугодие`: пълен DR drill в отделна среда.

## 15. Конкретна препоръка за Hetzner

Най-добрият practically-safe вариант за този продукт е:

- `Hetzner Load Balancer + app servers`
- `PostgreSQL` на отделна инстанция;
- `Redis` на отделна инстанция;
- `Hetzner Object Storage` за production documents;
- `pgBackRest` за PostgreSQL base backups + WAL archive;
- отделен backup bucket за базата;
- `docs-primary` bucket с versioning + object lock;
- `docs-offsite-archive` bucket или външен offsite target;
- локален encrypted backup на админ лаптоп всеки ден в `18:00` в папка по дата;
- daily server backups само като допълнителен слой;
- monthly restore drill и редовни verification checks.

## 16. Окончателна архитектурна препоръка

Ако искаш “да не губим документи”, правилният модел не е просто daily backup.

Правилният модел е:

- Hetzner за production;
- PostgreSQL PITR architecture;
- object storage versioning;
- object lock от ден 1;
- offsite immutable copy;
- checksum и replication confirmation;
- restore playbooks;
- редовни тестове.

С други думи:

- `server backup` пази машини;
- `PITR` пази база;
- `versioning + object lock` пазят документи;
- `offsite copy` пази при голям инцидент;
- `local admin laptop copy` дава допълнителна аварийна защита при проблем с Hetzner;
- `restore drills` доказват, че системата наистина е recoverable.

Това е най-здравата и професионална backup архитектура за този продукт върху Hetzner.

## 17. Използвани източници

- Hetzner Cloud backups/snapshots overview: https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/
- Hetzner Cloud backups/snapshots FAQ: https://docs.hetzner.com/cloud/servers/backups-snapshots/faq/
- Hetzner Cloud volumes overview: https://docs.hetzner.com/cloud/volumes/overview/
- Hetzner Object Storage overview: https://docs.hetzner.com/storage/object-storage/overview/
- Hetzner Versioning: https://docs.hetzner.com/storage/object-storage/howto-protect-objects/protect-versioning
- Hetzner Buckets & Objects FAQ: https://docs.hetzner.com/storage/object-storage/faq/buckets-objects
- Hetzner Object Lock Retention: https://docs.hetzner.com/storage/object-storage/howto-protect-objects/protect-object-lock-retention
- Hetzner Object Lock Legal Hold: https://docs.hetzner.com/storage/object-storage/howto-protect-objects/protect-object-lock-legal-hold
- PostgreSQL PITR and continuous archiving: https://www.postgresql.org/docs/current/continuous-archiving.html
- pgBackRest command reference: https://pgbackrest.org/1/command.html
- Backblaze 3-2-1 backup strategy article: https://www.backblaze.com/blog/the-3-2-1-backup-strategy/
- Veeam 3-2-1-0 rule overview: https://www.veeam.com/blog/the-3-2-1-0-rule-to-high-availability.html
