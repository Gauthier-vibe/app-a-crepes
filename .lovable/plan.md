
# Plan — Murder Party "Le Drame de Pâte à Crêpes"

Maquette front-end uniquement, données mockées, mobile-first pour les joueurs et desktop pour le Game Master. Aucune logique backend en Phase 1.

## 1. Direction artistique

Pas de dark mode pur — ambiance **mariage normand chic + carnet d'enquête Cluedo**.

- Palette : crème (#F5EFE6), lin/sable, encre profonde (#1F2A24), bordeaux doux, touches dorées vieillies.
- Typographie : serif élégant pour titres (type Cormorant / Playfair), sans-serif lisible pour le corps (Inter), machine à écrire (JetBrains Mono) pour les indices et notes.
- Textures : papier vergé subtil, sceaux de cire, cadres dorés autour des portraits, effets verre dépoli légers sur les cartes.
- Photos personnages : portraits IA générés (style mariage normand, lumière chaude).

## 2. Personnages mockés (extraits du scénario)

Mariés enquêteurs : **Agathe** & **Lucas** (parents de Jonas).
Invités-suspects : **Arthur** (parrain, coupable), **Eugénie** (marraine, complice), **Victorine** (le Corbeau), **Léopold** (fausse piste), **Claire** (peluches vivantes), **Gauthier**, **Jonas**.

Je proposerai 8–10 fiches cohérentes (anecdote, indice principal, relations, secrets). Tu pourras ajuster les textes plus tard.

## 3. Routes & navigation

```text
/login                  Code unique par personnage → ouvre la bonne fiche
/player                 Layout joueur (bottom nav)
  /player/fiche         (par défaut)
  /player/relations
  /player/relations/$id
  /player/chat
  /player/notes         (enquêteurs uniquement)
/gm                     Layout Game Master desktop (sidebar)
  /gm                   Vue d'ensemble joueurs
  /gm/player/$id        Fiche détaillée éditable
  /gm/chat              Modération chat + envoi d'indices
  /gm/timeline          Étapes du scénario (Annonce, Fausse piste, Preuve, Accusation)
```

Bottom nav joueur : **Ma Fiche · Relations · Chat · Notes** (Notes masqué si non-enquêteur).

## 4. Écrans

**Login** — fond papier ancien, un sceau de cire, champ unique "Votre code d'invitation", micro-animation au déverrouillage.

**Ma Fiche** — carte profil (portrait cadre doré, nom serif, profession, badge Enquêteur/Invité). Accordéons : Histoire publique · Mes sombres secrets (modale plein écran "lettre cachetée") · Mes objectifs (badges en cours/réussi/échoué) · Mon inventaire (cartes-objets) · Mon anecdote-clé (visible seulement pour les invités, pas les mariés).

**Relations** — trombinoscope en grille, portraits en médaillons. Clic → page dédiée listant ce que MON personnage sait : rumeurs, liens familiaux, ressentiments, dette.

**Chat global** — messagerie moderne, bulles distinctes (moi à droite, autres à gauche avec mini-portrait), support image/vidéo simulé (vignette + lecteur factice), messages "Corbeau" stylés (papier découpé). Conversations pré-scriptées pré-chargées pour la démo.

**Notes (enquêteurs)** — bloc-notes texte libre, fond papier ligné, sauvegarde locale (localStorage pour la maquette).

**GM Desktop** — sidebar avec liste joueurs (statut, présence, indices débloqués). Vue principale : timeline du scénario avec boutons "Déclencher étape 2", "Envoyer indice", panneau chat modérable, fiche joueur cliquable pour édition rapide des objectifs.

## 5. Composants UI clés (shadcn)

Card, Accordion, Dialog (modale secrets), Badge (statut objectifs + Enquêteur), Avatar, Tabs (interne fiche), Sheet (détail relation sur mobile), Sonner (toasts indices), ScrollArea (chat).

## 6. Données mockées

Un seul fichier `src/data/mock.ts` qui exporte `characters`, `secrets`, `objectives`, `relations`, `messages`, `clues`. Typage TS strict. Un hook `useCurrentCharacter()` lit le code stocké en localStorage après login.

## 7. Étapes de livraison

1. Setup design system (tokens couleurs/typo dans `src/styles.css`, polices Google Fonts).
2. Génération des portraits IA des personnages (lot parallèle).
3. Mock data + types + hook personnage courant.
4. Login + routing (`/login`, `/player`, `/gm`) + garde simple.
5. Layout joueur avec Bottom Nav + écran Ma Fiche.
6. Écran Relations + détail relation.
7. Chat global avec conversations pré-scriptées + envoi local.
8. Notes (enquêteurs).
9. Dashboard GM desktop (liste joueurs, timeline scénario, chat modéré).
10. Pass final : animations, micro-interactions, polish responsive.

## Détails techniques

- TanStack Start, file-based routing dans `src/routes/`, layouts via `_player.tsx` et `_gm.tsx` avec `<Outlet />`.
- Tokens en `oklch` dans `src/styles.css`, jamais de couleurs hardcodées.
- Aucune dépendance Supabase / serveur en Phase 1.
- localStorage uniquement pour : code personnage actif, notes enquêteur, messages envoyés en démo.
- Bottom Nav = composant fixe `position: fixed bottom-0` masqué automatiquement sur `/gm/*` et sur desktop ≥ md si tu préfères (à confirmer).

Dis-moi si tu veux ajuster la liste des personnages, l'ambiance, ou le découpage avant que je passe en build.
