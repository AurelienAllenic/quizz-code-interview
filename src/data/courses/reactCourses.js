/** Modules de cours Markdown (FR) — catégorie React (24 questions). */

export const REACT_COURSE_MODULES = {
  'virtual-dom': `## Le concept

React évite de toucher le DOM pour chaque micro-changement : il garde un **arbre léger en mémoire** et **réconcilie** avec le DOM réel en appliquant un **diff minimal**. Le terme « Virtual DOM » désigne surtout cette représentation et l’algorithme de patching — pas un second navigateur.

## Le mécanisme

À chaque mise à jour d’état, React construit un nouvel arbre d’éléments, le compare à l’instantané précédent, puis commite les mutations DOM nécessaires. Les **clés** stabilisent les listes ; l’architecture **Fiber** permet le travail fragmentable (base du **Concurrent React**).

\`\`\`jsx
{users.map((u) => <UserRow key={u.id} user={u} />)}
\`\`\`

## Production

Le coût DOM n’est souvent pas le premier suspect : **sur-rendus**, **context** trop larges et **effets** mal bornés le sont. Utilisez le **Profiler** avant d’optimiser prématurément. Pensez **sémantique HTML** et perf **accessibilité** (virtualisation de listes avec rôles corrects).`,

  usestate: `## Le concept

**\`useState\`** associe au composant une **variable d’état locale** persistée entre re-rendus : après le setter, React **rejoue** la fonction composant avec la valeur à jour. Le **batching** groupe souvent plusieurs mises à jour dans un même événement (handlers, parfois promesses selon version).

## Le mécanisme

Le setter accepte valeur ou **fonction** \`(prev) => next\` pour éviter les lectures obsolètes lors de mises à jour en rafale. Pour objets/tableaux : **immutable updates** (\`spread\`) pour que React détecte le changement de référence.

\`\`\`jsx
const [draft, setDraft] = useState({ name: '' });
setDraft((d) => ({ ...d, name: e.target.value }));
\`\`\`

## Production

Évitez les **méga-états** : divisez par domaine (formulaire ≠ UI chrome). États dérivés : calculez-les au rendu ou avec \`useMemo\` mesuré. **Sécurité** : ne stockez pas de jetons ou secrets persistants sans garde-vous (priorité aux cookies HttpOnly / backend).`,

  useeffect: `## Le concept

**\`useEffect\`** orchestre les **effets** : données async, timers, abonnements externes. Il s’exécute **après peinture**, ce qui le distingue du corps de rendu, qui doit rester **sans effets de bord directs**.

## Le mécanisme

Le **tableau de dépendances** déclenche l’effet quand ses éléments changent (comparaison référentielle). La forme « **tableau vide** » signifie « une fois après montage », avec cleanup au démontage. Omettre le tableau fait tourner l’effet après **chaque rendu** — généralement à éviter. La fonction **cleanup** est indispensable pour **abort**/désabonnement.

\`\`\`jsx
useEffect(() => {
  const ac = new AbortController();
  fetch(url, { signal: ac.signal }).then(setData);
  return () => ac.abort();
}, [url]);
\`\`\`

## Production

Protégez-vous des **courses** (**AbortController**, flag \`cancelled\`). **Ne déclenchez pas de side-effects lourds** sans garde lorsque l’URL ou l’auth change vite. Respectez quotas API et **timeouts** réseau.`,

  'context-api': `## Le concept

**Context** diffuse une valeur à une **sous-arborescence** sans enchaîner des props sur dix niveaux. **\`Provider\`** + **\`useContext\`** forment le couple habituel.

## Le mécanisme

Quand \`value\` change, **tous** les consommateurs se re-rendent — d’où l’intérêt de **stabiliser** les objets (\`useMemo\` sur la valeur) ou de **découper** plusieurs contextes (thème vs session).

\`\`\`jsx
const Ctx = createContext(null);
<Ctx.Provider value={session}><App /></Ctx.Provider>
\`\`\`

## Production

Context n’est pas un **store global haute fréquence** : risque de re-rendus massifs. **Ne placez pas** de secrets en clair dans un contexte accessible côté client. Préférez **données minimales** (id rôle, pas PII sensibles inutiles).`,

  'usememo-usecallback': `## Le concept

**\`useMemo\`** met en cache un **résultat coûteux** ; **\`useCallback\`** met en cache une **fonction** entre rendus si les dépendances sont stables. Objectif : éviter recomput ou stabiliser les **props** passées aux enfants **mémoïsés** (\`memo\`).

## Le mécanisme

Les deps suivent les mêmes règles que \`useEffect\`. Si vous oubliez une dépendance réelle, vous servez des **valeurs périmées** ; si vous en mettez trop, le cache ne sert à rien.

\`\`\`jsx
const model = useMemo(() => buildModel(raw), [raw]);
const onSubmit = useCallback(() => send(model), [model]);
return <FormView model={model} onSubmit={onSubmit} />;
\`\`\`

## Production

**Profilez d’abord** : un \`useMemo\` partout complique les dépendances et peut masquer des **valeurs périmées** dans les fermetures (dont règles d’autorisation). Ces hooks restent précieux sur les **chemins chauds** : listes virtualisées, graphes interactifs.`,

  'react-router': `## Le concept

**React Router** relie URL et composants rendus à l’écran : navigation **déclarative**, liens partageables, synchronisation avec l’historique navigateur.**

## Le mécanisme

Les **layouts** imbriqués et les **loaders** (selon la version de React Router) permettent de préparer des données avant le rendu d’une page.

\`\`\`jsx
<Routes>
  <Route path="/projects/:id" element={<Project />} />
</Routes>
\`\`\`

## Production

Les **gardes de route** (wrappers qui vérifient la session ou les rôles) améliorent l’UX mais ne remplacent pas la validation **backend**. Limitez le prefetch de payloads sensibles sur des routes potentiellement accessibles sans authentification complète.`,

  jsx: `## Le concept

Le **JSX** compile vers des appels qui créent des éléments React. Il mélange **balises**, **fragments**, **expressions entre accolades** et logique métier lisible.**

## Le mécanisme

Majuscule **→** composant fonction ou classe.** **Minuscule** → intrinsics DOM.**

\`\`\`jsx
<Card elevated={mode === 'pro'}>{children}</Card>
\`\`\`

## Production

Prévenir **XSS** : interdire \`dangerouslySetInnerHTML\` non sanitisée ; filtrer **URLs** utilisateur avant \`href\`/\`src\`. Les **Server Components** (écosystème React) peuvent réduire le JavaScript envoyé au navigateur.`,

  'data-fetching': `## Le concept

Charger des données depuis l’interface, c’est piloter plusieurs **états** (vide, chargement, erreur, succès), éviter **requêtes redondantes** et réconcilier **cache**, **expiration** et **invalidation**.

## Le mécanisme

Des couches comme **TanStack Query** ou **SWR** centralisent le cache, fusionnent les observateurs (**deduplication**) et permettent revalidation automatique (**stale-while-revalidate**) ou intégration avec Suspense.

\`\`\`jsx
const { data, error, isLoading } = useSWR('/api/me', fetcher);
\`\`\`

## Production

Paramétrez retries avec **backoff + jitter** pour ne pas amplifier une panne. Validez les réponses avec un schéma (**Zod**) pour l’expérience utilisateur, mais gardez l’**autorité** côté serveur. Ne loguez pas de **PII** brutes issues des réponses en console prod.`,

  'react-useref': `## Le concept

**\`useRef\`** conserve une **valeur mutable** (\`.current\`) entre renders **sans déclencher** de nouveau rendu lors des affectations.** **Références DOM**, identifiants de timers ou **gardes** contre les fuites dans les closures async.**

## Le mécanisme

\`ref={nodeRef}\` relie le nœud host au montage ; \`useImperativeHandle\` expose un sous-API contrôlé au parent.** **Pour le focus ou scroll, le ref est souvent plus simple qu’un state synchronisé.**

\`\`\`jsx
const r = useRef(null);
useEffect(() => { r.current?.focus(); }, []);
return <input ref={r} />;
\`\`\`

## Production

Documentez pourquoi la mutation \`.current\` remplace un state : c’est un **filet d’échappement**. Ne stockez pas de **secrets** dans un ref accessible globalement.`,

  'react-memo': `## Le concept

**\`React.memo\`** évite de recalculer le rendu d’un composant si ses **props** sont superficiellement inchangées.** **Utile pour isoler un enfant coûteux d’un parent volatil.**

## Le mécanisme

Comparaison par défaut : **Object.is** sur chaque prop.** **Comparateur personnalisé** possible (\`arePropsEqual\`), au prix d’une maintenance délicate.** **Props instables** (\`style={{}}\`, \`onClick={() =>}\`) annulent l’intérêt du memo.**

\`\`\`jsx
export const Price = memo(function Price({ cents }) {
  return <span>{(cents / 100).toFixed(2)} €</span>;
});
\`\`\`

## Production

Mesurez avec le **Profiler** : un \`memo\` mal ciblé complique le code sans gain.** **Combinez avec virtualisation pour les longues listes.**`,

  'react-suspense': `## Le concept

**Suspense** déclare une **frontière** : tant qu’un descendant « suspend » (lazy import, ressource async selon le framework), React affiche un **fallback** (spinner, squelette). Cela structure l’expérience de chargement sans éparpiller des booléens \`isLoading\` partout.

## Le mécanisme

\`React.lazy\` + \`Suspense\` découpent le bundle.** **Avec des librairies de données compatibles, la suspension peut se déclencher sur promesses trackées — le détail dépend de la stack (par ex. intégration Router / RSC).**

\`\`\`jsx
const Chart = lazy(() => import('./Chart'));
<Suspense fallback={<Skeleton />}>
  <Chart data={data} />
</Suspense>
\`\`\`

## Production

Évitez des **frontières trop fines** (clignotement) ou **trop larges** (blocage global). **Erreurs** : Suspense ne remplace pas un **Error Boundary** ; combinez les deux.`,

  'react-controlled': `## Le concept

Un champ **contrôlé** tire sa **valeur affichée** du state React (\`value={...}\` + \`onChange\`).** **Non contrôlé** : le DOM garde l’état (\`defaultValue\`).** **Contrôlé = source de vérité unique côté React.**

## Le mécanisme

Chaque frappe met à jour le state → re-render.** **Pour les gros formulaires, scindez l’état ou utilisez une librairie dédiée pour limiter les re-rendus.**

\`\`\`jsx
const [q, setQ] = useState('');
return <input value={q} onChange={(e) => setQ(e.target.value)} />;
\`\`\`

## Production

Ne laissez pas des champs sensibles dans l’URL ou le state global sans **masquage** UI approprié.** **Validation** : double contrôle client (UX) + serveur (sécurité).`,

  'react-custom-hooks': `## Le concept

Un **hook personnalisé** est une fonction dont le nom commence par \`use\` et qui **compose** d’autres hooks pour extraire une logique réutilisable (**data**, **media query**, **clavier**).**

## Le mécanisme

Les règles des hooks s’appliquent : appels au **top-level** de la fonction hook, pas dans des conditions.** **Retournez API minimale (tuple ou objet nommé).**

\`\`\`jsx
function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}
\`\`\`

## Production

Évitez les hooks « fourre-tout » : frontière claire = **tests** et **lint** plus simples.** **Ne cachez pas d’effets réseau implicites** sans documenter les dépendances et erreurs.`,

  'react-error-boundary': `## Le concept

Une **Error Boundary** (composant classe \`componentDidCatch\` / \`static getDerivedStateFromError\` ou librairie équivalente) intercepte les **erreurs de rendu** des enfants et affiche une **UI de repli** au lieu de planter toute l’app.**

## Le mécanisme

Elles **ne capturent pas** les erreurs dans handlers d’événements, async ni SSR seul — il faut \`try/catch\` local ou monitoring global.** **Remontez l’erreur à votre service de suivi (Sentry, etc.).**

\`\`\`jsx
class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? <Fallback /> : this.props.children; }
}
\`\`\`

## Production

Offrez un **chemin de sortie** (retour accueil, reload encadré).** **Ne montrez pas** la stack utilisateur final : log serveur + message générique.**`,

  'react-zustand': `## Le concept

**Zustand** propose un **store minimal** hors Redux : API légère, pas de \`Provider\` obligatoire (mais possible), sélecteurs pour limiter les re-rendus.**

## Le mécanisme

Le store est un hook \`useStore(selector)\` : React ne re-render que si le **résultat du sélecteur** change (comparaison stricte par défaut).** **Actions** = fonctions mutatrices du state via \`set\`.**

\`\`\`js
const useBear = create((set) => ({
  honey: 0,
  eat: () => set((s) => ({ honey: s.honey + 1 })),
}));
\`\`\`

## Production

Évitez d’y placer **PII** ou jetons persistés en clair. Découpez plutôt l’état en plusieurs boutiques (slices / domaines) pour limiter le couplage et les re-rendus larges.`,
  'react-ssr': `## Le concept

Le **SSR** exécute les composants côté **serveur** pour produire du HTML envoyé au client (**FCP** amélioré, SEO partagé avec crawlers qui n’exécutent pas JS). **L’hydratation** ré-attache ensuite les événements côté client.

## Le mécanisme

\`renderToString\`, \`renderToPipeableStream\` ou \`renderToReadableStream\` produisent le HTML côté serveur. Protégez tout accès \`window\` ou \`document\` avec une garde explicite.

\`\`\`jsx
hydrateRoot(document.getElementById('root'), <App />);
\`\`\`

## Production

Évitez les **différences d’hydratation** (**hydration mismatch**) : RNG, locales, timestamps non stabilisés. **Divisez les données sensibles** : ce qui part dans le HTML est **inspectable**.`,

  'react-memo-perf': `## Le concept

Optimiser combine **profiler React**, **virtualisation des listes**, **mémoïsation là où ça coûte** et réduction des calculs synchrones dans le corps du rendu.

## Le mécanisme

Identifiez les **couches chaudes** : contextes trop généralistes, props instables depuis parents, computations lourdes recalculées à chaque frappe.

\`\`\`jsx
const visible = useMemo(() => heavyFilter(rows, q), [rows, q]);
\`\`\`

## Production

Une optimisation sans mesure peut **régresser la lisibilité** ou introduire bugs de dépendances.** **Sur mobile bas de gamme, privilégiez moins de re-renders** plutôt que micro-opts prématurés.**`,

  'react-custom-hook-pattern': `## Le concept

Le **pattern hook** encapsule conventions : préfixe \`use\`, retour stable, tests unitaires comme pour une librairie.** **Exemple**: \`usePagination\`, \`useDebouncedValue\`.

## Le mécanisme

Exposez soit **tuple** soit **objet nommé**.** **Testez avec \`renderHook\` (Testing Library)** pour couvrir changements dépendances.**

\`\`\`jsx
export function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
\`\`\`

## Production

Réutilisation inter-projets ⇒ publiez un **mini design system** avec docs.** **Séparation** métier pure (fonctions pures) / effets facilite audit sécurité.**`,

  'react-suspense-expert': `## Le concept

Aux frontières avancées, Suspense s’intègre à des **graphiques de dépendances** (RSC, frameworks fullstack) : le serveur peut **streamer** HTML partiel pendant que des segments attendent des données.**

## Le mécanisme

Surveillez **waterfalls** : cascades de suspensions séquentielles qui allongent le **TTFB** perçu.** **Parallélisez** les fetchs indépendants au niveau route ou layout.**

## Production

Préchargez (\`link rel=preload\`) assets critiques.** **Surveillez erreurs réseau** : un fallback permanent masque une panne prolongée — combinez **timeout** + message actionnable.**`,

  'react-zustand-expert': `## Le concept

À l’échelle, Zustand accepte **middlewares** (\`persist\`, \`devtools\`, \`immer\`) et une organisation en **slices**. Le vrai défi : des **sélecteurs fins** pour limiter les re-rendus et éviter de reconstruire de larges objets à chaque commit.

## Le mécanisme

\`persist\` sur localStorage **expose** données ; chiffrement rarement suffisant côté client.** **Hydratation SSR** doit aligner état serveur/client.**

## Production

**Ne persiste jamais** de refresh tokens en clair avec \`persist\` sans stratégie de rotation/refus côté API. Harmonisez l’état Zustand avec le HTML SSR pour éviter un flash incohérent.`,
  'react-hook-form-expert': `## Le concept

**React Hook Form** minimise les re-rendus en appuyant les champs sur des refs et une validation centralisée. Des schémas **Zod/Yup** s’intègrent via des resolvers.**

## Le mécanisme

\`handleSubmit\` orchestre la validation puis n’envoie le payload métier que si tout est conforme.**

\`\`\`jsx
const { register, handleSubmit } = useForm({ resolver: zodResolver(Schema) });
\`\`\`

## Production

Reliez les messages d’erreur aux contrôles (\`aria-describedby\`) pour l’accessibilité. Contrôlez la taille et le typage MIME des uploads et validez à nouveau **côté serveur**.`,
  'react-portals': `## Le concept

**\`createPortal(children, domNode)\`** monte une sous-arborescence sous un **nœud DOM externe** tout en préservant le contexte React et la propagation synthétique habituelle des événements.**

## Le mécanisme

Idéal pour **modales**, **tooltips**, **toasts** contenant overlays sans casser CSS flow du parent.**

\`\`\`jsx
createPortal(<Modal />, document.getElementById('overlay-root'))
\`\`\`

## Production

Ajoutez un **piège à focus**, gérez \`Escape\`, et renvoyez le focus sur l’élément déclencheur après fermeture. Réduisez les guerres de \`z-index\` avec une racine d’overlay partagée dans le design system.`,
  'react-nextjs-expert': `## Le concept

**\`Next.js\`** agrège conventions de routage (App Router / Pages Router), rendu serveur/streaming, **optimisations média** (**Image**) et politiques de **cache** distribuées (CDN/edge).

## Le mécanisme

Les **Route Handlers / Server Actions** rapprochent données et mutations, mais créent aussi une nouvelle surface : validez et **authentifiez** chaque action comme une mutation API classique.

\`\`\`jsx
export default async function Page() {
  const data = await fetch('...', { next: { revalidate: 60 } });
  return <List items={await data.json()} />;
}
\`\`\`

## Production

Toute variable préfixée \`NEXT_PUBLIC_\` est **embarquée dans le bundle client** : n’y mettez jamais de secrets. Utilisez \`middleware.ts\` pour des règles périmètre (bots, redirections, en-têtes de sécurité), complétées par des **contrôles d’autorisation** sur chaque route de données.`,
  'react-concurrent-rendering': `## Le concept

**Concurrent React** peut **interrompre** un rendu peu prioritaire au profit des interactions critiques : les API \`startTransition\` et \`useDeferredValue\` permettent de marquer respectivement une mise à jour comme reportable ou de retarder une valeur coûteuse.

## Le mécanisme

\`startTransition\` conserve une interface réactive (saisie) pendant que de lourds filtres se recalculent en arrière-plan. Ce n’est **pas** équivalent à un debounce : le travail sera fait, potentiellement en plusieurs étapes interruptibles.

\`\`\`jsx
startTransition(() => setQueryFilter(heavyValue));
\`\`\`

## Production

Survéillez encore les goulets **CPU-bound** dans le corps des composants : la concurrence n’élimine pas un algorithme quadratique. Instrumentez **INP** / **long tasks** sur le terrain pour valider le gain réel.`,
}
