/** Modules de cours Markdown (FR) — catégorie TypeScript (24 questions). */

export const TYPESCRIPT_COURSE_MODULES = {
  'ts-type-vs-interface': `## Le concept

**\`type\`** crée un **alias** (union, intersection, mapped…). **\`interface\`** déclare une forme d’objet **extensible par fusion** (\`declaration merging\`) dans l’espace global des modules.

## Le mécanisme

Les deux décrivent des contrats de structure ; l’outil choisit selon **évolutivité** (API publique de lib → interface) vs **types calculés** (\`type A = B & C\`).

\`\`\`ts
type ID = string | number;
interface User { id: ID; name: string; }
\`\`\`

## Production

Préférez **cohérence d’équipe** : une seule convention pour les props React exportées. **Performance compile** : souvent négligeable ; la lisibilité prime.`,

  'ts-generics': `## Le concept

Les **génériques** paramètrent un type ou une fonction par un **type variable** (\`T\`) : réutiliser une même abstraction (\`Array<T>\`, \`Promise<T>\`) sans perdre l’information de type.

## Le mécanisme

Le compilateur **infère** \`T\` à l’appel ou vous le fixez explicitement (\`fn<string>(…)\`). **Contraintes** (\`extends\`) restreignent \`T\`.

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
\`\`\`

## Production

Évitez \`any\` dans les génériques par défaut ; utilisez \`unknown\` + **narrowing** si besoin. Sur les **API publiques**, documentez les paramètres de type attendus.`,

  'ts-union': `## Le concept

Une **union** (\`A | B\`) signifie « l’une ou l’autre ». Le **narrowing** (\`typeof\`, \`in\`, discriminant **\`kind\`**) réduit l’union avant d’accéder à des champs spécifiques.

## Le mécanisme

Sans garde, seuls les membres **communs** sont accessibles. Les **discriminated unions** sont le pattern idiomatique pour les états et les messages d’événement.

\`\`\`ts
type Result = { ok: true; data: string } | { ok: false; error: string };
\`\`\`

## Production

Modélisez les **erreurs** comme variantes explicites plutôt que \`throw\` implicite seul : meilleure exhaustivité avec \`switch\` + \`never\`.`,

  'ts-utility-types': `## Le concept

TypeScript fournit des **types utilitaires** : \`Partial\`, \`Required\`, \`Pick\`, \`Omit\`, \`Record\`, \`Readonly\`, etc. Ils transforment un type objet **sans duplication** de définition.

## Le mécanisme

Basés sur **mapped types** et \`keyof\`. **\`ReturnType\`**, **\`Parameters\`** introspectent les signatures de fonctions.

\`\`\`ts
type UserPatch = Partial<Pick<User, 'name' | 'email'>>;
\`\`\`

## Production

Évitez les utilitaires **imbriqués illisibles** ; extrayez des alias nommés pour les DTO HTTP partagés entre client et serveur.`,

  'ts-any-unknown': `## Le concept

**\`any\`** désactive le contrôle de type (**escape hatch**). **\`unknown\`** exige un **raffinement** avant usage : c’est le substitut sûr quand la forme est inconnue.

## Le mécanisme

Assigner vers \`any\` est toujours permis ; depuis \`unknown\`, interdit sans **narrowing** (\`typeof\`, \`z.parse\`, etc.).

\`\`\`ts
function read(input: unknown) {
  if (typeof input === 'string') return input.toUpperCase();
}
\`\`\`

## Production

Interdisez **\`any\`** dans le \`strict\` eslint de l’CI pour les nouveaux fichiers.** **Secrets**\` :\`** les réponses JSON externes typées avec **Zod** plutôt qu’**any**.`,

  'ts-strict': `## Le concept

**\`strict: true\`** active notamment **\`strictNullChecks\`** et **\`strictFunctionTypes\`** : vous traitez \`null\`/\`undefined\` explicitement et évitez des assignations trompeuses.

## Le mécanisme

Les options **incrementales** (\`strictNullChecks\` seule) permettent une migration.** **Les assertions non nulles (\`!\`)** gardent une dette : à documenter.

\`\`\`json
{ "compilerOptions": { "strict": true } }
\`\`\`

## Production

**\`strict\`** réduit bugs prod sur données incomplètes (API,null DB). Coût : temps de migration initial — rentable sur toute base vivante.`,

  'ts-enum': `## Le concept

**\`enum\`** génère un objet runtime + un type (**enum numérique** ou **chaîne**). Pratique pour un ensemble **fermé** de constantes liées au domaine.

## Le mécanisme

Les enums numériques **reverse-mappent** ; les **const enums** peuvent être inlinés (**\`const enum\`** — pièges de bundlers). Alternative : **union de literals** + \`as const\`.

\`\`\`ts
enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}
\`\`\`

## Production

Pour API JSON compatibles avec d’autres langages, documentez les **valeurs sérialisées**. Évitez enums numériques exposés publiquement si la lecture humaine compte.`,

  'ts-react': `## Le concept

**\`React.FC\`** (souvent déconseillé aujourd’hui) vs **props typées inline**. **\`children\`** optionnel selon le pattern ; **\`ComponentProps\`** réutilise les props natives du DOM.

## Le mécanisme

\`JSX.IntrinsicElements\` fournit les balises ; les composants **génériques** (\`List<T>\`) demandent parfois \`forwardRef\` + typage explicite.

\`\`\`tsx
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };
\`\`\`

## Production

Typer **événements** (\`FormEvent\`, \`ChangeEvent<HTMLInputElement>\`) évite accès invalides. **Storybook** + types = contrat visuel et technique aligné.`,

  'ts-intersection': `## Le concept

**\`A & B\`** exige de satisfaire **les deux** contrats. Utile pour **composer** des capacités (\`Serializable & Timestamped\`).

## Le mécanisme

Si \`A\` et \`B\` ont des clés incompatibles, l’intersection devient **\`never\`** sur cette clé — signal de modèle incohérent.

\`\`\`ts
type Admin = User & { role: 'admin'; permissions: string[] };
\`\`\`

## Production

Évitez intersections **géantes** ; préférez composition ou **séparation des responsabilités** pour limiter la réutilisation abusive de \`&\`.`,

  'ts-conditional': `## Le concept

**\`T extends U ? X : Y\`** choisit un type selon une **contrainte**. Permet des API **conditionnelles** au type d’entrée (\`infer\` à l’intérieur).

## Le mécanisme

Les conditions **distribuent** sur les unions (\`A | B extends U ? …\`) — piège classique qu’il faut parfois neutraliser avec \`[T] extends [U]\`.

\`\`\`ts
type Flatten<T> = T extends (infer U)[] ? U : T;
\`\`\`

## Production

Réservé aux **librairies** et utilitaires de types ; gardez la surface application **lisible** avec des alias nommés.`,

  'ts-mapped': `## Le concept

Un **mapped type** itère sur \`keyof T\` pour produire un nouvel objet type (\`[K in keyof T]: …\`). Base des utilitaires \`Partial\`, \`Readonly\`, etc.

## Le mécanisme

Modificateurs **\`readonly\`**, **\`?\`**, **\`-\` pour retirer** (\`-readonly\`, \`-?\`). **\`as\` clause** (TS 4+) pour renommer ou filtrer des clés.

\`\`\`ts
type Optionalize<T> = { [K in keyof T]?: T[K] };
\`\`\`

## Production

Les mapped types propagent **optionnel** et **readonly** de façon cohérente pour les **DTO** dérivés des entités internes.`,

  'ts-template-literal': `## Le concept

Les **template literal types** combinent des **chaînes littérales** au niveau des types : \`hello \${World}\` où \`World\` est une union de chaînes → produit une **union de résultats**.

## Le mécanisme

Sert à typer **routes**, **événements**, **clés CSS**, **propriétés dynamiques** bornées.

\`\`\`ts
type HttpMethod = 'GET' | 'POST';
type Path = \`/api/\${string}\`;
\`\`\`

## Production

Réduit les typos sur les **noms d’événements** cross-package. Attention **explosion** de cardinalité sur grosses unions — parfois \`string\` pragmatique.`,

  'ts-decorators': `## Le concept

Les **décorateurs** (expérimental historique, stabilisés avec la cible ES moderne) enveloppent classes, méthodes, champs : métadonnées, injection, logging.

## Le mécanisme

Nécessite \`experimentalDecorators\` **legacy** vs **nouveau** modèle ES — **NestJS** s’appuie massivement sur l’écosystème décorateur + réflexion.

\`\`\`ts
function log(_: unknown, key: string, desc: PropertyDescriptor) {
  /* wrap */
}
\`\`\`

## Production

En **front pur**, usage limité ; côté **Node/Nest**, standard de fait. Vérifiez **compat transpilation** (swc, babel, tsc).`,

  'ts-declaration-files': `## Le concept

Les fichiers **\`.d.ts\`** déclarent des **formes** pour du JS sans types (\`declare module\`, \`declare global\`, \`namespace\`). Alimentent l’**autocomplétion** sans réécrire la lib.

## Le mécanisme

**\`@types/*\`** sur DefinitelyTyped ; **\`skipLibCheck\`** accélère en sacrifiant la vérification des libs.

\`\`\`ts
declare module '*.svg' {
  const src: string;
  export default src;
}
\`\`\`

## Production

Si vous maintenez une lib, **publiez** les types avec le package (\`types\` field) pour éviter dérive \`@types\`.`,

  'ts-satisfies': `## Le concept

**\`satisfies\`** valide qu’une valeur respecte un type **sans élargir** l’inférence : vous gardez le type **le plus précis** des littéraux.

## Le mécanisme

Diffère de l’annotation \`: Type\` qui impose souvent un **widening** des littéraux vers le type déclaré.

\`\`\`ts
const palette = {
  red: '#f00',
  blue: '#00f',
} satisfies Record<string, \`#\${string}\`>;
\`\`\`

## Production

Particulièrement utile pour les **configs** et tables de lookup : sécurité + précision pour les refactoring.`,

  'ts-infer': `## Le concept

**\`infer X\`** n’apparaît que dans une **clause extends** conditionnelle : il **capture** un morceau de type inconnu (\`élément de tableau\`, \`valeur Promise\`, etc.).

## Le mécanisme

Compose \`infer\` + conditions pour construire **Awaited**, **ReturnType**, etc.

\`\`\`ts
type Unwrap<P> = P extends Promise<infer U> ? U : P;
\`\`\`

## Production

Outil de **meta-programmation de types** : gardez les alias **courtement documentés** ; les juniors auront besoin d’exemples concrets.`,

  'ts-interface-vs-type-expert': `## Le concept

**Fusion d’interfaces** vs **aliases impossibles à fusionner** automatiquement : impact sur **extensions** multiples et surcharge de libs.

## Le mécanisme

Pour **props de composant**, l’extension \`extends\` entre interfaces peut être plus parlante.** **Pour unions**, seul \`type\` convient.

## Production

Dans les **design systems**, exportez des **interfaces** stables pour les consommateurs ; gardez les **types internes** avec \`type\` pour flexibilité.`,

  'ts-generics-constraints': `## Le concept

**\`T extends U\`** garantit que \`T\` a au moins la « forme » de \`U\` — nécessaire pour appeler **\`U\`'s méthodes** sur \`T\` dans une fonction générique.

## Le mécanisme

**\`extends keyof\`**, **\`extends Constructor\`** : patterns Nest/Angular.** **Variance**\` :\`** sous-type des fonctions (strictFunctionTypes).

\`\`\`ts
function getId<T extends { id: string }>(x: T) {
  return x.id;
}
\`\`\`

## Production

Trop de contraintes → API rigide.** **Trop peu**\` :\`** erreurs obscures à l’intérieur de la fonction — équilibre + tests types \`ExpectTypeOf\`.`,

  'ts-utility-types-expert': `## Le concept

Combiner **\`Pick\`+\`Partial\`** ou **\`Exclude\`** sur \`keyof\` pour créer des **vues projetées** sans dupliquer des dizaines de champs sources.

## Le mécanisme

**\`Exclude<Union, Remove>\`** et **\`Extract\`** filtrent unions.** **\`NonNullable\`** retire null/undefined.

## Production

Générez des types **DEPRECATED** sur champs vieillissants avec intersections et helpers — la dette visible au compile time.`,

  'ts-type-guards-expert': `## Le concept

Un **type predicate** (\`x is Foo\`) informe le compilateur après un test runtime : narrowing **plus fort** qu’un simple \`boolean\`.

## Le mécanisme

Les **assertion functions** (\`asserts x is string\`) **arrêtent** le flux ; utile dans tests et parseurs.

\`\`\`ts
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x;
}
\`\`\`

## Production

Alignez guards avec **validation schema** (Zod) : la source de vérité runtime et le type statique ne divergent pas.`,

  'ts-decorators-nestjs': `## Le concept

**NestJS** utilise décorateurs pour **routes**, **injection de dépendances**, **guards**, **pipes**, **interceptors** : métadonnées lues au bootstrap du module.

## Le mécanisme

**Réflexion** (\`reflect-metadata\`) pour types paramètres en injection — config \`emitDecoratorMetadata\` côté TS.

## Production

Testez les **providers** et **guards** isolément ; la magie décorative complique le premier debug — journalisation structurée et **correlation id** aident.`,

  'ts-strict-config': `## Le concept

Au-delà de \`strict\`, **\`noUncheckedIndexedAccess\`**, **\`exactOptionalPropertyTypes\`**, **\`noImplicitOverride\`** renforcent encore les angles morts.

## Le mécanisme

Chaque flag peut **casser** une base existante : activez par **package** ou **path mapping** progressif.

## Production

Alignez **CI** sur la même \`tsconfig\` que locale ; les PR qui désactivent un flag doivent être **justifiées** et temporaires.`,

  'ts-mapped-advanced': `## Le concept

**Key remapping** (\`as NewKey\`) et filtres (\`Never\` pour supprimer des clés) permettent des transformations **puissantes** (préfixes, suffixes, branding).

## Le mécanisme

Combine **template literals** + mapped types pour générer **API client** typées depuis un schéma OpenAPI (outils existants).

## Production

Complexité élevée : **documentez** ou générez ces types par outil plutôt que maintenance manuelle permanente.`,

  'ts-satisfies-operator': `## Le concept

Affiner la différence **annotation** vs **satisfies** sur gros objets de config : \`satisfies\` préserve **l’inférence des branches** pour autocomplétion fine.

## Le mécanisme

Les **discriminated unions** + \`satisfies\` évitent les casts \`as\` dangereux.

## Production

Idéal pour **feature flags**, thèmes, tables de permissions : validation du contrat + édition sûre dans l’IDE.`,
}
