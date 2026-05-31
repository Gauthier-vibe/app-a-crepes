import agatheImg from "@/assets/characters/agathe.jpg";
import lucasImg from "@/assets/characters/lucas.jpg";
import arthurImg from "@/assets/characters/arthur.jpg";
import eugenieImg from "@/assets/characters/eugenie.jpg";
import herveImg from "@/assets/characters/herve.jpg";
import gauthierImg from "@/assets/characters/gauthier.jpg";
import julieImg from "@/assets/characters/julie.jpg";
import antoineImg from "@/assets/characters/antoine.jpg";
import lenaicImg from "@/assets/characters/lenaic.jpg";
import leopoldImg from "@/assets/characters/leopold.jpg";
import christelleImg from "@/assets/characters/christelle.jpg";
import claireImg from "@/assets/characters/claire.jpg";
import victorineImg from "@/assets/characters/victorine.jpg";

export type CharacterId =
  | "agathe"
  | "lucas"
  | "arthur"
  | "eugenie"
  | "herve"
  | "gauthier"
  | "julie"
  | "antoine"
  | "lenaic"
  | "leopold"
  | "christelle"
  | "claire"
  | "victorine";

export interface HiddenRole {
  name: string;
  power: string;
  description: string;
}

export interface Character {
  id: CharacterId;
  code: string;
  name: string;
  profession: string;
  image: string;
  isInvestigator: boolean;
  isCulprit?: boolean;
  isGameMaster?: boolean;
  publicStory: string;
  /** Alibi raconté par le personnage en public */
  alibi: string;
  /** Consigne de jeu — comportement à tenir pendant la soirée */
  directive: string;
  /** Thème de l'anecdote personnelle à personnaliser par les mariés */
  anecdoteHint: string;
  /** Phrase clé à attendre pour livrer l'indice */
  keyPhrase: string;
  /** Indice principal à révéler une fois la phrase clé prononcée */
  mainClue: string;
  /** Personnage à "relayer" (pousser les mariés vers lui) */
  relayTargetId?: CharacterId;
  hiddenRole: HiddenRole;
}

export interface Secret {
  id: string;
  characterId: CharacterId;
  title: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  characterId: CharacterId;
  name: string;
  description: string;
}

export interface Relation {
  sourceId: CharacterId;
  targetId: CharacterId;
  label: string;
  description: string;
}

export type MediaType = "text" | "image" | "video";

export interface ChatMessage {
  id: string;
  senderId: CharacterId | "system" | "corbeau";
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  mediaCaption?: string;
  timestamp: string;
}

export interface TimelineStep {
  id: string;
  title: string;
  trigger: string;
  description: string;
  status: "locked" | "ready" | "done";
}

const PLACEHOLDER_PHRASE = "[À personnaliser : ajoute un souvenir rigolo, un bon moment passé avec les mariés]";

