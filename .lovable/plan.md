## Objectif

Pour les enquêteurs uniquement, l'écran `/player/help` affiche **deux onglets** au lieu du seul canal privé actuel :

1. **Organisation** — le canal privé existant (`help:{characterId}`), inchangé.
2. **Commissariat** — un canal commun à TOUS les enquêteurs, où le GM répond en tant que "Commissaire". Quota partagé : **3 questions oui/non maximum** pour l'ensemble des enquêteurs.

Les personnages non-enquêteurs voient l'écran actuel sans onglets (zéro changement).

## UX du canal Commissariat

- Bandeau d'intro : "Canal commun aux enquêteurs. Le commissaire répond uniquement par **oui** ou **non**. Vous disposez de **3 questions** au total (compteur partagé). **Interdit** : demander si quelqu'un est coupable ou innocent."
- Compteur visible en haut : `Questions restantes : X / 3`.
- Les messages des enquêteurs sont affichés avec nom + avatar de l'auteur.
- Le GM répond depuis `/gm/help` : sa réponse apparaît en bulle "Commissaire".
- Le quota de 3 ne compte que les messages envoyés par les enquêteurs (pas les réponses du commissaire, pas les messages libres de chat entre enquêteurs).
- **Distinction question vs chat libre** : deux champs/boutons côte à côte dans le composer :
  - **Envoyer un message** (chat libre entre enquêteurs, illimité, pas de réponse attendue du commissaire)
  - **Poser une question** (compte dans le quota, déclenche une notification côté GM ; désactivé quand quota atteint)
- Quand quota atteint → bouton "Poser une question" désactivé avec libellé "Plus de questions disponibles".

## Côté GM (`/gm/help`)

- Ajouter un thread spécial "Commissariat (enquêteurs)" en tête de la liste, à côté des threads individuels.
- Le GM répond avec `sender_display_name = "Commissaire"` (au lieu de "Organisation") pour ce canal.
- Affichage du compteur questions utilisées / 3 dans l'en-tête du thread.

## Architecture technique

### Réutilisation de `chat_messages`

Nouveau canal fixe : `squad:investigators`. Aucun changement de schéma nécessaire — la table `chat_messages` et son realtime sont déjà en place.

Pour distinguer **question** vs **chat libre** sans migration, on encode le type dans `content` via un préfixe interne `[Q] ` (stocké tel quel, masqué à l'affichage et remplacé par un badge "Question"). Alternative plus propre si tu préfères : ajouter une colonne `kind text` à `chat_messages` (`'message' | 'question' | 'answer'`) — à confirmer.

### Comptage du quota

Compté côté client en filtrant les messages du canal `squad:investigators` dont l'auteur est un enquêteur ET marqués comme question. Pas besoin de table dédiée.

### Composant

- `src/routes/player.help.tsx` : envelopper le contenu actuel dans `<Tabs>` quand `character.isInvestigator === true`. Sinon rendu inchangé.
- Nouveau composant interne `InvestigatorSquadChat` (dans le même fichier, simple) qui réutilise la logique chat de `HelpPage` paramétrée sur `channel = "squad:investigators"`, avec :
  - en-tête + compteur + règles
  - composer à deux boutons (Message / Question)
- `src/routes/gm.help.tsx` : ajouter une entrée virtuelle "Commissariat" en tête de `threads`, qui regroupe tous les messages du canal `squad:investigators`. Quand sélectionnée, le `send` utilise `sender_display_name = "Commissaire"` et `channel = "squad:investigators"`.

### Realtime

`gm.help.tsx` écoute déjà tous les inserts ; il suffit d'élargir le filtre pour accepter aussi `channel === "squad:investigators"` en plus de `help:%`.

`player.help.tsx` : ajouter une 2ᵉ souscription realtime sur le canal `squad:investigators` quand l'utilisateur est enquêteur.

## Fichiers touchés

- `src/routes/player.help.tsx` — ajout des onglets + composant squad chat (enquêteurs uniquement)
- `src/routes/gm.help.tsx` — ajout du thread "Commissariat" en tête, libellé "Commissaire" pour les réponses sur ce canal, compteur affiché

Aucune migration DB sauf si tu valides l'ajout de la colonne `kind`.

## Question à confirmer

**Encodage question vs chat libre** : préfixe `[Q]` dans `content` (zéro migration, simple) **ou** nouvelle colonne `kind` sur `chat_messages` (plus propre) ?