/** Modules de cours Markdown (FR) — catégorie Node.js (24 questions). */

export const NODE_COURSE_MODULES = {
  'event-loop': `## Le concept

**Node.js** repose sur une **boucle d’événements** : un seul thread exécute votre code JavaScript utilisateur, pendant que le **moteur libuv** gère I/O **non bloquantes** (fichiers en thread pool, réseau async) et déclenche des **callbacks** quand le travail externe est prêt. Analogie : un serveur qui prend les commandes vite, confie la cuisson à la cuisine, et revient servir quand la sonnette retentit.

## Le mécanisme

Les **phases** (timers, callbacks I/O, immediates, fermetures) ordonnent les tâches ; les **microtâches** Promises (\`queueMicrotask\`) s’exécutent **avant** la phase suivante — d’où l’ordre subtil \`setTimeout\` vs \`Promise.then\`. Du **code CPU pur long** **bloque** toute la boucle : latence API, heartbeat manqué.

\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
// Ordre typique : A, D, C, B
\`\`\`

## Production

Mesurez **event loop lag** (health checks, \`perf_hooks\`), évitez les **JSON géants** ou regex catastrophiques sur le thread principal. Sécurité indirecte : boucle bloquée ⇒ **timeouts** en cascade, **queue** DoS — **limitez corps** et utilisez **workers** pour CPU.`,

  middleware: `## Le concept

Les **middleware** (style Express) sont des fonctions **enchâinées** qui reçoivent \`(req, res, next)\` : chaque couche peut **terminer** la réponse ou **passer** avec \`next()\`. C’est la charpente des **préoccupations transverses** : parsing, auth, logs, CORS.

## Le mécanisme

L’ordre d’**enregistrement** définit l’ordre d’exécution. Un middleware **async** mal géré (promesse rejetée sans \`try/catch\` ou wrapper) peut **ne pas** appeler \`next\` ou laisser une **requête pendante**. Pattern : \` express-async-errors\` ou wrapper centralisé.

\`\`\`js
app.use(express.json({ limit: '100kb' }));
app.use('/api', requireAuth);
app.use((err, req, res, next) => {
  res.status(500).json({ ok: false });
});
\`\`\`

## Production

Couches **minimalistes** avant routes chaudes ; **rate limiting** tôt pour la surface DoS. **Séparation** auth / métier évite middlewares géants incontrôlés — audits **OWASP** sur entêtes et sessions.`,

  bcrypt: `## Le concept

**bcrypt** est une fonction de **hash** **lente** et **adaptative** pensée pour les **mots de passe** : un facteur **coût** (work factor) fait monter CPU et mémoire, rendant les attaques par **dictionnaire** hors ligne très coûteuses. On ne « chiffre » pas un mot de passe : on le **replace** par une **empreinte irreversible**.

## Le mécanisme

Un **salt** aléatoire par utilisateur évite tables arc-en-ciel partagées. À chaque connexion : \`compare(plain, hash)\`. Le coût se **rejoue** régulièrement (double temps CPU tous ~2 ans selon policy).

\`\`\`js
const hash = await bcrypt.hash(password, 12);
const ok = await bcrypt.compare(candidate, hash);
\`\`\`

## Production

**Ne jamais** logger ou stocker le brut. Migrer hors **MD5/SHA rapides** vulnérables aux GPU. Associez **2FA**, **lockout**/throttle, surveillance **credential stuffing**.`,

  jwt: `## Le concept

Un **JWT** compose **header.payload.signature** ; le serveur vérifie la **signature** (HMAC avec secret partagé ou clés **RSA/ECDSA**) pour détecter toute modification. C’est souvent utilisé comme **jeton bearer** sans session serveur majeure, mais avec des **trade-offs**.

## Le mécanisme

Le payload encode des **claims** (\`exp\`, \`iss\`, \`aud\`, \`sub\`). **Pas de secret** dans le JWT : le client peut **lire** le payload (base64url). Rotation des clés (**JWKS**), **short TTL** + **refresh** sécurisé, **blacklist** revocations sensibles.

\`\`\`js
const token = jwt.sign({ sub: userId }, privateKey, { algorithm: 'RS256', expiresIn: '15m' });
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
\`\`\`

## Production

**XSS** volant un JWT en \`localStorage\` = prise de compte : préférez **cookies HttpOnly** + **CSRF** protections si applicable. Validez **algorithm** pour éviter \`none\` / confusion de clé — historique d’attaques **JWT**.`,

  'rest-api': `## Le concept

**REST** modélise des **ressources** identifiées par URL, manipulées avec des **verbes HTTP** sémantiques (\`GET\` idempotent sans effet de bord idéal, \`POST\` création, \`PUT\` remplacement, \`PATCH\` partiel, \`DELETE\`). Les codes **2xx/4xx/5xx** portent le résultat ; **HATEOAS** reste rare en pratique pure.

## Le mécanisme

**Content negotiation** (\`Accept\`), **pagination** (\`cursor\` > offset sur gros volumes), **idempotency keys** sur \`POST\` financiers. Versionner par **préfixe** \`/v1\` ou entête.

\`\`\`http
GET /users/42/orders?cursor=abc&limit=50
404 → { "error": "not_found" }
201 → Location: /orders/99
\`\`\`

## Production

**Rate limit** + **validation schéma** (Zod/Joi) limitent abus. **Ne jamais** exposer stack traces. **CORS** et **authz** fines (RBAC) par route — REST n’est pas la sécurité par obscurité.`,

  mongoose: `## Le concept

**Mongoose** est un **ODM** MongoDB : **schémas**, **validation**, **middleware** save, **population** de références. Il structure le **document** flexible sans retomber dans un schéma SQL rigide.

## Le mécanisme

Les **indexes** se déclarent dans le schéma ; **lean()** renvoie POJO au lieu de documents **hydratés** (perf lecture). Attention aux **defaults** et \`select: false\` sur champs sensibles (\`passwordHash\`).

\`\`\`js
const userSchema = new Schema({ email: { type: String, index: true, unique: true } });
userSchema.index({ lastSeen: -1 });
\`\`\`

## Production

**N+1 queries** équivalent Mongo via populates répétées — profiler **explain**. **Injection** NoSQL existe : filtre **typé**, pas concat de chaîne. **Migrations** de schéma = scripts idempotents + **feature flags**.`,

  streams: `## Le concept

Les **streams** lisent ou écrivent des données **par morceaux** au lieu de charger tout un fichier ou une réponse en RAM. Pensée **pipeline** : readable → transform → writable (compression, CSV, uploads).

## Le mécanisme

**Backpressure** : un \`write\` retourne \`false\` quand le consommateur est saturé — il faut attendre \`drain\`. **pipeline()** relie et propage erreurs (\`AbortSignal\`). **objectMode** sépare octets vs objets JS.

\`\`\`js
await pipeline(createReadStream('in.bin'), zlib.createGzip(), createWriteStream('out.gz'));
\`\`\`

## Production

Évite **OOM** sur gros uploads / exports. **Timeout** et **limites** taille sur edge. **Sécurité** : ne pas streamer des chemins **utilisateur** fournis sans **canonicalisation** — **path traversal**.`,

  'testing-node': `## Le concept

Tester Node couvre **unitaires** (fonctions pures, services), **intégration** (DB de test, supertest HTTP), parfois **contrat**. **Mocks** I/O externes pour déterminisme. **Jest/Vitest** ou **Node test runner** natif.

## Le mécanisme

**Arrange–Act–Assert**, **fixtures** seed, **transactions rollback** ou DB jetable Docker. Pour async : **await** assertions, rejets \`rejects.toThrow\`. CI : **coverage** seuil, pas de tests \`.only\`.

\`\`\`js
test('calcule total', async () => {
  const res = await request(app).get('/cart/total').set('Authorization', 'Bearer mock');
  expect(res.status).toBe(200);
});
\`\`\`

## Production

Tests **sans secrets** (\`.env.test\`). **Éviter tests flakey** timers — fake timers contrôlés. **Sécurité** : pipeline bloque si tests authz manquants sur routes sensibles.`,

  'node-nexttick': `## Le concept

**\`process.nextTick\`** programme un callback **avant** la prochaine phase I/O de la boucle d’événements, **après** le code synchrone courant mais **avant** la plupart des autres timers/promesses — file **prioritaire** dédiée.

## Le mécanisme

Abus de \`nextTick\` **récursif** **starve** I/O (pas de chance au réseau). Préférez souvent \`setImmediate\` pour « après I/O » ou \`queueMicrotask\` pour microtâches Promises. Usage typique : laisser une API finir son setup synchrone avant d’émettre un événement.

\`\`\`js
let x;
process.nextTick(() => { console.log(x); });
x = 42;
\`\`\`

## Production

**Starvation** = latence invisible en prod. Ne basez pas la **sécurité** sur l’ordre nextTick vs promesses — nondéterminisme subtil. Auditez libs legacy qui en abusent.`,

  'node-cluster': `## Le concept

Le module **cluster** lance **N workers** (processus) partageant les **ports** via le **master** : répartition des connexions **round-robin** (souvent) pour utiliser **plusieurs cœurs** CPU — contournant le **GIL** naturel de JS single-thread par process.

## Le mécanisme

Le **master** ne sert pas le HTTP : il **fork** et recycle les workers **crashés**. **Sticky sessions** si état local — mieux : **stateless** + Redis. **PM2** ou orchestrateurs **K8s** remplacent souvent cluster pur.

\`\`\`js
if (cluster.isPrimary) {
  for (let i = 0; i < cpus().length; i++) cluster.fork();
} else {
  createServer(app).listen(3000);
}
\`\`\`

## Production

**Zero-downtime** deploy = **rolling** workers. **Socket** / **WS** : attention au **rebalance**. **Sécurité** : isoler users OS, **pas de secret** en clair dans master.`,

  'node-error-middleware': `## Le concept

Dans Express, un middleware à **4 arguments** \`(err, req, res, next)\` est le **gestionnaire d’erreurs final** : centralise **logs**, **masquage** détails, **corrélation** request-id.

## Le mécanisme

Les erreurs doivent **atteindre** ce handler via \`next(err)\` ou wrapper async. **Ne pas** appeler \`next\` deux fois. Distinction **operational** vs **programmer** errors (Bass book).

\`\`\`js
app.use((err, req, res, next) => {
  logger.error({ err, reqId: req.id });
  res.status(err.statusCode ?? 500).json({ error: 'internal_error' });
});
\`\`\`

## Production

**Pas de fuite** stack vers client. **Alerting** sur taux 5xx. Mapper erreurs métier (**code** stable) sans exposer implémentation — important pour **privacy** audits.`,

  'node-cors': `## Le concept

**CORS** est appliqué par le **navigateur** : il bloque la réponse lue par JS si les **origines** diffèrent, sauf si le serveur émet les entêtes \`Access-Control-*\` autorisés. Ce n’est **pas** une barrière pour **curl**, **Postman**, ou **bots** hors navigateur.

## Le mécanisme

**Preflight OPTIONS** pour « non simple » (méthodes/entêtes custom). **Credentialed** requests exigent origine **explicite** (pas \`*\`). Côté Node : middleware \`cors\`, ou reverse proxy (**nginx**).

\`\`\`js
app.use(cors({ origin: config.allowedOrigins, credentials: true }));
\`\`\`

## Production

**Whitelist** rigide ; pas de **reflect-request-origin** aveugle. CORS ≠ **auth** : tout endpoint doit **vérifier** jetons côté serveur. Risque CSRF avec cookies si mal configurés **SameSite**.`,

  'node-env': `## Le concept

**\`NODE_ENV=production\`** active optimisations (**cache** Express templates, asserts retirées par bundles). Les **secrets** vivent hors git : **fichiers .env**, coffre-fort de secrets, variables sur la plateforme. **12-factor** impose config par environnement injectée.

## Le mécanisme

Charger \`.env\` seulement en dev (\`dotenv\`). Structurer validation (\`envalid\`, schémas). **feature flags** par env évite branches longues.

\`\`\`js
assertEnv(['DATABASE_URL', 'JWT_ISSUER']);
\`\`\`

## Production

**Secrets** rotation, **least privilege** DB users. Mauvaise config **expose** métriques / debug routes — désactiver en prod stricte. **Supply chain** : pin versions, scans CVE.`,

  'node-eventemitter': `## Le concept

**\`EventEmitter\`** implémente le pattern **observer** synchrone par défaut : \`emit\` appelle les listeners dans l’ordre ; une erreur dans un listener peut **casser** tout le flux sans handler \`'error'\`.

## Le mécanisme

**once**, **prependListener**, **maxListeners** (fuites mémoire si ∞). Flux héritent d’emitter. Utile pour **découpler** des bounded contexts dans un monolithe, avec discipline.

\`\`\`js
emitter.on('user:created', (u) => queueEmail(u));
emitter.emit('user:created', user);
\`\`\`

## Production

Toujours **écouter** \`'error'\` sur emitters critiques. Mémoire : **nettoyer** listeners (hot reload). Sécurité : ne pas passer **objets bruts utilisateur** à des listeners tiers sans validation.`,

  'node-promise': `## Le concept

Une **Promesse** représente une valeur future ; **microtâches** garantissent **ordre**. **async/await** est du sucre sur \`.then/.catch\` — équivalent à des promesses chaînées.

## Le mécanisme

**\`Promise.all\`** échoue au premier reject ;**\`Promise.allSettled\`** rapporte tous les états.**\`Promise.race\`** pour timeouts. **Oublier await** ⇒ **Unhandled rejection** silent bug.

\`\`\`js
await Promise.all([db.query(sql1), db.query(sql2)]);
\`\`\`

## Production

**Timeouts explicites** sur appels tiers (\`AbortController\`). **Backoff** retries idempotents. **Sécurité** : ne pas suivre des redirections hors origine de confiance avec des jetons ou cookies sensibles.`,

  'node-rate-limit': `## Le concept

Le **rate limiting** protège vos **coûts** et réduit **brute-force** / scraping : quotas par IP, par clé API, ou par utilisateur (« **token bucket ** » leaky bucket).

## Le mécanisme

**store** distribuée (**Redis**) en multi-instance ; **middleware** rejette \`429\` avec \`Retry-After\`. **Headers** comme \`X-RateLimit-Remaining\` renseignent le client légitime.

\`\`\`js
rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true });
\`\`\`

## Production

**CDN / edge** (Cloudflare) en première ligne. **Whitelist** des sorties réseau internes. Défense adaptative sous attaque (CAPTCHA léger). Attention **CGNAT** : plusieurs utilisateurs peuvent partager une même IP.`,
  'node-promises-allsettled': `## Le concept

**\`Promise.allSettled\`** attend **toutes** les promesses du tableau et rend pour chaque une carte \`{status, reason|value}\` — utile lorsque vous voulez un ** bilan complet** même si une tâche échoue (import batch, appels multiples fournisseurs).

## Le mécanisme

Contrairement à \`Promise.all\`, **aucune** rejection prématurée ; vous filtrez \`status === 'rejected'\` après coup. Combine bien avec **concurrency limiting** (**p-limit**) pour éviter surcharge.

\`\`\`js
const r = await Promise.allSettled(urls.map((u) => fetch(u)));
const ok = r.filter((x) => x.status === 'fulfilled');
\`\`\`

## Production

Ne **masquez pas** erreurs systématiques : logguez agrégées. **Retries** sélectifs seulement sur erreurs transientes. Sécurité : **timeouts** + bornes payloads sur chaques fetch.`,

  'node-async-error-handling': `## Le concept

Le code **async/await** lève des erreurs comme du **sync** avec **try/catch** ; hors try, une erreur async devient **rejection non gérée** — process peut **crash** selon Node flags (**--unhandled-rejections**).

## Le mécanisme

**Express** ne catch pas async automatiquement sans wrapper. **Domaines** dépréciés — préférer wrappers.\`void (async () => { ... })()\` dangereux sans catch.

\`\`\`js
router.get('/x', async (req, res, next) => {
  try {
    res.json(await service());
  } catch (e) { next(e); }
});
\`\`\`

## Production

**Monitoring** unhandled + **strict** exit policy. **Sécurité** : mapper erreurs → codes stables côté client, **ne jamais** renvoyer SQL interne.`,

  'node-cluster-expert': `## Le concept

Passer de **cluster basique** à la prod exige **health** par worker, **graceful shutdown** (**SIGTERM** → fermer serveur après requêtes en cours), et **distribution de charge cohérente** avec données partagées (sessions).

## Le mécanisme

**ipc** entre master/worker pour métriques. **SO_REUSEPORT** / kernel LB selon infra. À grande échelle : **deleguer** au scheduler **Kubernetes**, cluster module devient optionnel historique.

\`\`\`js
server.close(() => process.exit(0)); // après drain
\`\`\`

## Production

**Thundering herd** après déploiement : introduire du **jitter** côté clients. Les **fuites mémoire** sont isolées par worker. Les **secrets** sont régénérés à chaque roll-out de pods — éviter les fichiers partagés lisibles globalement.`,

  'node-env-expert': `## Le concept

Au-delà de \`NODE_ENV\`, régissez **tls min version**, **http keep-alive**, **heap size**\`(--max-old-space-size)\`. **SSR** bundles partagent pitfalls memory.

## Le mécanisme

**\`NODE_OPTIONS\`** injecte des options globales. **OpenTelemetry** et le **tracing** corrèlent logs et spans.

\`\`\`bash
NODE_OPTIONS="--dns-result-order=ipv4first" node app.js
\`\`\`

## Production

**Snapshots** différents entre local, Lambda et VM : automatiser les vérifications. **inspect** Node ne doit jamais être exposé sur Internet. **Principe** : aucun secret en clair dans une image Docker.`,
  'node-caching-redis': `## Le concept

**Redis** en couche cache : **TTL**, **invalidate** sur write, parfois **pub/sub** pour multi-instance. Réduit pression DB et latence p95.

## Le mécanisme

**Key design** versionnée (\`user:42:v3\`), **serialization** JSON/msgpack, **Lua** scripts atomiques rares. **Eviction** LRU vs probabilité.

\`\`\`js
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);
const fresh = await loadFromDb();
await redis.setex(key, 60, JSON.stringify(fresh));
\`\`\`

## Production

**Cache stampede** : verrouiller le recalcul. **Données sensibles** : chiffrement au repos, pas de PII inutile en cache. **Auth** Redis : **ACL** + TLS — une instance Redis publique expose un incident classique.`,
  'node-semver': `## Le concept

**SemVer** \`MAJOR.MINOR.PATCH\` communique **rupture** attendue : MAJOR API cassante, MINOR features rétro-compatibles, PATCH correctifs. **npm** ranges \`^\` / \`~\` automatisent mises à jour mineures.

## Le mécanisme

**lockfile** (\`package-lock\`) fige l’arbre résolu — **repro builds**. **npm audit** / **Dependabot** ; **overrides** prudemment.

\`\`\`json
"dependencies": { "express": "^4.19.0" }
\`\`\`

## Production

**Chaîne d’approvisionnement** : packages verrouillés, surveillance des **typosquatting**, **CI** qui teste une install fraîche. **Geler** les versions majeures sensibles jusqu’à une fenêtre de migration planifiée.`,

  'node-repository-pattern': `## Le concept

Le **repository** encapsule l’accès données : l’**application** parle \`UserRepository.findByEmail\`, pas SQL/Mongoose direct partout. Facilite **tests** (in-memory fake) et **migration** de store.

## Le mécanisme

Interfaces TypeScript ou classes pures ; **unit of work** transactionnelle si besoin. Éviter **God repository** 500 méthodes — découper par agrégat DDD.

\`\`\`ts
export interface UserRepo { findById(id: string): Promise<User | null>; }
\`\`\`

## Production

**SQL injection** centralisée en un point avec **queries paramétrées**. **Observabilité** : timings DB par méthode repository. Séparation **writes/reads** (CQRS) possible.`,

  'node-foreach-await': `## Le concept

**\`for await...of\`** consomme un **async iterable** un élément à la fois : parfait pour **streams** Readable async ou pagination API. Contrairement à **\`Promise.all(array.map(async …))\`** qui lance tout d’un coup → **DOS** mémoire / rate limit tiers.

## Le mécanisme

Chaque tour **attend** l’élément suivant — **contrôle concurrency** trivial (batch de N avec compteur). Combine avec **break** pour early cancel + \`AbortSignal\`.

\`\`\`js
for await (const chunk of stream) {
  await process(chunk);
}
\`\`\`

## Production

**Backpressure** : gardez la consommation alignée sur la capacité du producteur. **Throttling** sur les APIs tierces. **Sécurité** : timeouts par itération pour éviter des boucles bloquantes infinies.`,
}