export const characters: Character[] = [
  // ============== ENQUÊTEURS ==============
  {
    id: "agathe",
    code: "MARIEE-001",
    name: "Agathe",
    profession: "La mariée — enquêtrice en chef",
    image: agatheImg,
    isInvestigator: true,
    publicStory:
      "Mariée du jour, maman de Jonas. Pâte à crêpes, c'est la peluche fétiche de ton fils — et elle vient de disparaître en pleine réception. Tu es organisée, intuitive, et tu n'aimes pas qu'on touche aux affaires de ton fils.",
    alibi: "—",
    directive:
      "Mène l'enquête avec Lucas. Va à la pêche aux anecdotes personnelles : chaque souvenir bien placé débloque un indice.\n\nObjectifs :\n• Retrouver Pâte à crêpes avant le gâteau — C'est ta mission principale.\n• Faire parler chaque invité avec son anecdote — Chaque souvenir personnel bien posé débloque un indice.\n• Désigner le ou les coupables avant le dessert — Avec ou sans certitude.",
    anecdoteHint: "—",
    keyPhrase: "—",
    mainClue: "Tu reçois les indices au fur et à mesure des révélations.",
    hiddenRole: {
      name: "Enquêtrice en chef",
      power: "Carnet d'enquête et liste des indices révélés",
      description:
        "Tu peux noter tes hypothèses et consulter chaque indice clé débloqué par les invités.",
    },
  },
  {
    id: "lucas",
    code: "MARIE-002",
    name: "Lucas",
    profession: "Le marié — enquêteur en chef",
    image: lucasImg,
    isInvestigator: true,
    publicStory:
      "Marié du jour, papa de Jonas. Cartésien, méthodique, légèrement dépassé par les émotions de la journée. Tu veux retrouver Pâte à crêpes avant le gâteau coûte que coûte.",
    alibi: "—",
    directive:
      "Soutiens Agathe et garde ton sang-froid. Sollicite chaque invité avec une anecdote personnelle pour faire tomber leur indice.\n\nObjectifs :\n• Soutenir Agathe dans l'enquête — Et garder ton sang-froid.\n• Ne pas pleurer pendant ton discours — Bonne chance.",
    anecdoteHint: "—",
    keyPhrase: "—",
    mainClue: "Tu reçois les indices au fur et à mesure des révélations.",
    hiddenRole: {
      name: "Enquêteur en chef",
      power: "Carnet d'enquête et liste des indices révélés",
      description:
        "Tu peux noter tes hypothèses et consulter chaque indice clé débloqué par les invités.",
    },
  },

  // ============== SUSPECTS ==============
  {
    id: "arthur",
    code: "PARRAIN-003",
    name: "Arthur",
    profession: "Parrain de Jonas — meilleur ami de Lucas",
    image: arthurImg,
    isInvestigator: false,
    isCulprit: true,
    publicStory:
      "Tu as fait le coup (enfin, presque) ! Tu as laissé le Croque-Souci « dévorer » Pâte à crêpes par accident, et tu l'as caché. Ton mobile : tu voulais que ta nouvelle peluche soit la préférée de Jonas — Pâte à crêpes était moche et puante.",
    alibi: "« J'étais en train de vérifier que le buffet des desserts était bien installé. »",
    directive:
      "Sois fuyant. Si Agathe ou Lucas t'interrogent, bégaie un peu et cherche le regard d'Eugénie. Relais : suggère innocemment aux mariés d'aller cuisiner Victorine sur son anecdote.\n\nObjectifs :\n• Ne JAMAIS avouer ce qui s'est passé — Sauf si tu craques sous la pression de ton anecdote.\n• Garder le ticket de caisse hors de vue — Idéalement, le déchirer si possible.",
    relayTargetId: "victorine",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Bon, d'accord… Je te jure que ce n'est pas moi qui l'ai déchirée intentionnellement ! C'était un accident avec un autre objet… »",
    hiddenRole: {
      name: "Le Coupable",
      power: "Diversion (1 fois)",
      description:
        "Tu peux demander au Maître du Jeu de lancer une rumeur publique pour détourner l'attention. À utiliser avec parcimonie.",
    },
  },
  {
    id: "eugenie",
    code: "MARRAINE-004",
    name: "Eugénie",
    profession: "Marraine de Jonas — la complice",
    image: eugenieImg,
    isInvestigator: false,
    isCulprit: true,
    publicStory:
      "Tu couvres Arthur — tu es la tête pensante du duo criminel. Tu as aidé à forcer le zip du Croque-Souci pour cacher le « cadavre » englouti. Aux yeux des autres, on te soupçonne d'avoir fait le coup par dégoût : tu es maniaque de la propreté et Pâte à crêpes te répugnait.",
    alibi:
      "« J'étais aux toilettes pour refaire mon rouge à lèvres, puis j'ai discuté avec Arthur. »",
    directive:
      "Défends Arthur bec et ongles. Relais : oriente discrètement les mariés vers Arthur en leur disant qu'il a l'air bizarre et qu'ils devraient le faire parler sur son anecdote.\n\nObjectifs :\n• Surveiller le grand sac en permanence — Il contient le Croque-Souci.\n• Protéger Arthur s'il commence à craquer — Il craque toujours.",
    relayTargetId: "arthur",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Ok… J'ai bien vu Arthur paniquer avec un objet coincé tout à l'heure, mais à la base on voulait juste faire une belle surprise ! »",
    hiddenRole: {
      name: "La Complice",
      power: "Bouclier (1 fois)",
      description:
        "Tu peux bloquer publiquement une accusation portée contre Arthur en lui fournissant un alibi. Une seule fois dans la soirée.",
    },
  },
  {
    id: "herve",
    code: "PAPY-005",
    name: "Papy Hervé",
    profession: "Père de Lucas — maniaque de la propreté",
    image: herveImg,
    isInvestigator: false,
    publicStory:
      "Le maniaque de la propreté qui a failli passer à l'acte, mais qui protège les amis de la famille. Tu détestes Pâte à crêpes : pour toi, c'est un nid à microbes ambulant. Tu as menacé 100 fois de le passer à la machine à 90 °C avec de la Javel.",
    alibi:
      "« J'étais dans la cuisine, à inspecter l'hygiène du plan de travail et à chercher des Tupperwares pour les restes. »",
    directive:
      "Dis que la disparition de la peluche est une excellente nouvelle. Relais : pour noyer le poisson, conseille aux mariés d'aller fouiner du côté d'Eugénie en évoquant son anecdote.\n\nObjectifs :\n• Dire que la disparition est une bonne nouvelle — Sois assumé. Tu détestes cette peluche.",
    relayTargetId: "eugenie",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Je n'ai rien fait à cette peluche sale. Par contre, j'ai vu Arthur transpirer à grosses gouttes tout à l'heure, et pourtant la clim fonctionne bien… »",
    hiddenRole: {
      name: "L'Hygiéniste",
      power: "Inspection publique",
      description:
        "Une fois dans la soirée, tu peux demander au Maître du Jeu de faire « inspecter » un sac ou un objet d'un invité (à ses risques et périls).",
    },
  },
  {
    id: "gauthier",
    code: "TONTON-006",
    name: "Gauthier",
    profession: "Mari de Victorine — le tonton « beauf »",
    image: gauthierImg,
    isInvestigator: false,
    isGameMaster: true,
    publicStory:
      "Le tonton un peu beauf et super maladroit, engagé dans une guerre d'ego avec Léopold. Tu t'es assis sur Pâte à crêpes il y a quelques mois et tu l'avais recousue avec du gros fil de pêche. Tu aurais pu vouloir la faire disparaître pour cacher les preuves de ta mauvaise couture.",
    alibi:
      "« J'étais au bar en train de siffler le punch. J'en suis à mon 4ème verre, je suis en pleine forme ! »",
    directive:
      "Aie l'air coupable pour des choses inutiles, fais des blagues lourdes. Relais : accuse ouvertement Léopold et dis aux mariés de le confronter sur son anecdote.\n\nObjectifs :\n• Faire au moins une blague lourde par quart d'heure — Et boire un punch entre chaque.",
    relayTargetId: "leopold",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« J'ai recousu cette horreur le mois dernier, oui, mais aujourd'hui je n'y ai pas touché ! Je suis sûr que c'est une histoire de cadeau qui a mal tourné. »",
    hiddenRole: {
      name: "Le Beauf",
      power: "Punch offert (1 fois)",
      description:
        "Tu peux offrir un punch à un invité pour le « détendre » : le Maître du Jeu peut alors lui poser une question gênante en public.",
    },
  },
  {
    id: "julie",
    code: "PHOTO-007",
    name: "Julie",
    profession: "Copine de Léopold — paparazzi de la soirée",
    image: julieImg,
    isInvestigator: false,
    publicStory:
      "La photographe amatrice qui a des preuves dans son téléphone. Tu adores les belles photos esthétiques du mariage, mais Jonas s'incruste partout avec Pâte à crêpes, qui est, soyons honnêtes, très moche. Tu aurais pu la cacher juste le temps de faire de jolies photos de famille.",
    alibi: "« J'étais dans le jardin en train de faire des photos et des vidéos des invités. »",
    directive:
      "Utilise ton téléphone pour photographier les invités. Relais : dis aux mariés que Claire est très connectée aux énergies ce soir et qu'ils devraient lui parler de son anecdote.\n\nObjectifs :\n• Prendre 5 photos esthétiques de la soirée — Sans Pâte à crêpes au premier plan, idéalement.",
    relayTargetId: "claire",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« J'ai la preuve en vidéo que [X et Y] étaient avec moi dehors. Et sur ma vidéo, on entend un énorme bruit de fermeture éclair, BZZZT, venant de la salle ! »",
    hiddenRole: {
      name: "La Paparazzi",
      power: "Preuve photo/vidéo",
      description:
        "Tu peux « diffuser » une photo ou une vidéo de ton téléphone dans le chat de l'enquête.",
    },
  },
  {
    id: "antoine",
    code: "PAPA-008",
    name: "Antoine",
    profession: "Mari de Lénaïc — jeune papa mystérieux",
    image: antoineImg,
    isInvestigator: false,
    publicStory:
      "Le jeune papa aux intentions mystérieuses (et adepte des jouets simples). On t'a entendu chuchoter à la mairie qu'il y aurait « un super cadeau pour Roby » (ta fille) de retour du week-end. Tu préfères les jouets simples aux jeux éducatifs compliqués de Lénaïc — as-tu « emprunté » Pâte à crêpes pour ta fille ?",
    alibi:
      "« J'étais dans la salle de repos en train d'essayer de déplier ce satané lit parapluie pour Roby. »",
    directive:
      "Laisse planer le doute sur ton cadeau mystère. Relais : pour te dédouaner, suggère aux mariés d'aller sonder ta femme Lénaïc sur son anecdote.\n\nObjectifs :\n• Laisser planer le mystère sur ton cadeau pour Roby — Le plus longtemps possible.",
    relayTargetId: "lenaic",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Mon cadeau pour Roby c'est un train en bois ! Je n'ai pas touché à Pâte à crêpes. Par contre, j'ai cru entendre quelqu'un dire « Pousse-le, ça va coincer ! » près des cadeaux. »",
    hiddenRole: {
      name: "Le Papa Mystère",
      power: "Cadeau caché",
      description:
        "Tu peux faire croire au Maître du Jeu que ton cadeau mystérieux concerne quelqu'un d'autre — pour brouiller les pistes une fois.",
    },
  },
  {
    id: "lenaic",
    code: "MAMAN-009",
    name: "Lénaïc",
    profession: "Femme d'Antoine — éducatrice convaincue",
    image: lenaicImg,
    isInvestigator: false,
    publicStory:
      "Celle qui préfère les jeux éducatifs. Tu trouves que les peluches n'ont aucun intérêt pour le développement d'un enfant. Tu aurais pu faire disparaître Pâte à crêpes pour forcer Jonas à utiliser son cerveau avec des jeux de construction, de logique ou d'éveil bien plus intéressants.",
    alibi: "« J'étais en train d'écrire un beau mot pour Agathe et Lucas dans le livre d'or. »",
    directive:
      "Place tes remarques sur les jeux éducatifs. Relais : conseille aux mariés d'aller vérifier l'alibi d'Antoine en évoquant son anecdote.\n\nObjectifs :\n• Placer 2 remarques sur les jeux éducatifs — Devant les mariés idéalement.",
    relayTargetId: "antoine",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Je n'ai pas volé cette vieillerie. Mais si ça peut stimuler votre déduction : avez-vous remarqué qu'Eugénie porte un sac beaucoup trop volumineux pour un mariage ? »",
    hiddenRole: {
      name: "La Pédagogue",
      power: "Observation logique",
      description:
        "Tu peux demander au Maître du Jeu une indication factuelle (taille, couleur, position d'un objet visible).",
    },
  },
  {
    id: "leopold",
    code: "TONTON-010",
    name: "Léopold",
    profession: "Frère de Lucas — le tonton blagueur",
    image: leopoldImg,
    isInvestigator: false,
    publicStory:
      "Le frère farceur qui adore Jonas, mais qui veut absolument faire tomber son rival Gauthier. Kidnapper la peluche, c'est exactement le genre de stupidité que tu ferais pour rigoler. Ta vraie motivation ce soir, c'est ta compétition de « meilleur tonton » avec Gauthier.",
    alibi: "« J'étais en train de cacher du papier toilette dans la voiture des mariés. »",
    directive:
      "Glisse la fausse lettre de rançon. Accuse Gauthier sans relâche. Relais : pousse les mariés à aller voir Julie pour ses photos en mentionnant son anecdote.\n\nObjectifs :\n• Glisser la fausse lettre de rançon — Pendant l'entrée, discrètement.\n• Accuser Gauthier au moins 3 fois — Sans relâche.",
    relayTargetId: "julie",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Ok, la lettre de rançon c'était pour rire ! Je n'ai pas la peluche. Mais j'ai vu que le ticket de caisse du magasin de jouets retrouvé par terre était au nom d'Arthur… »",
    hiddenRole: {
      name: "Le Bouffon",
      power: "Fausse piste (1 fois)",
      description:
        "Tu peux glisser publiquement une fausse piste — sans contredire ce que dit le Maître du Jeu.",
    },
  },
  {
    id: "christelle",
    code: "MAMIE-011",
    name: "Mamie Christelle",
    profession: "Mère de Lucas — grand-mère « bisounours »",
    image: christelleImg,
    isInvestigator: false,
    publicStory:
      "La grand-mère bisounours qui veut que tout le monde soit heureux et qui couvre les amis. Tu adores Jonas et tu acceptais Pâte à crêpes. Mais tu détestes les conflits ! Tu as vu Arthur paniqué tout à l'heure, tu as compris qu'il avait fait une bêtise — comme tu l'aimes comme un fils, tu as décidé de brouiller les pistes pour lui.",
    alibi:
      "« J'étais en train de m'extasier sur la pièce montée avec le traiteur, tout est tellement merveilleux ! »",
    directive:
      "Dédramatise la situation à fond. Relais : pour protéger Arthur, oriente innocemment les mariés vers Papy Hervé en évoquant son anecdote.\n\nObjectifs :\n• Dédramatiser la situation à chaque accusation — Tu détestes les conflits.",
    relayTargetId: "herve",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Oh les enfants… Je sais qu'Arthur et Eugénie ont l'air coupables ce soir, mais c'est parce qu'ils vous préparaient une belle surprise qui a mal tourné, pardonnez-les. »",
    hiddenRole: {
      name: "La Médiatrice",
      power: "Apaisement",
      description:
        "Une fois dans la soirée, tu peux demander au Maître du Jeu d'interrompre une dispute publique entre deux invités.",
    },
  },
  {
    id: "claire",
    code: "MEDIUM-012",
    name: "Claire",
    profession: "Amie de la famille — médium fatiguée",
    image: claireImg,
    isInvestigator: false,
    publicStory:
      "La dormeuse mystique persuadée que Pâte à crêpes a pris vie. Tu n'as aucun mobile — tu adores Jonas. En revanche, tu es convaincue que les jouets ont une âme : Pâte à crêpes s'est éveillée ce soir, a estimé que son cycle avec Jonas était terminé, et est partie de son plein gré.",
    alibi:
      "« Je faisais une petite sieste spirituelle dans un fauteuil au fond de la salle pour me connecter aux énergies du lieu. »",
    directive:
      "Baille souvent. Dis qu'il faut laisser la peluche faire sa vie. Relais : dis que les astres recommandent d'aller interroger Mamie Christelle au sujet de son anecdote.\n\nObjectifs :\n• Parler de ton « aura mauve » au moins une fois en public — Que tout le monde t'entende.",
    relayTargetId: "christelle",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Je ressens les auras… L'aura de Pâte à crêpes est toujours dans cette pièce, mais elle est englobée et mangée par une autre aura plus sombre, munie d'une fermeture éclair. »",
    hiddenRole: {
      name: "La Médium",
      power: "Vision sur un objet (1 fois)",
      description:
        "Tu peux demander au Maître du Jeu une « vision » énigmatique sur un objet ou une personne. La réponse sera floue mais vraie.",
    },
  },
  {
    id: "victorine",
    code: "CORBEAU-013",
    name: "Victorine",
    profession: "Sœur d'Agathe — femme de Gauthier",
    image: victorineImg,
    isInvestigator: false,
    publicStory:
      "La sœur loyale en public… mais le mystérieux « Corbeau » en secret. Tu n'as pas touché à Pâte à crêpes. En revanche, tu es furieuse que tout le monde (et surtout Léopold) accuse ton mari Gauthier. Tu as aperçu Arthur et Eugénie paniquer autour d'un grand sac et tu as compris qu'ils étaient les vrais coupables.",
    alibi: "« J'étais en train de retoucher mon maquillage dans un coin un peu sombre. »",
    directive:
      "En secret : sois le Corbeau (fais passer des petits mots discrets). En public : défends Gauthier. Relais : pousse les mariés à acculer Gauthier en lui rappelant son anecdote.\n\nObjectifs :\n• Faire passer 3 mots du Corbeau aux mariés — Sans te faire prendre.\n• Défendre publiquement Gauthier — Il en a besoin face à Léopold.",
    relayTargetId: "gauthier",
    anecdoteHint: "—",
    keyPhrase: PLACEHOLDER_PHRASE,
    mainClue:
      "« Puisque tu me prends par les sentiments… Arrête de chercher du côté de Gauthier. Le vrai coupable est le parrain, et je sais qu'il a acheté une peluche géante récemment. »",
    hiddenRole: {
      name: "Le Corbeau",
      power: "Messages anonymes signés « Le Corbeau »",
      description:
        "Tu peux publier dans le chat des messages anonymes signés « Le Corbeau ». Personne ne doit deviner que c'est toi avant la fin.",
    },
  },
];

