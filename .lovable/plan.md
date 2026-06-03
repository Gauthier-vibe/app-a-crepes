## Constat

D'après ton message tu vois l'écran « This page didn't load — Something went wrong on our end » sur `/player/role` et `/player/relations`, **même quand le flag bêta est désactivé**.

J'ai vérifié les requêtes réseau et la base : les flags `role` et `relations` sont bien à `beta_only = false`, et `character_settings` répond 200. Donc côté données tout va bien — le problème vient du rendu de la page.

Je n'ai pas encore l'erreur exacte (les logs serveur et la console sont vides). Pour la trouver et la corriger en une passe, voici ce que je propose :

## Étape 1 — Capter l'erreur côté navigateur

Pour l'instant l'erreur est invisible (pas de log JS, pas de stack). Je vais ajouter, **temporairement**, un `console.error` à chaque point d'entrée critique :

- `useCharacterSettings()` (fetch + canal realtime)
- `useFeatureFlags()` (fetch + canal realtime)
- `useIsBetaTester()` (lecture override)

Ça fait apparaître l'erreur dans la console du navigateur dès que tu rouvres la page, et je pourrai la lire au tour suivant.

## Étape 2 — Hypothèses probables et corrections préventives

Vu le code, deux causes très probables :

**A. Tableau vide pendant le tout premier rendu.**
`useFeatureFlags` fait `beta_only ?? true` par défaut. Tant que le fetch n'a pas répondu, l'app considère la feature « bêta uniquement », ce qui peut faire flasher le mur bêta ou, combiné à un autre hook, déclencher une erreur. Je passerai le défaut à `false` **et** j'attendrai explicitement `loading` avant de décider du blocage.

**B. Double abonnement realtime au même channel.**
`useIsBetaTester` (appelé dans `BottomNav`, `player.relations`, `player.role`) instancie `useCharacterSettings()` à chaque fois → plusieurs `supabase.channel("character_settings:all")` en parallèle dans la même page. Supabase n'aime pas, ça peut throw au démontage. Je vais :
- Soit donner un nom de canal unique par instance (`character_settings:${useId()}`)
- Soit, mieux, mutualiser `useCharacterSettings` derrière un petit store (un seul fetch + un seul canal partagé pour toute l'app), et faire pareil pour `useFeatureFlags`.

Je prends l'option store partagé — c'est plus propre et ça supprime aussi les requêtes réseau en double que je vois dans les logs (chaque hook refait son `select *`).

## Étape 3 — Vérification

- Recharger `/player/role` puis `/player/relations` côté joueur non bêta-testeur → le contenu réel doit s'afficher (pas de mur, pas d'erreur).
- Toggler le flag dans `/gm/features` → la page bascule en temps réel sur le mur bêta pour un joueur non bêta-testeur, et reste accessible pour un bêta-testeur.
- Retirer les `console.error` temporaires de l'étape 1 une fois le bug confirmé corrigé.

## Fichiers concernés

- `src/hooks/useCharacterSettings.ts` — store partagé + log temporaire
- `src/hooks/useFeatureFlags.ts` — store partagé + défaut `false` après chargement + log temporaire
- `src/lib/beta.ts` — `useIsBetaTester` lit le store partagé
- Aucune modif visuelle sur `player.role.tsx` / `player.relations.tsx` / `BottomNav.tsx`