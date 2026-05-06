/** Modules de cours Markdown (FR) — catégorie SQL (toutes les questions). */

export const SQL_COURSE_MODULES = {
  acid: `## Le concept

**ACID** regroupe quatre garanties — **Atomicité**, **Cohérence**, **Isolation**, **Durabilité** — qui définissent ce qu’on attend d’une **transaction** en base relationnelle : un lot d’opérations doit se comporter comme **une seule unité** visible par les autres sessions, sans états « à moitié validés » qui cassent les règles métier.

## Le mécanisme sous le capot

Le moteur combine **journaux (WAL / redo)**, **verrous** ou **MVCC** selon le SGBD, et l’application de **contraintes** (CHECK, FK, triggers) pour garantir chaque lettre. L’**atomicité** annule tout le bloc sur erreur explicitement ou sur violation ; l’**isolation** choisit ce qu’une transaction concurrente peut lire (**niveaux READ COMMITTED, REPEATABLE READ, SERIALIZABLE**…). La **durabilité** exige que le **COMMIT** ne réponde « OK » qu’après écriture persistante du journal.

\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- ROLLBACK; -- annule tout depuis BEGIN
\`\`\`

## Pourquoi c’est critique en production

Applications **paiement, stock, double écriture comptable** sans ACID = risques de **perte d’argent** ou d’**incohérences d’audit**. Sur la charge, les **transactions longues** augmentent **deadlocks**, **bloat MVCC** (PostgreSQL) ou **locks** ; instrumente **latence par statement**, **retry idempotent** côté app, et **timeouts** sur le pool de connexions.`,

  'pk-fk': `## Le concept

La **PRIMARY KEY** identifie **une et une seule ligne** dans sa table (souvent **surrogate id** numérique ou **UUID**). La **FOREIGN KEY** est une colonne enfant qui **référence** une clé **UNIQUE** du parent (souvent la PK) : le moteur **interdit** les valeurs orphelines tant que la contrainte est active.

## Mécanisme concret

Les **JOIN** exploitent massivement les paires PK–FK : le planificateur choisit **Nested Loop** (petit × indexé), **Hash Join** (gros volumes sans index trié), **Merge Join** (deux flux triés). Les **ON DELETE CASCADE / SET NULL** définissent le comportement en cascade. Les index sur la colonne FK côté enfant transforment souvent un **Seq Scan** en **Index Scan** sur les jointures fréquentes.

\`\`\`sql
CREATE TABLE customer (id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL);
CREATE TABLE "order" (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer(id) ON DELETE RESTRICT
);
CREATE INDEX idx_order_customer ON "order"(customer_id);
\`\`\`

## Impact production & sécurité

**Index manquant sur FK** = jointures lentes et charge CPU. **Suppression parent** mal anticipée = erreurs 23503 en prod. La FK n’est **pas** un contrôle d’autorisation : un attaquant peut toujours insérer des lignes valides ; la **sécurité** reste **RLS**, **auth app**, **validation serveur**.`,

  indexation: `## Le concept

Un **index** est une **structure auxiliaire** (souvent **B-tree**) qui maintient un ordre sur un sous-ensemble de colonnes pour retrouver rapidement les **ROWID** / **ctid** / clés de heap sans parcourir toute la table (**Seq Scan**).

## Comment le moteur l’utilise

Les requêtes avec prédicats **égalité / plage** sur colonnes indexées peuvent déclencher **Index Only Scan** (pages couvertes), **Index Scan**, ou **Bitmap** selon SGBD. Les **index partiels** (\`WHERE active\`) et **INCLUDE** (couverture) réduisent taille et aller-retours heap. **EXPLAIN (ANALYZE)** montre si l’estimateur se trompe (**rows** vs **actual**).

\`\`\`sql
CREATE INDEX CONCURRENTLY idx_inv_user_date
  ON invoices (user_id, created_at DESC)
  INCLUDE (amount_cents)
  WHERE voided_at IS NULL;
\`\`\`

## Performance & coûts en prod

Chaque **INSERT/UPDATE/DELETE** met à jour l’index : trop d’index = **écritures lentes** et **VACUUM**/maintenance plus lourds. **Sécurité indirecte** : scans complets sur grosses tables peuvent saturer I/O et faciliter **timing attacks** sur endpoints lents ; des index adaptés réduisent la surface **DoS** applicative.`,

  normalization: `## Le concept

La **normalisation** structure les données pour **réduire la redondance** et les **anomalies de mise à jour** (même information copiée à plusieurs endroits, incohérences). Les formes **1NF → 3NF** (voire BCNF) sont le vocabulaire standard d’entretien : pas de groupes répétés dans une cellule, pas de dépendance d’un attribut non-clé sur une **partie** de la clé (2NF), pas de **dépendance transitive** sur une clé candidate (3NF).

## Mécanisme & modélisation

On décompose les tables jusqu’à ce que chaque fait dépende de la **bonne clé**. En **OLTP**, cela simplifie les mises à jour ; en **OLAP** / **data warehouse**, on **dénormalise** volontairement (**faits / dimensions**) pour accélérer les agrégations — c’est un **compromis** documenté, pas une erreur.

## En production

Sur-normaliser pour une petite app peut multiplier les **JOIN** ; sous-normaliser peut exposer des **PII dupliquées** (effet **RGPD** : oublier un champ « caché »). Chaque équipe doit tracer **pourquoi** une table snapshot ou dénormalisée existe (cache lecture, CQRS…).`,

  joins: `## Le concept

Un **JOIN** relie deux ensembles de lignes via une condition (\`ON\`). **INNER** ne garde que les paires présentes dans les deux côtés. **LEFT** garde tout le **côté gauche** même sans correspondance (**NULL** à droite). **RIGHT**/**FULL** variant la symétrie. **CROSS** est le produit cartésien (danger).

## Mécanisme d’exécution

Selon cardinalités et index : **Nested Loop** indexé, **Hash Join** pour gros jeux sans tri préalable, **Merge Join** quand deux flux sont triés identiquement sur la jointure. Un **LEFT JOIN** + filtre dans \`WHERE\` sur une colonne **nullable à droite** peut se comporter comme un **inner** involontairement.

\`\`\`sql
SELECT u.email, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id;
\`\`\`

## Production

Mauvais joins = scans et **timeouts** utilisateur. Sécurité : **JOIN** contre des données non pré-filtrées peut **élargir** ce qu’un rapport exporte (**fuite métier**) ; préférez filtres périmère et **least privilege**.`,

  'group-having': `## Le concept

**\`WHERE\`** filtre des **lignes** avant agrégation. **\`GROUP BY\`** regroupe les lignes qui partagent les mêmes valeurs dans les expressions listées pour appliquer \`SUM\`, \`COUNT\`, etc. **\`HAVING\`** filtre des **groupes** déjà agrégés (ex. pays avec plus de N commandes). On ne peut en général pas mettre dans \`WHERE\` une condition sur \`SUM(...)\`.

## Mécanisme d’évaluation

Ordre mental utile :\`FROM → JOIN → WHERE → GROUP BY → HAVING → WINDOW → SELECT → DISTINCT → ORDER\`. Certaines fonctions peuvent passer en sous-requête si la fenêtre doit voir lignes après agrégat.

\`\`\`sql
SELECT country, AVG(amount)::numeric(12,2)
FROM invoices
WHERE year = 2025
GROUP BY country
HAVING COUNT(*) FILTER (WHERE disputed) < 50;
\`\`\`

## En production & perf

Une absence de filtres précoces (**WHERE**) avant \`GROUP BY\` peut exploser cardinalité (**hash aggregate** géant sur disque selon mémoire de travail). Sur **données sensibles**, éviter les micro-groupes qui **ré-identifient** un individu (agrégats sur trop peu de lignes).`,

  transactions: `## Le concept

Une **transaction** est une série d’instructions vues comme **une seule** unité métier (**tout réussir** ou **tout annuler**). **SAVEPOINT** segmente sous-unités rollbackables sous certain moteurs.

## Mécanisme

Le backend maintient snapshots / locks puis écrit WAL ; **rollback** utilise undo. **Isolation** niveau fixe comportement anomalies **dirty/non-repeatable/phantom read**. Clients typiques ferment transaction par **erreur métier**.

\`\`\`sql
BEGIN;
  LOCK TABLE payouts IN SHARE ROW EXCLUSIVE MODE; -- exemple rare
COMMIT;
\`\`\`

## Production & sécurité

Transactions imbriquées via API multiples sans **idempotency keys** ⇒ risques doubles exécution. Déployer timeouts + dead letter queue. Sécurité: **privileged** sessions parfois désactivées — respecter principle of least privilege.`,

  aggregate: `## Le concept

Fonctions d’agrégation (\`SUM\`, \`AVG\`, \`COUNT\`, \`MIN\`, \`MAX\`) **réduisent** un groupe de lignes en une valeur synthétique. **\`COUNT(*)\`** compte toutes lignes groupe ;**\`COUNT(col)\`** ignore **NULL**.

## Fonctionnement

Tri ou hash aggregates ; filtres dirigés (**FILTER** Postgres), **distinct approximatives** (**HyperLogLog**). Fenêtrage **diffère** (**OVER**) en gardant toutes lignes.

\`\`\`sql
SELECT date_trunc('day', ts) AS d,
       COUNT(*) AS events,
       COUNT(DISTINCT user_id) AS users_approx
FROM logs
WHERE ts > now() - interval '24 hours'
GROUP BY 1 ORDER BY 1;
\`\`\`

## Production

**\`GROUP BY colonnes très cardinaires\`** ⇒ volume énorme — pré-agrège table rollups nightly. Sécurité: agrégats exportés peuvent révéler **petits effectifs**.`,

  'sql-explain': `## Le concept

**\`EXPLAIN\`** décrit comment le moteur **compte récupérer** les lignes ; **EXPLAIN ANALYZE** rejoue vraiment (Postgres terme pour « execution + mesures »). À l’entretien : savoir distinguer sérialisation naive vs optimiseur coûts.

## Lecture d’un plan

Repérer **Seq Scan**, **Index Only Scan**, joins choisis (**Nested Loop**/…), **startup/total costs**, lignes réelles (**actual rows**) vs estimées (**rows**). Indices manquants ressort comme costs élevées.

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 42 AND created_at > '2026-05-01';
\`\`\`

## Production

Instrumentation continue — **Pg_stat_statements** — pour prioriser optimisation. Sécurité : certains environnements interdisent la fuite d’informations via \`EXPLAIN\` dans une chaîne injectée — utiliser des **requêtes préparées**, des **rôles à privilèges minimaux** et auditer les endpoints SQL dynamiques.`,

  'sql-cte': `## Le concept

Une **CTE** (\`WITH nom AS (SELECT …)\`) factorise sous-requêtes **nommées** pour lisibilité. **RECURSIVE** pour parcours graphe / hierarchies (**organigramme**, **breadcrumb** categories).

## Comportement moteur

Optimiseurs **inlinent** souvent les CTE comme des sous-requêtes ; selon version et statistiques, une CTE peut être **matérialisée** (barrière d’optimisation) — toujours vérifier avec **EXPLAIN**. Les CTE **récursives** exigent \`UNION ALL\` entre l’**ancre** et la partie récursive, avec condition de terminaison.

\`\`\`sql
WITH RECURSIVE lineage AS (
  SELECT id, parent_id, name
  FROM category
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name
  FROM category c
  JOIN lineage l ON c.parent_id = l.id
)
SELECT * FROM lineage;
\`\`\`

## Production

Les CTE améliorent la **lisibilité** et les revues de conformité (requêtes longues documentées par blocs). Une récursion **mal bornée** peut boucler ou saturer la mémoire : imposez **profondeur max** côté données ou validez le graphe.`,

  'sql-window': `## Le concept

Les **fonctions de fenêtre** (\`OVER (...)\`) calculent une valeur **pour chaque ligne** du résultat en s’appuyant sur un **voisinage** défini dans la **partition**, sans réduire le nombre de lignes comme un \`GROUP BY\`. C’est l’outil des **classements**, **moyennes mobiles** et **sommes cumulées** par utilisateur ou par jour.

## Le mécanisme

Le moteur trie (souvent) selon \`ORDER BY\` interne à la fenêtre, puis applique la fonction sur le **frame** (\`ROWS\`, \`RANGE\`, \`GROUPS\`). \`ROW_NUMBER()\` diffère de \`RANK()\` : la première numérote sans ex æquo, la seconde laisse des « trous » après les égalités.

\`\`\`sql
SELECT user_id,
       event_ts,
       amount,
       SUM(amount) OVER (
         PARTITION BY user_id
         ORDER BY event_ts
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total
FROM ledger;
\`\`\`

## Production

Sur de gros volumes, le tri implicite par fenêtre coûte cher : **index** alignés sur \`(partition, order)\` aident. Côté **données sensibles**, un **classement fin** (top 1 par petit groupe) peut ré-identifier des personnes : appliquez des **seuils** ou du **bruit** dans les exports.`,

  'sql-union': `## Le concept

**\`UNION\`** assemble le résultat de deux \`SELECT\` **compatibles colonne à colonne**, puis **élimine les doublons** (ensemble). **\`UNION ALL\`** concatène sans dédupliquer : c’est souvent **plus rapide** et prévisible lorsque les sources sont **disjointes** par construction.

## Le mécanisme

Pour \`UNION\` (sans ALL), le moteur trie ou hache pour **dédupliquer** — coût mémoire et CPU. \`INTERSECT\` / \`EXCEPT\` suivent la même logique d’ensembles. Attention aux **types implicites** : des unions mal typées masquent des bugs subtils.

\`\`\`sql
SELECT user_id FROM events_2024
UNION ALL
SELECT user_id FROM events_2025;  -- pas de dédup : rapide si partitions disjointes
\`\`\`

## Production

Utiliser \`UNION ALL\` par défaut quand la sémantique le permet : moins de **spill to disk** sur gros jeux. En **sécurité**, l’union de sources hétérogènes dans une même API peut exposer des **colonnes** ou métadonnées si le contrôleur d’accès n’est pas homogène.`,

  'sql-null': `## Le concept

**\`NULL\`** signifie **« valeur inconnue / absente »**, pas zéro ni chaîne vide. En SQL, les prédicats usuels avec \`NULL\` suivent une logique **à trois valeurs** : une comparaison peut produire **UNKNOWN**, traité comme faux dans un \`WHERE\` — d’où la surprise classique \`WHERE col = NULL\` qui ne matche rien.

## Le mécanisme

Utilisez \`IS NULL\`, \`IS NOT NULL\`, **\`IS DISTINCT FROM\`** pour des égalités « NULL-safe ». **\`COALESCE\`**, **\`NULLIF\`** et parfois \`DEFAULT\` en schéma structurent les flux. Les **INDEX** et certaines contraintes \`UNIQUE\` varient selon SGBD sur le traitement de plusieurs \`NULL\`.

\`\`\`sql
-- Égalité NULL-safe (PostgreSQL)
SELECT *
FROM users u
JOIN users_staging s ON u.email IS NOT DISTINCT FROM s.email;
\`\`\`

## Production

Des conditions **mal écrites** autour de \`NULL\` produisent des **filtres trop permissifs** (lignes en trop) ou trop restrictifs — vecteur de **bugs métier** et parfois de **fuite d’accès** si les droits dépendent d’un prédicat faux. Revue systématique des \`LEFT JOIN\` + \`WHERE non_nullable\`.`,

  'sql-views': `## Le concept

Une **vue** est une **requête nommée** : les clients la lisent comme une table, mais le moteur la **déplie** (souvent) dans le plan. Les vues **abstraisent** la complexité (jointures, dénormalisation contrôlée) et stabilisent les **contrats** pour les outils BI.

## Le mécanisme

**INVOKER** vs **DEFINER** : une vue **SECURITY DEFINER** s’exécute avec les droits du **créateur** — pratique pour encapsuler, mais **dangereuse** si mal auditée. Certaines vues sont **non updatables** selon les jointures. Les **vues matérialisées** (voir module dédié) ajoutent du cache.

\`\`\`sql
CREATE VIEW active_users AS
SELECT id, email
FROM users
WHERE deleted_at IS NULL;
\`\`\`

## Production

Les vues simplifient la **gouvernance** (un seul endroit pour la définition de « actif »). Risque : **SECURITY DEFINER** + SQL dynamique = **élévation de privilèges**. Préférez **INVOKER** par défaut, **RLS** explicite, et des tests d’accès sur la vue.`,

  'sql-deadlock': `## Le concept

Un **deadlock** survient quand deux transactions (ou plus) se **bloquent mutuellement** : chacune détient une ressource que l’autre attend, formant un **cycle** dans le graphe d’attente de verrous.

## Le mécanisme

Le SGBD **détecte** périodiquement le cycle et **aborte** une victime (\`deadlock detected\`), qui doit **retry** côté application. L’ordre **non déterministe** des \`UPDATE\` multi-tables favorise les cycles. Les **index** manquants allongent les verrous (scans), augmentant la probabilité de deadlock.

\`\`\`text
T1: verrouille ligne A, attend ligne B
T2: verrouille ligne B, attend ligne A  → cycle
\`\`\`

## Production

Adoptez un **ordre global** d’acquisition des ressources (toujours compte petit → grand id). Gardez les transactions **courtes**, évitez **UI humaine** dans une transaction ouverte. **Retry exponentiel** idempotent sur erreur deadlock — indispensable en prod chargée.`,

  'sql-stored-proc': `## Le concept

Une **procédure stockée** (ou fonction SQL) est du **code exécuté dans le moteur** : boucles, contrôle de flux, accès aux tables, parfois retour de jeux de résultats. Elle rapproche la logique des **données** et peut réduire les **round-trips** réseau.

## Le mécanisme

Le code est **parsé, planifié** (parfois mis en cache de plan) et s’exécute avec les **privilèges** du définisseur ou de l’appelant selon l’option. Les **transactions** peuvent être implicites par statement ou explicites dans le bloc. Versionner des procs en prod exige **migrations** disciplinées.

\`\`\`sql
CREATE OR REPLACE PROCEDURE close_invoice(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE invoices SET status = 'closed', closed_at = now() WHERE id = p_id;
END;
$$;
\`\`\`

## Production

**Avantages** : latence, cohérence réseau, parfois **moins de surface d’injection** si paramètres liés. **Inconvénients** : **vendor lock-in**, déploiement **moins visible** qu’une couche app, tests plus lourds. Évitez d’y mettre de la **logique métier opaque** sans revue — cela devient vite une dette.`,

  'sql-window-functions': `## Le concept

Ce module prolonge la notion de **fenêtre** : on distingue **fonctions de classement** (\`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`NTILE\`), **décalage** (\`LAG\`, \`LEAD\`) et **agrégats de fenêtre** (\`SUM\`… \`OVER\`). Contrairement à \`GROUP BY\`, vous **conservez chaque ligne** tout en calculant des agrégats « locaux ».

## Le mécanisme

\`LAG(col, 1)\` lit la ligne **précédente** dans la partition ordonnée — idéal pour **écart entre deux événements**. \`FIRST_VALUE\` / \`LAST_VALUE\` dépendent du **frame** : sans \`ROWS BETWEEN\`, le défaut peut surprendre avec \`RANGE\`.

\`\`\`sql
SELECT user_id, event_ts,
       LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) AS prev_ts
FROM sessions;
\`\`\`

## Production

\`LAG\`/\`LEAD\` sur des partitions **énormes** sans index d’ordre ⇒ **tri coûteux**. Pour des **tableaux de bord** temps réel, pré-calculer des **rollups** ou utiliser des **moteurs columnar**. Données personnelles : les fenêtres fines sur des **séquences comportementales** augmentent le risque de **profilage** — encadrez les exports.`,

  'sql-cte-expert': `## Le concept

Au-delà de la lisibilité, les CTE servent de **blocs réutilisables** dans une même requête et de **structure** pour les pipelines analytiques (plusieurs CTE enchaînés). La variante **récursive** modélise **arbres**, **graphes** (avec garde-fous) et **séries** itératives contrôlées.

## Le mécanisme

La partie récursive **ne doit pas** diverger : la jointure \`child.parent = parent.id\` avec un graphe **cyclique** sans protection boucle indéfiniment. Certaines équipes matérialisent la CTE (\`MATERIALIZED\` explicite en PostgreSQL récent) pour **forcer** une étape intermédiaire et stabiliser le plan.

\`\`\`sql
WITH RECURSIVE tree AS ( ... )
SELECT * FROM tree WHERE depth < 20;
\`\`\`

## Production

Documentez **pourquoi** la récursion est côté SQL (vs application) : opérations **set-based** massives vs logique **impérative** plus testable. Surveillez **timeout** statement et **work_mem** : une récursion large peut **spill** ou bloquer des workers.`,

  'sql-explain-expert': `## Le concept

L’**EXPLAIN** seul est une **estimation** ; **EXPLAIN ANALYZE** exécute et mesure (**temps réel**, **rows actual**). L’écart **estimé / réel** révèle des **statistiques** obsolètes ou des **corrélations** non captées par l’histogramme.

## Le mécanisme

Options utiles : **BUFFERS** (cache hit/miss), **WAL**, **timing** par nœud. Sur charges réelles, des outils comme **auto_explain** (PostgreSQL) échantillonnent les requêtes **lentes** sans tout tracer en prod. Les **hints** (Oracle, SQL Server) existent ; PostgreSQL reste plutôt sur **stats** et schéma.

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ...;
\`\`\`

## Production

Industrialisez : **tableau de bord** des requêtes les plus coûteuses (\`pg_stat_statements\`), **alerting** sur régressions de plan après upgrade. **Sécurité** : les plans peuvent révéler **noms de tables** sensibles dans les logs — **redaction** et contrôle d’accès aux logs.`,

  'sql-subquery-join': `## Le concept

Une **sous-requête corrélée** avec **\`EXISTS\`** exprime souvent « **y a-t-il au moins une ligne** qui satisfait… ». Un **INNER JOIN** peut exprimer la même chose quand la multiplicité est maîtrisée. **\`NOT EXISTS\`** est l’idiome sûr pour l’anti-jointure (évite pièges \`NULL\` de \`NOT IN\`).

## Le mécanisme

L’optimiseur **réécrit** fréquemment \`EXISTS\` en **semi-join** interne — coût proche d’un join bien indexé. Une sous-requête **non corrélée** matérialisable peut devenir une **CTE** ou une **temp table** selon le moteur. Le **planner** choisit hash vs nested loop.

\`\`\`sql
SELECT c.id
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.placed_at > now() - interval '90 days'
);
\`\`\`

## Production

Préférez la forme **la plus lisible** pour l’équipe ; validez avec **EXPLAIN**. Mauvais index sur la clé étrangère ⇒ **nested loop** qui **scan** toute la table des commandes — incident classique en prod.`,

  'sql-isolation-levels': `## Le concept

Les **niveaux d’isolation** (\`READ UNCOMMITTED\`, \`READ COMMITTED\`, \`REPEATABLE READ\`, \`SERIALIZABLE\`) définissent **quelles anomalies** une transaction peut observer : **dirty read**, **non-repeatable read**, **phantom read**. C’est le contrat entre **performances** et **sûreté** des lectures.

## Le mécanisme

Beaucoup de moteurs implémentent **MVCC** : snapshots de version pour les lectures sans bloquer les écritures. **SERIALIZABLE** (vrai ou **SSI**) détecte des **dépendances** et peut **annuler** une transaction pour préserver l’illusion d’exécution séquentielle.

\`\`\`sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT balance FROM accounts WHERE id = 1;
  -- ... même re-lecture → même snapshot
COMMIT;
\`\`\`

## Production

Par défaut **READ COMMITTED** suffit souvent ; montez en isolation pour **règles financières** critiques — au prix de **retries** et de **contention**. Exposez clairement le niveau utilisé aux **services** qui agrègent plusieurs bases (risque **anomalies distribuées** non couvertes par un seul SGBD).`,

  'sql-partitioning-expert': `## Le concept

Le **partitionnement** (**RANGE**, **LIST**, **HASH**) divise une table logique en **segments physiques**. Le but : **partition pruning** (le moteur **ignore** les partitions hors filtre), **purge** archivage par partition, ou **répartition** I/O.

## Le mécanisme

La **clé de partition** doit aligner les requêtes (\`WHERE order_date BETWEEN ...\`). Sans alignement ⇒ **scan de toutes** partitions (« **partition explosion** »). Maintenance : **detach** anciennes partitions vers froid stockage, **vacuum** par partition.

\`\`\`sql
CREATE TABLE events (
  id BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL,
  ...
) PARTITION BY RANGE (created_at);
\`\`\`

## Production

**Jointures** entre tables partitionnées différemment peuvent être **plus chères**. **Sécurité** opérationnelle : une partition mal **ACL** peut exister sur un bucket S3 séparé — homogénéisez les **contrôles d’accès**.`,

  'sql-materialized-view': `## Le concept

Une **vue matérialisée** stocke **physiquement** le résultat d’une requête : lecture rapide comme une table, au prix d’**actualisation** (**REFRESH**) et d’**espace disque**.

## Le mécanisme

**\`REFRESH MATERIALIZED VIEW CONCURRENTLY\`** (quand disponible + index unique) évite de **bloquer** les lecteurs trop longtemps mais est plus complexe. Les MV servent de **cache de rapport** ou de **projection** lecture pour des agrégats lourds.

\`\`\`sql
CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', ts) AS d, SUM(amount) AS total
FROM sales GROUP BY 1;

REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
\`\`\`

## Production

Stale data : exposez **horodatage** de dernier refresh. Ne remplacez pas les **transactions ACID live** par une MV pour des **soldes temps réel**. En RGPD, une MV dupliquant des **PII** multiplie les surfaces d’**effacement**.`,

  'sql-nosql-types': `## Le concept

**NoSQL** regroupe des familles : **clé-valeur** (cache, sessions), **document** (JSON flexible), **wide-column** (Cassandra), **graphe** (relations traversées), parfois **time-series**. Ce n’est pas « sans SQL », mais « **pas seulement** tables relationnelles strictes ».

## Le mécanisme

Les compromis (**CAP**/PACELC en pratique) orientent : forte **disponibilité** partition vs **cohérence** stricte. Les documents évitent les **JOIN** runtime mais nécessitent **modèle d’accès** clair (**denormalisation**). Les graphes brillent pour **parcours multi-sauts**.

\`\`\`text
Accès principal clé utilisateur → Redis / Dynamo
Profil semi-structuré       → Mongo / Firestore
Feed temporel dense       → Cassandra / TSDB
Réseaux / permissions     → Neo4j / Neptune
\`\`\`

## Production

Choisir la famille selon les **patterns de lecture**, pas la mode. Hybridation **SQL + NoSQL** = **doublon** potentiel — stratégie de **sync** et **vérité métier**. **Sécurité** : beaucoup de stores NoSQL ont eu des défauts d’**auth** exposés si mal configurés en cloud — réseaux privés, **IAM**, chiffrement.`,

}