// ============== SECRETS ==============
export const secrets: Secret[] = [
  {
    id: "s-arthur-1",
    characterId: "arthur",
    title: "Le sac caché",
    description:
      "Tu sais exactement où est Pâte à crêpes : COINCÉ dans la bouche zippée du Croque-Souci, lui-même planqué dans le grand sac d'Eugénie sous la table 4.",
  },
  {
    id: "s-arthur-2",
    characterId: "arthur",
    title: "Le ticket de caisse",
    description:
      "Tu as un ticket froissé dans la poche intérieure de ta veste : « Le Paradis du Jouet — 1 Peluche CROQUE-SOUCI XXL — Payé par CB : ARTHUR ».",
  },
  {
    id: "s-eugenie-1",
    characterId: "eugenie",
    title: "La complice silencieuse",
    description:
      "Tu as aidé Arthur à forcer la fermeture éclair du Croque-Souci pour cacher Pâte à crêpes à l'intérieur. Tu transportes la preuve dans ton sac depuis.",
  },
  {
    id: "s-herve-1",
    characterId: "herve",
    title: "Suspect par dégoût",
    description:
      "Tu as menacé plusieurs fois de jeter Pâte à crêpes à la machine à 90°C. Tout le monde t'a entendu. Ton alibi est vrai mais difficile à prouver.",
  },
  {
    id: "s-gauthier-1",
    characterId: "gauthier",
    title: "La mauvaise couture",
    description:
      "Tu t'es assis sur Pâte à crêpes il y a un mois et tu l'as recousue avec du gros fil de pêche. Tu aurais pu vouloir effacer les preuves.",
  },
  {
    id: "s-julie-1",
    characterId: "julie",
    title: "La vidéo accidentelle",
    description:
      "Sur l'une de tes vidéos prises dans le jardin, on entend distinctement un grand « BZZZT » de fermeture éclair venant de la salle.",
  },
  {
    id: "s-antoine-1",
    characterId: "antoine",
    title: "Le cadeau mystère",
    description:
      "Ton cadeau mystérieux pour Roby est en réalité un train en bois. Mais tant que tu laisses planer le doute, tu détournes les soupçons.",
  },
  {
    id: "s-lenaic-1",
    characterId: "lenaic",
    title: "L'œil affûté",
    description:
      "Tu as remarqué qu'Eugénie surveille son grand sac de façon anormale depuis le début du cocktail. Tu n'as encore rien dit.",
  },
  {
    id: "s-leopold-1",
    characterId: "leopold",
    title: "La fausse rançon",
    description:
      "Tu vas glisser aux mariés une fausse lettre de rançon, juste pour rire. Aucun lien avec la vraie affaire — c'est une fausse piste assumée.",
  },
  {
    id: "s-leopold-2",
    characterId: "leopold",
    title: "Le ticket retrouvé",
    description:
      "Tu as discrètement ramassé un ticket de caisse du « Paradis du Jouet » au nom d'Arthur. Tu attends le bon moment pour t'en servir.",
  },
  {
    id: "s-christelle-1",
    characterId: "christelle",
    title: "La protectrice d'Arthur",
    description:
      "Tu as vu Arthur paniqué tout à l'heure. Tu as compris qu'il a fait une bêtise — tu décides de l'aider à brouiller les pistes.",
  },
  {
    id: "s-claire-1",
    characterId: "claire",
    title: "L'aura mauve",
    description:
      "Tu as VRAIMENT vu une peluche bizarre arriver dans un sac. Tu vas en parler à voix haute, mais en l'attribuant à ton sixième sens — personne ne va te prendre au sérieux.",
  },
  {
    id: "s-victorine-1",
    characterId: "victorine",
    title: "Le Corbeau, c'est toi",
    description:
      "Tu fais passer des petits mots anonymes signés « Le Corbeau » pour orienter l'enquête. Personne ne doit le découvrir avant la fin.",
  },
  {
    id: "s-victorine-2",
    characterId: "victorine",
    title: "Tu as vu la scène",
    description:
      "Tu as aperçu Arthur et Eugénie paniquer autour d'un grand sac. Tu sais que ce sont eux les coupables.",
  },
];

