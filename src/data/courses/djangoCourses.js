/** Modules de cours Markdown (FR) — Django / Python backend (24 questions). */

export const DJANGO_COURSE_MODULES = {
  mvt: `## Le concept

**MVT** (Model – View – Template) est la structuration officielle Django : données et accès (**Model**), logique HTTP et décision (**View** — fonctions ou classes), rendu HTML (**Template**). C’est une variante lisible du **MVC** adaptée aux pages rendues serveur.

## Le mécanisme

\`urls.py\` mappe une URL vers une vue ; la vue peut lire POST/GET, interroger l’ORM, puis **\`render()\`** avec un contexte.** **Découpler** encore possible : **formulaires**, **middleware**, **signals**.**

\`\`\`python
urlpatterns = [path(\"articles/<int:pk>/\", views.article_detail)]
\`\`\`

## Production

Gardez les vues fines : logique métier dans **services** ou **couche domain** testables. Pour API JSON quasi exclusive, MVC devient sobre : serializer + vue DRF.**
`,
  orm: `## Le concept

L’**ORM Django** mappe des classes \`models.Model\` vers des tables : relations \`ForeignKey\`, \`ManyToManyField\`, validations, **QuerySet** évalués paresseusement.

## Le mécanisme

Migrations synchronisent schéma et code. Les méthodes \`filter\`, \`exclude\`, \`annotate\` composent la requête ; \`transaction.atomic()\` entoure les blocs à cohérence forte.

\`\`\`python
Order.objects.select_related(\"customer\").filter(paid=True)
\`\`\`

## Production

Surveillez **N+1**, **index manquants**, **requêtes brutes** injectables.** **RLS** ou multi-tenant : souvent SQL explicite + discipline ORM.**
`,
  'n-plus-1': `## Le concept

**N+1** : 1 requête liste + **N** requêtes pour accéder à une relation par ligne (\`for o in orders: print(o.customer.name)\` sans préchargement).**

## Le mécanisme

**\`select_related\`** suit **FK** en JOIN ; **\`prefetch_related\`** fait 2 requêtes + jointure Python pour M2M ou inverses.**

\`\`\`python
Order.objects.select_related(\"customer\").all()
\`\`\`

## Production

Activez **django-debug-toolbar** ou **Silk** en staging ; en prod, **logs slow query** + budgets par endpoint.**
`,
  drf: `## Le concept

**Django REST Framework** standardise **API HTTP** : **serializers** (validation, représentation), **views/viewsets**, **permissions**, **throttling**, **pagination**, **filtres**.

## Le mécanisme

Un **serializer** coerce JSON ↔ modèle ; une **permission** borne l’accès ; un **pagination class** évite fusées de lignes.**

\`\`\`python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [\"id\", \"email\"]
\`\`\`

## Production

Ne mélangez pas **business rules** uniquement dans les serializers : services + transactions.** **JWT**\` :\`** rotation refresh, revocation, liste noire.**
`,
  migrations: `## Le concept

Les **migrations** Django versionnent le **schéma** relationnel.** **Squashing** permet condenser une longue série en prod.**

## Le mécanisme

\`makemigrations\` diff modèles vs état précédent ; \`migrate\` applique la **graphe** des dépendances.** **Rollback** parfois manuel selon périmètre.**

\`\`\`bash
python manage.py makemigrations && python manage.py migrate
\`\`\`

## Production

**CI**\` :\`** vérif fichiers migration manquants (\`migrate --plan\`).** Évitez retouches manuelles d’anciennes migrations publiées.**
`,
  'python-oop': `## Le concept

Python **orienté objet**\` :\`** héritage, **MRO**, \`super()\`, protocols implicites ; utile pour modèles abstraits Django, serializers custom, couches services.**

## Le mécanisme

Comprendre **classes vs instances**, **méthodes de classe**\` ,\`** décorateurs**\` :\`** évite pièges \`MutableDefault\`.**

\`\`\`python
class Service:
    def __init__(self, repo: Repo) -> None:
        self._repo = repo
\`\`\`

## Production

Réduisez subclasses profondes ; préférez **composition**\` :\`** Django models restent POCO + managers.**
`,
  'python-generators': `## Le concept

Les **générateurs** (\`yield\`) produisent des flux **paresseux** : faible RAM pour grands exports ou lecture CSV.**

## Le mécanisme

Itérateur avec état local ; **\`yield from\`** délègue.** **Close**\` :\`** \`generator.close()\` relance \`finally\` côté générateur.**

\`\`\`python
def rows(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()
\`\`\`

## Production

Combinez avec **StreamingHttpResponse** pour ne pas sérialiser un million de lignes en mémoire.**
`,
  'auth-django': `## Le concept

**\`django.contrib.auth\`** gère utilisateurs, groupes, permissions.** **Backends** personnalisent \`authenticate\`.** **Sessions** cookies classiques ; DRF ajoute jetons.**

## Le mécanisme

\`login\` et \`logout\` manipulent la session ; **\`PermissionRequiredMixin\`** protège vues classiques.** **Password hashers** configurables (Argon2 recommandé).**

\`\`\`python
@login_required
def dashboard(request): ...
\`\`\`

## Production

**2FA**, **lockout**, **audit trail** ; ne stockez jamais mots de passe en clair.** **JWT**\` :\`** durée courte + refresh contrôlé.**
`,
  'django-signals': `## Le concept

**Signals** (\`pre_save\`, \`post_save\`…) déclenchent des réactions **découplées** : email de bienvenue, cache invalidation, logs.**

## Le mécanisme

\`@receiver\` + \`dispatch_uid\` évite doublons.** **Import side-effects**\` :\`** enregistrer dans \`AppConfig.ready\`.**

\`\`\`python
@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        ...
\`\`\`

## Production

Évitez logique métier **opaque** ; tests parfois fragiles — préférez **services explicites** pour chemins critiques.**
`,
  'django-celery': `## Le concept

**Celery** déporte travaux **longs** (mailing, PDF, sync) vers des **workers** via broker **Redis/RabbitMQ**.**

## Le mécanisme

\`@shared_task\` + \`.delay\` ; **acks late**, **prefetch**, **retry backoff** selon broker.**

\`\`\`python
@shared_task
def rebuild_index(org_id: int) -> None:
    ...
\`\`\`

## Production

Idempotence, **timeouts**, monitoring **Flower**/metrics ; penser **visibility timeout** (doublons).**
`,
  'django-middleware': `## Le concept

Cascade **middleware** : chaque composant peut court-circuiter avant/après la vue (**auth**, CSRF, security headers, cors custom).**

## Le mécanisme

Le tuple **MIDDLEWARE** dans \`settings.py\` définit l’ordre : le premier de la liste entre le premier sur la requête entrante, et le **dernier** à toucher la réponse sortante.

\`\`\`python
class TimeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        ...
\`\`\`

## Production

Ne loggez pas de **PII** en clair : filtres et masquage RGPD. Les **tests** avec le client Django doivent activer la même pile middleware qu’en production pour être représentatifs.
`,
  'django-custom-manager': `## Le concept

**Manager** et **QuerySet** personnalisés factorisent des filtres réutilisables (ex. \`Customer.objects.invoice_ready()\`) et restent chaînables.

## Le mécanisme

Surcharge **\`get_queryset()\`** puis chaînage.**

\`\`\`python
class ActiveQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)
\`\`\`

## Production

Ne cachez pas d’**\`annotate\`** lourdes partout sans index ; profiler requête et **explain**.**
`,
  'django-testing': `## Le concept

Tests **\`TestCase\`** transactions + rollback OU **pytest-django** fixtures expressives.**

## Le mécanisme

\`Client\`** simule HTTP ; factories (\`factory_boy\`) accélèrent données.**

\`\`\`python
@pytest.mark.django_db
def test_orders(client):
    resp = client.get(\"/orders/\")
    assert resp.status_code == 200
\`\`\`

## Production

Gardez **jeu données minimal** ; parallélisez pytest ; couvrir **permissions** réelles pas seulement 200.**
`,
  'django-security': `## Le concept

Django impose **CSRF** formulaires, **XSS**\` :\`** escape template, SQL paramétré ORM ; reste SSRF manuelles, upload, configuration.**

## Le mécanisme

\`csrf_token\`** template ; en-tête **CSRF**\` :\`** client SPA.** **CSP** via middleware tiers ou reverse proxy.**

\`\`\`python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
\`\`\`

## Production

\`python manage.py check --deploy\`** + revues authz ; **ne jamais** \`mark_safe\` user input.**
`,
  'python-async': `## Le concept

**\`async def\` et \`await\`** pour l’**I/O** concurrent : appels HTTP, drivers async DB ; **pas** pour CPU pur.**

## Le mécanisme

Django 4+ **asgi** ; mélange sync ORM dans views async = **thread pool** — comprendre coûts.**

\`\`\`python
async def call_api():
    async with httpx.AsyncClient() as c:
        return await c.get(\"https://api\")
\`\`\`

## Production

Profiler **event loop** ; isoler CPU **ProcessPool** ; timeouts + **circuit breaker** vers services tiers.**
`,
  'django-drf-viewset': `## Le concept

**ViewSet** regroupe actions CRUD ; **Router** publie URLs REST cohérentes.**

## Le mécanisme

\`ModelViewSet\` + **serializer** + **permission** ; override \`get_queryset\` pour scoping multi-tenant.**

\`\`\`python
router.register(r\"users\", UserViewSet, basename=\"user\")
\`\`\`

## Production

**Nested routes** et **bulk** : attention N+1 et droits ; documenter OpenAPI pour consommateurs.**
`,
  'python-typing-hints': `## Le concept

Annotations servent IDE et **mypy/pyright** ; Python runtime **ignore** en standard (hors libs validation).**

## Le mécanisme

\`Protocol\` pour **structural typing** ; \`TypedDict\` pour JSON.**

\`\`\`python
def total(items: list[tuple[str, float]]) -> float:
    return sum(q for _, q in items)
\`\`\`

## Production

Exploitez **TypedDict** ou Pydantic pour les payloads API.** **Augmenter la couverture des types** réduit les erreurs lors des refactorings.
`,
  'django-signals-patterns': `## Le concept

Signaux OK pour notifications transversales ; **évité** pour cœur métier et transactions longues.**

## Le mécanisme

Pour les tests : \`disconnect\` ou \`dispatch_uid\`. Pensez observabilité — tracer l’ordre des callbacks.

## Production

Prefer **application services** invoquées depuis vues/commands Celery lorsque lisibilité > magie.**
`,
  'celery-expert': `## Le concept

Fiabiliser Celery**\` :\`** idempotency keys, retries exponentiels, **dead-letter queues**, monitoring latence.**

## Le mécanisme

\`task_acks_late=True\`** + visibility timeout Rabbit ; avec Redis**\` :\`** perdre worker = duplication possible.**

## Production

Queues **priorité** séparées ; limite concurrency par type tâche ; secrets broker ACL.**
`,
  'django-caching-strategies': `## Le concept

**\`@cache_page\`**, fragments, cache objet ; CDN + **ETag/Last-Modified** pour réduire bande passante.**

## Le mécanisme

Clés avec **version** déploiement ; invalidation événementielle (signal) mesurée.**

\`\`\`python
cache.set(\"home:stats\", data, timeout=120)
\`\`\`

## Production

**Cache stampede**\` :\`** locks ou recompute single-flight ; chiffrer caches sensibles.**
`,
  'django-security-checklist': `## Le concept

Checklist prod**\` :\`** \`DEBUG=False\`, **\`SECRET_KEY\`**, **\`ALLOWED_HOSTS\`**, cookies secure, HSTS, headers OWASP.**

## Le mécanisme

**\`SecurityMiddleware\`**, **CORS** restreint, uploads scannés taille/MIME.**

## Production

Pentest régulier ; dépendances **Dependabot** ; rotation secrets ; logs sans tokens.**
`,
  'python-context-managers-expert': `## Le concept

**\`with\`** garantit **cleanup** : fichiers, transactions, verrous ; **\`__exit__\`** reçoit exception.**

## Le mécanisme

\`contextlib.contextmanager\`** pour générateurs ; suppression exception via \`return True\` rare.**

\`\`\`python
with transaction.atomic():
    Order.objects.create(...)
\`\`\`

## Production

Encapsulez ressources externes (S3, locks Redis) pour éviter fuites sur erreurs.**
`,
  'django-testing-jwt': `## Le concept

Tester DRF + JWT**\` :\`** \`APIClient.credentials(HTTP_AUTHORIZATION=\"Bearer …\")\` avec token valide court.**

## Le mécanisme

\`RefreshToken.for_user\` en setup ; vérifier **401/403** et scoping objet.**

\`\`\`python
self.client.credentials(HTTP_AUTHORIZATION=f\"Bearer {access}\")
\`\`\`

## Production

Ne réutilisez pas tokens prod ; factory users ; cas **token expiré** / **scope** manquant.**
`,
  'python-dataclasses-pydantic': `## Le concept

**Dataclasses**\` :\`** économie de code sans validation runtime.** **Pydantic**\` :\`** modèles validés + coercion — frontière API idéale.**

## Le mécanisme

Pydantic v2 performances Rust core ; intégration OpenAPI via **FastAPI** ou tools Django.**

\`\`\`python
class Item(BaseModel):
    sku: str
    qty: int = Field(ge=1)
\`\`\`

## Production

Alignez serializers DRF et schémas Pydantic avec **contracts** tests ; versioning champs.**
`,
}
