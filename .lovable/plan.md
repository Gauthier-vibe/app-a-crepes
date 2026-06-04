## Objectif

Ajouter un 3ᵉ onglet « Suspects » dans `/player/role` pour les enquêteurs, listant tous les personnages non-enquêteurs avec une catégorisation personnelle : **Coupable potentiel**, **Suspect** (défaut), **Innocent**. La liste est propre à chaque enquêteur et persistée côté backend (synchronisée entre appareils).

## Modèle de données

Nouvelle table `suspect_statuses` :
- `investigator_character_id` (text)
- `target_character_id` (text)
- `status` (text — `coupable` | `suspect` | `innocent`)
- `updated_at` (timestamptz)
- PK composite `(investigator_character_id, target_character_id)`
- RLS publique (cohérent avec les autres tables du projet)
- GRANTs `anon` + `authenticated` + `service_role`

Pas de ligne créée par défaut : l'absence de ligne = `suspect`. L'upsert ne se fait qu'au premier changement.

## Frontend

**Nouveau hook** `src/hooks/useSuspectStatuses.ts`
- Pattern partagé (même structure que `useCharacterSettings`) : `useSyncExternalStore` + un seul canal realtime `suspect_statuses:shared`.
- API : `useSuspectStatuses(investigatorId)` → `{ statusOf(targetId), setStatus(targetId, status), loading }`.

**`src/routes/player.role.tsx`** — `InvestigatorPanel`
- Ajouter un 3ᵉ onglet `suspects` dans le `TabsList` (icône `Users`/`Search`).
- Contenu : liste de tous les personnages où `!isInvestigator && id !== character.id`, triés alphabétiquement.
- Chaque ligne : avatar, nom, profession, et un petit groupe de 3 boutons segmentés (Coupable / Suspect / Innocent) avec couleurs sémantiques :
  - Coupable → rouge (`destructive`)
  - Suspect → neutre (défaut, badge `secondary`)
  - Innocent → vert (token existant ou `accent`)
- Compteur dans le label du tab : nombre de « coupable potentiel » marqués.

## Détails techniques

- Realtime via `postgres_changes` sur `suspect_statuses` (insert/update/delete dédupé par `(investigator, target)`).
- Optimistic update local avant retour serveur pour la réactivité.
- Aucun changement aux autres onglets, aucun changement aux pages joueur non-enquêteur.

## Fichiers touchés

- migration SQL (nouvelle table + RLS + GRANTs)
- `src/hooks/useSuspectStatuses.ts` (nouveau)
- `src/routes/player.role.tsx` (ajout onglet Suspects)