// ============== INVENTAIRE ==============
export const inventory: InventoryItem[] = [
  { id: "i-agathe-1", characterId: "agathe", name: "Carnet d'enquête", description: "Un joli carnet en cuir offert par Lucas." },
  { id: "i-agathe-2", characterId: "agathe", name: "Bout de bourre (indice n°1)", description: "Coton blanc retrouvé près du banc de Jonas." },
  { id: "i-lucas-1", characterId: "lucas", name: "Stylo plume de mariage", description: "Pour signer le registre — et prendre des notes." },
  { id: "i-arthur-1", characterId: "arthur", name: "Ticket de caisse froissé", description: "Le Paradis du Jouet. À PROTÉGER." },
  { id: "i-arthur-2", characterId: "arthur", name: "Mouchoir en tissu", description: "Tu transpires." },
  { id: "i-eugenie-1", characterId: "eugenie", name: "Grand sac en raphia", description: "Contient le Croque-Souci. Ne pas ouvrir devant les mariés." },
  { id: "i-herve-1", characterId: "herve", name: "Flacon de gel hydroalcoolique", description: "À sortir au moindre contact suspect." },
  { id: "i-gauthier-1", characterId: "gauthier", name: "Verre de punch (n°4)", description: "Bien rempli. Pour l'instant." },
  { id: "i-julie-1", characterId: "julie", name: "Smartphone — 30 photos, 5 vidéos", description: "Une vidéo contient un indice sonore décisif." },
  { id: "i-antoine-1", characterId: "antoine", name: "Lit parapluie démonté", description: "Bataille en cours dans la salle de repos." },
  { id: "i-lenaic-1", characterId: "lenaic", name: "Stylo doré et livre d'or", description: "Pour écrire un beau mot aux mariés." },
  { id: "i-leopold-1", characterId: "leopold", name: "Fausse lettre de rançon", description: "Pliée dans ta poche intérieure." },
  { id: "i-leopold-2", characterId: "leopold", name: "Ticket de caisse trouvé", description: "Au nom d'Arthur. Ramassé au sol." },
  { id: "i-christelle-1", characterId: "christelle", name: "Mouchoir parfumé", description: "Pour essuyer les larmes — ou faire diversion." },
  { id: "i-claire-1", characterId: "claire", name: "Petite peluche porte-bonheur", description: "Sirius, ton chat-talisman." },
  { id: "i-victorine-1", characterId: "victorine", name: "Carnet de mots du Corbeau", description: "3 petits papiers déjà rédigés." },
  { id: "i-victorine-2", characterId: "victorine", name: "Rouge à lèvres", description: "Couleur « bordeaux conspiratrice »." },
];

