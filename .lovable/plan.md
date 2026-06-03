## Problème

`src/routes/gm.chat.tsx` utilise un tableau mock (`messages as seed` depuis `@/data/mock`) et ne lit / n'écrit jamais dans la table `chat_messages`. Du coup la console d'administration affiche un faux fil et les messages réels postés par les joueurs (via `/player/chat` sur le canal `global`) n'apparaissent pas.

## Correctif

Réécrire `src/routes/gm.chat.tsx` sur le même modèle que `src/routes/player/chat.tsx` :

1. **Lecture initiale** : `supabase.from("chat_messages").select("*").eq("channel","global").order("created_at").limit(500)`.
2. **Realtime** : abonnement `postgres_changes` INSERT sur `chat_messages` filtré `channel=eq.global`, ajout déduppé dans le state.
3. **Rendu** : réutiliser le style existant (bulles `system`, `corbeau`, joueurs avec avatar via `charactersById`, fallback `sender_display_name`), prise en charge des images (`image_url`) comme dans le chat joueur.
4. **Publication du Corbeau** : le formulaire insère désormais dans `chat_messages` avec `channel:"global"`, `sender_character_id:"corbeau"`, `sender_display_name:"Le Corbeau"`, `content:value` (au lieu de muter le state local).
5. **Annonce système** : bouton "Diffuser une annonce" → insert avec `sender_character_id:"system"`, `sender_display_name:"Système"`, `content:"🔔 …"`.
6. Loader d'attente et message vide ("Aucun message pour l'instant"), scroll auto en bas à chaque nouveau message.

Aucune migration nécessaire : la table `chat_messages` et ses policies publiques existent déjà, et `/player/chat` envoie déjà sur le canal `global`.

## Fichiers touchés

- `src/routes/gm.chat.tsx` (réécriture)

## Vérification

- Ouvrir `/gm/chat` : les messages déjà postés par les joueurs sur le salon commun apparaissent ; un nouveau message envoyé depuis `/player/chat` s'affiche en direct.
- Publier un message du Corbeau depuis le GM → il apparaît côté joueur instantanément.
- Diffuser une annonce → bulle système visible des deux côtés.