// ============== RELATIONS ==============
const REL = (sourceId: CharacterId, targetId: CharacterId, label: string, description: string): Relation => ({
  sourceId,
  targetId,
  label,
  description,
});

export const relations: Relation[] = [
  // Agathe (mariée) → tous les autres
  REL("agathe", "lucas", "Mon mari", "L'amour de ta vie."),
  REL("agathe", "arthur", "Parrain de Jonas", "Meilleur ami de Lucas. Il est nerveux aujourd'hui — pourquoi ?"),
  REL("agathe", "eugenie", "Marraine de Jonas", "Vieille amie. Elle surveille son sac un peu trop."),
  REL("agathe", "herve", "Mon beau-père", "Le père de Lucas. Maniaque mais réglo."),
  REL("agathe", "gauthier", "Mon beau-frère", "Mari de Victorine. Toujours un verre à la main."),
  REL("agathe", "julie", "Copine de Léopold", "Photographe amatrice. Toujours son téléphone à la main."),
  REL("agathe", "antoine", "Mari de Lénaïc", "Jeune papa. Un peu mystérieux ce soir."),
  REL("agathe", "lenaic", "Femme d'Antoine", "Pédagogue convaincue. Très observatrice."),
  REL("agathe", "leopold", "Mon beau-frère", "Le frère de Lucas. Blagueur compulsif."),
  REL("agathe", "christelle", "Ma belle-mère", "Maman de Lucas. Cœur sur la main."),
  REL("agathe", "claire", "Amie de la famille", "Médium fatiguée. Ses « auras » sont à prendre avec des pincettes… ou pas."),
  REL("agathe", "victorine", "Ma sœur", "Loyale et un peu théâtrale. Elle défend toujours Gauthier."),

  // Lucas (marié)
  REL("lucas", "agathe", "Ma femme", "Ta force tranquille."),
  REL("lucas", "arthur", "Mon meilleur ami", "Frère d'âme depuis la fac."),
  REL("lucas", "eugenie", "Marraine de Jonas", "Complice d'Arthur depuis l'enfance."),
  REL("lucas", "herve", "Mon père", "Tu connais sa manie de la propreté par cœur."),
  REL("lucas", "gauthier", "Mari de Victorine", "Beauf assumé. Toujours sympa."),
  REL("lucas", "julie", "Copine de Léopold", "Tu la connais peu mais elle est partout avec son téléphone."),
  REL("lucas", "antoine", "Ami de la famille", "Jeune papa, intentions floues ce soir."),
  REL("lucas", "lenaic", "Femme d'Antoine", "Pédagogue, très carrée."),
  REL("lucas", "leopold", "Mon frère", "Roi des blagues. Et de la guerre des tontons."),
  REL("lucas", "christelle", "Ma mère", "La meilleure maman du monde."),
  REL("lucas", "claire", "Vieille amie", "Médium attachante mais épuisante."),
  REL("lucas", "victorine", "Belle-sœur d'Agathe", "Femme de Gauthier. Mystérieuse ce soir."),

  // Arthur (coupable)
  REL("arthur", "lucas", "Mon meilleur ami", "Tu as menti à beaucoup de monde aujourd'hui, mais pas à lui — pour l'instant."),
  REL("arthur", "eugenie", "Ma complice", "Vous êtes dans la mouise ensemble. Restez soudés."),
  REL("arthur", "victorine", "La sœur d'Agathe", "Elle te fixe depuis l'apéro. Elle SAIT quelque chose."),

  // Eugénie (complice)
  REL("eugenie", "arthur", "Mon complice", "Inséparables depuis l'école primaire."),
  REL("eugenie", "agathe", "Mon amie de toujours", "Tu te sens TRÈS coupable."),

  // Hervé
  REL("herve", "lucas", "Mon fils", "Tu en es fier comme un coq."),
  REL("herve", "christelle", "Ma femme", "Vous formez le couple historique de la famille."),

  // Gauthier
  REL("gauthier", "victorine", "Ma femme", "Elle te défend en public, mais tu ignores qu'elle est le Corbeau."),
  REL("gauthier", "leopold", "Mon rival", "La guerre des tontons est officiellement déclarée."),

  // Julie
  REL("julie", "leopold", "Mon copain", "Tu le couvres dans ses blagues, mais avec lassitude."),

  // Antoine
  REL("antoine", "lenaic", "Ma femme", "Vous n'êtes pas d'accord sur les jouets de Roby."),

  // Lénaïc
  REL("lenaic", "antoine", "Mon mari", "Trop sympa, parfois trop discret."),

  // Léopold
  REL("leopold", "lucas", "Mon frère", "Tu l'adores et tu lui pourris la vie en même temps."),
  REL("leopold", "gauthier", "Mon rival", "Tu veux le détruire dans la guerre des tontons."),
  REL("leopold", "julie", "Ma copine", "Elle te trouve usant — mais drôle."),

  // Christelle
  REL("christelle", "lucas", "Mon fils", "Ton soleil."),
  REL("christelle", "herve", "Mon mari", "Tu encaisses sa manie de la propreté avec amour."),
  REL("christelle", "arthur", "Comme un fils", "Tu veux le protéger coûte que coûte."),

  // Claire — pas de relations fortes affichées (elle est « hors-sol »)
  REL("claire", "agathe", "Amie de la famille", "Tu lui as offert un attrape-rêves pour son mariage."),

  // Victorine
  REL("victorine", "agathe", "Ma sœur", "Tu la protèges en secret avec tes mots de Corbeau."),
  REL("victorine", "gauthier", "Mon mari", "Tu refuses qu'on l'accuse à tort."),
  REL("victorine", "arthur", "Le « parrain »", "Tu sais que c'est lui. Tu vas l'enfoncer subtilement."),
];

// ============== CHAT MOCK ==============
export const messages: ChatMessage[] = [
  {
    id: "m-0",
    senderId: "system",
    content: "🔔 Le drame de Pâte à crêpes vient d'être annoncé. L'enquête est ouverte.",
    mediaType: "text",
    timestamp: "19:42",
  },
  {
    id: "m-1",
    senderId: "agathe",
    content: "Mes très chers invités. Pâte à crêpes a disparu. Préparez vos meilleurs souvenirs — on va avoir besoin de tout le monde.",
    mediaType: "text",
    timestamp: "19:44",
  },
  {
    id: "m-2",
    senderId: "lucas",
    content: "Si quelqu'un a vu quelque chose, même un détail, c'est le moment.",
    mediaType: "text",
    timestamp: "19:45",
  },
  {
    id: "m-3",
    senderId: "claire",
    content: "Je SAVAIS que les peluches avaient une vie propre. J'ai senti une aura mauve depuis l'arrivée des invités !",
    mediaType: "text",
    timestamp: "19:47",
  },
  {
    id: "m-4",
    senderId: "leopold",
    content: "Bon, moi je dis que c'est la faute de Gauthier. Toujours suspect, un mec qui boit autant de punch.",
    mediaType: "text",
    timestamp: "19:48",
  },
  {
    id: "m-5",
    senderId: "gauthier",
    content: "Eh oh ! Je suis innocent moi ! Mon 4ème verre en témoigne 🍹",
    mediaType: "text",
    timestamp: "19:49",
  },
  {
    id: "m-6",
    senderId: "herve",
    content: "Franchement, cette peluche était un nid à microbes. Bon débarras.",
    mediaType: "text",
    timestamp: "19:50",
  },
  {
    id: "m-7",
    senderId: "arthur",
    content: "Quelle histoire incroyable… qui voudrait faire ça à un enfant ? Vraiment, j'en perds mes mots.",
    mediaType: "text",
    timestamp: "19:51",
  },
  {
    id: "m-8",
    senderId: "eugenie",
    content: "Restons calmes. Pâte à crêpes va sûrement réapparaître.",
    mediaType: "text",
    timestamp: "19:52",
  },
  {
    id: "m-9",
    senderId: "julie",
    content: "Je vérifie mes vidéos du jardin, je vous tiens au courant.",
    mediaType: "image",
    mediaUrl: "video-aperitif",
    mediaCaption: "Vidéo — Jardin (00:38)",
    timestamp: "19:53",
  },
  {
    id: "m-10",
    senderId: "corbeau",
    content: "Cherchez du côté de ceux qui faisaient un cadeau aujourd'hui. — Le Corbeau",
    mediaType: "text",
    timestamp: "19:55",
  },
  {
    id: "m-11",
    senderId: "christelle",
    content: "Allons, allons mes enfants, ne nous emportons pas. Tout va s'arranger.",
    mediaType: "text",
    timestamp: "19:57",
  },
  {
    id: "m-12",
    senderId: "lenaic",
    content: "Au passage, ce serait peut-être l'occasion d'introduire un jeu d'éveil à Jonas ?",
    mediaType: "text",
    timestamp: "19:58",
  },
];

// ============== TIMELINE GM ==============
export const timeline: TimelineStep[] = [
  {
    id: "t-1",
    title: "Étape 1 — L'Annonce",
    trigger: "À l'apéritif",
    description: "Annonce du drame au micro. Remise du bout de bourre (indice n°1) aux mariés.",
    status: "done",
  },
  {
    id: "t-2",
    title: "Étape 2 — La Fausse Piste",
    trigger: "Pendant l'entrée",
    description: "Léopold glisse aux mariés la fausse lettre de rançon (10 biberons de lait au chocolat).",
    status: "ready",
  },
  {
    id: "t-3",
    title: "Étape 3 — La Preuve Matérielle",
    trigger: "Au fromage / dessert",
    description: "Léopold ou Julie apporte le ticket de caisse du Paradis du Jouet au nom d'Arthur.",
    status: "locked",
  },
  {
    id: "t-4",
    title: "Étape 4 — L'Accusation Finale",
    trigger: "Avant le gâteau",
    description: "Les mariés désignent les coupables. Arthur craque, Eugénie sort le Croque-Souci. Révélation.",
    status: "locked",
  },
];

// ============== HELPERS ==============
export const charactersById: Record<CharacterId, Character> = Object.fromEntries(
  characters.map((c) => [c.id, c]),
) as Record<CharacterId, Character>;

export function findCharacterByCode(code: string): Character | undefined {
  const norm = code.trim().toUpperCase();
  return characters.find((c) => c.code.toUpperCase() === norm);
}

export function getSecretsFor(id: CharacterId) {
  return secrets.filter((s) => s.characterId === id);
}
export function getInventoryFor(id: CharacterId) {
  return inventory.filter((i) => i.characterId === id);
}
export function getRelationsFor(id: CharacterId) {
  return relations.filter((r) => r.sourceId === id);
}
export function getRelationBetween(sourceId: CharacterId, targetId: CharacterId) {
  return relations.find((r) => r.sourceId === sourceId && r.targetId === targetId);
}

export const GM_CODE = "GM-MAITRE-DU-JEU";
