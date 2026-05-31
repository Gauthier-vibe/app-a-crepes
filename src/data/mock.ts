import agatheImg from "@/assets/characters/agathe.jpg";
import lucasImg from "@/assets/characters/lucas.jpg";
import arthurImg from "@/assets/characters/arthur.jpg";
import eugenieImg from "@/assets/characters/eugenie.jpg";
import victorineImg from "@/assets/characters/victorine.jpg";
import leopoldImg from "@/assets/characters/leopold.jpg";
import claireImg from "@/assets/characters/claire.jpg";
import gauthierImg from "@/assets/characters/gauthier.jpg";
import jonasImg from "@/assets/characters/jonas.jpg";

export type CharacterId =
  | "agathe"
  | "lucas"
  | "arthur"
  | "eugenie"
  | "victorine"
  | "leopold"
  | "claire"
  | "gauthier"
  | "jonas";

export type ObjectiveStatus = "pending" | "done" | "failed";

export interface HiddenRole {
  name: string;
  power: string;
  description: string;
}

export interface Character {
  id: CharacterId;
  code: string;
  name: string;
  fullName: string;
  profession: string;
  image: string;
  isInvestigator: boolean;
  isCulprit?: boolean;
  publicStory: string;
  anecdoteHint: string; // thème de l'anecdote à glisser aux mariés
  keyPhrase: string; // phrase clé que les enquêteurs doivent prononcer
  mainClue: string; // indice principal débloqué par l'anecdote
  hiddenRole: HiddenRole;
}

export interface Secret {
  id: string;
  characterId: CharacterId;
  title: string;
  description: string;
}

export interface Objective {
  id: string;
  characterId: CharacterId;
  title: string;
  description: string;
  status: ObjectiveStatus;
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
  label: string; // ex: "Cousin", "Vieil ami", "Rival"
  description: string; // ce que la source sait/pense de la cible
}

export type MediaType = "text" | "image" | "video";

export interface ChatMessage {
  id: string;
  senderId: CharacterId | "system" | "corbeau";
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  mediaCaption?: string;
  timestamp: string; // HH:mm
}

export interface TimelineStep {
  id: string;
  title: string;
  trigger: string;
  description: string;
  status: "locked" | "ready" | "done";
}

export const characters: Character[] = [
  {
    id: "agathe",
    code: "MARIEE-001",
    name: "Agathe",
    fullName: "Agathe Lemoine",
    profession: "La mariée — enquêtrice en chef",
    image: agatheImg,
    isInvestigator: true,
    publicStory:
      "Mariée du jour, maman de Jonas. Tu te marierais bien tous les jours si tu pouvais, sauf que là, le drame de Pâte à crêpes te brise le cœur. Tu es organisée, intuitive et tu n'aimes pas qu'on touche aux affaires de ton fils.",
    anecdoteHint: "—",
    keyPhrase: "—",
    mainClue: "Tu reçois les indices au fur et à mesure.",
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
    fullName: "Lucas Vasseur",
    profession: "Le marié — enquêteur en chef",
    image: lucasImg,
    isInvestigator: true,
    publicStory:
      "Marié du jour, papa de Jonas. Cartésien, méthodique, légèrement dépassé par les émotions de la journée. Tu veux retrouver Pâte à crêpes avant le gâteau coûte que coûte.",
    anecdoteHint: "—",
    keyPhrase: "—",
    mainClue: "Tu reçois les indices au fur et à mesure.",
    hiddenRole: {
      name: "Enquêteur en chef",
      power: "Carnet d'enquête et liste des indices révélés",
      description:
        "Tu peux noter tes hypothèses et consulter chaque indice clé débloqué par les invités.",
    },
  },
  {
    id: "arthur",
    code: "PARRAIN-003",
    name: "Arthur",
    fullName: "Arthur Delcourt",
    profession: "Parrain de Jonas — architecte",
    image: arthurImg,
    isInvestigator: false,
    isCulprit: true,
    publicStory:
      "Meilleur ami de Lucas depuis la fac. Tu as un talent pour les idées brillantes… et pour les catastrophes. Aujourd'hui, tu transpires beaucoup. Beaucoup trop.",
    anecdoteHint: "La fois où tu as cassé le vase chinois de la grand-mère de Lucas.",
    keyPhrase: "« Tu te souviens du vase chinois de Mémé Victorine ? »",
    mainClue:
      "Tu avoues à demi-mot que tu as fait des courses ce matin pour 'une surprise' à Jonas, mais tu refuses d'en dire plus.",
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
    fullName: "Eugénie Brossard",
    profession: "Marraine de Jonas — psychologue",
    image: eugenieImg,
    isInvestigator: false,
    isCulprit: true,
    publicStory:
      "Marraine attentionnée, complice d'Arthur dans toutes ses bêtises depuis l'enfance. Tu as toujours un grand sac avec toi aujourd'hui — ne demande pas pourquoi.",
    anecdoteHint: "Tes vacances en Bretagne avec Agathe quand vous aviez 17 ans.",
    keyPhrase: "« Tu te souviens de notre été en Bretagne, à 17 ans ? »",
    mainClue:
      "Tu laisses entendre que 'parfois les vieilles choses doivent céder la place aux nouvelles'. Tu surveilles ton sac en permanence.",
    hiddenRole: {
      name: "La Complice",
      power: "Bouclier (1 fois)",
      description:
        "Tu peux bloquer publiquement une accusation portée contre Arthur en lui fournissant un alibi. Une seule fois dans la soirée.",
    },
  },
  {
    id: "victorine",
    code: "CORBEAU-005",
    name: "Victorine",
    fullName: "Victorine Aubry",
    profession: "Grand-mère de Lucas",
    image: victorineImg,
    isInvestigator: false,
    publicStory:
      "Mémé Victorine, 72 ans, langue acérée et œil de lynx. Tu vois tout, tu sais tout, tu n'en perds pas une miette depuis ton fauteuil près de la table d'honneur.",
    anecdoteHint: "Le dimanche où Lucas a 'emprunté' ta voiture sans permis à 16 ans.",
    keyPhrase: "« Mémé, raconte-nous la fois où j'ai pris ta voiture sans permis… »",
    mainClue:
      "Tu glisses aux mariés : « Cherchez du côté de ceux qui faisaient un cadeau aujourd'hui… et regardez bien sous les tables. »",
    hiddenRole: {
      name: "Le Corbeau",
      power: "Messages anonymes signés « Le Corbeau »",
      description:
        "Tu peux publier dans le chat des messages anonymes signés « Le Corbeau ». Personne ne doit deviner que c'est toi avant la fin.",
    },
  },
  {
    id: "leopold",
    code: "TEMOIN-006",
    name: "Léopold",
    fullName: "Léopold Marchand",
    profession: "Oncle d'Agathe — antiquaire",
    image: leopoldImg,
    isInvestigator: false,
    publicStory:
      "Antiquaire bavard, oncle préféré d'Agathe, blagueur compulsif. Tu adores les mises en scène et les fausses pistes — surtout en soirée.",
    anecdoteHint: "Le baptême où tu as fait croire à toute la famille que tu avais perdu Jonas.",
    keyPhrase: "« Tonton, raconte le baptême de Jonas… »",
    mainClue:
      "Tu glisses discrètement une fausse lettre de rançon : « 10 biberons de lait au chocolat sous la table du DJ, sinon Pâte à crêpes finira au four. »",
    hiddenRole: {
      name: "Le Bouffon",
      power: "Fausse piste (1 fois)",
      description:
        "Tu peux glisser publiquement une fausse piste — sans contredire ce que dit le Maître du Jeu. Idéale pendant l'entrée.",
    },
  },
  {
    id: "claire",
    code: "TEMOIN-007",
    name: "Claire",
    fullName: "Claire Fontaine",
    profession: "Cousine d'Agathe — illustratrice",
    image: claireImg,
    isInvestigator: false,
    publicStory:
      "Cousine artiste, légèrement excentrique, persuadée que les peluches ont une âme. Tu l'as dit à tout le monde au moins trois fois aujourd'hui.",
    anecdoteHint: "Le réveillon où tu as fait un dessin de toute la famille en animaux totems.",
    keyPhrase: "« Claire, tu te souviens de tes dessins en animaux totems ? »",
    mainClue:
      "Tu jures avoir vu « une aura sombre » autour d'une nouvelle peluche que tu n'as jamais vue avant. Tu peux décrire sa forme : une grande bouche zippée.",
    hiddenRole: {
      name: "La Médium",
      power: "Vision sur un objet (1 fois)",
      description:
        "Tu peux demander au Maître du Jeu une « vision » énigmatique sur un objet ou une personne. La réponse sera floue mais vraie.",
    },
  },
  {
    id: "gauthier",
    code: "TEMOIN-008",
    name: "Gauthier",
    fullName: "Gauthier Lemoine",
    profession: "Frère d'Agathe — pharmacien",
    image: gauthierImg,
    isInvestigator: false,
    publicStory:
      "Frère discret d'Agathe, observateur, plutôt timide. Tu as filmé une bonne partie de l'apéritif avec ton téléphone — par pur réflexe d'oncle.",
    anecdoteHint: "L'été où tu as appris à faire du vélo à Agathe (et où tu l'as fait tomber).",
    keyPhrase: "« Gauthier, tu te rappelles quand tu m'as appris à faire du vélo ? »",
    mainClue:
      "Sur une vidéo prise au cocktail, on aperçoit en arrière-plan Arthur entrant dans la salle de réception avec un grand sac en papier.",
    hiddenRole: {
      name: "Le Témoin Silencieux",
      power: "Diffusion de preuve vidéo",
      description:
        "Tu détiens une preuve filmée. Si on te le demande, tu peux la « diffuser » dans le chat en envoyant la vignette vidéo.",
    },
  },
  {
    id: "jonas",
    code: "JONAS-009",
    name: "Jonas",
    fullName: "Jonas Vasseur",
    profession: "Fils d'Agathe et Lucas — 5 ans, propriétaire de Pâte à crêpes",
    image: jonasImg,
    isInvestigator: false,
    publicStory:
      "Tu as 5 ans. Pâte à crêpes a disparu et c'est le pire jour de ta vie. Tu te souviens juste qu'Arthur t'a fait un gros câlin ce matin en disant : « J'ai une surprise pour toi tout à l'heure. »",
    anecdoteHint: "—",
    keyPhrase: "« Jonas, mon cœur, raconte-nous ta journée avec parrain Arthur. »",
    mainClue:
      "Tu te rappelles que la dernière fois que tu as vu Pâte à crêpes, il était posé sur le banc à côté du sac d'Arthur.",
    hiddenRole: {
      name: "L'Innocent",
      power: "Parole d'enfant",
      description:
        "Quand tu accuses quelqu'un, ta parole vaut double : les adultes te croient plus facilement.",
    },
  },
];

export const secrets: Secret[] = [
  {
    id: "s-arthur-1",
    characterId: "arthur",
    title: "Le sac caché",
    description:
      "Tu sais exactement où est Pâte à crêpes : COINCÉ dans la bouche zippée du Croque-Souci, lui-même planqué dans le grand sac d'Eugénie sous la table 4. Tu pries pour que personne ne le découvre avant le dessert.",
  },
  {
    id: "s-arthur-2",
    characterId: "arthur",
    title: "Le ticket de caisse",
    description:
      "Tu as un ticket froissé dans la poche intérieure de ta veste : « Le Paradis du Jouet — 1 Peluche CROQUE-SOUCI XXL — Payé par CB : ARTHUR ». Tu n'as pas pensé à le jeter.",
  },
  {
    id: "s-eugenie-1",
    characterId: "eugenie",
    title: "La complice silencieuse",
    description:
      "Tu as aidé Arthur à forcer la fermeture éclair du Croque-Souci pour cacher Pâte à crêpes à l'intérieur. Tu transportes la 'preuve' dans ton sac depuis. Tu fais profil bas.",
  },
  {
    id: "s-victorine-1",
    characterId: "victorine",
    title: "Le Corbeau, c'est toi",
    description:
      "Tu as décidé toute seule de faire avancer l'enquête en glissant des petits mots anonymes signés « Le Corbeau ». Tu adores ça. Personne ne doit le savoir avant la fin.",
  },
  {
    id: "s-leopold-1",
    characterId: "leopold",
    title: "La fausse rançon",
    description:
      "Tu vas glisser aux mariés une fausse lettre de rançon pendant l'entrée, juste pour rire. Aucun lien avec la vraie affaire — c'est une fausse piste assumée.",
  },
  {
    id: "s-claire-1",
    characterId: "claire",
    title: "L'aura mauve",
    description:
      "Tu as VRAIMENT vu une peluche bizarre arriver dans un sac. Tu vas en parler à voix haute, mais en l'attribuant à ton sixième sens — personne ne va te prendre au sérieux.",
  },
  {
    id: "s-gauthier-1",
    characterId: "gauthier",
    title: "La vidéo de l'apéro",
    description:
      "Sans le faire exprès, tu as filmé Arthur entrant avec un grand sac. Si quelqu'un te demande de revoir tes vidéos, l'enquête fera un grand pas.",
  },
  {
    id: "s-jonas-1",
    characterId: "jonas",
    title: "Le câlin suspect",
    description:
      "Arthur, ton parrain, t'a fait un câlin TRÈS LONG ce matin en disant « J'ai une surprise pour toi tout à l'heure ». Tu trouvais ça bizarre.",
  },
];

export const objectives: Objective[] = [
  // Mariés
  { id: "o-agathe-1", characterId: "agathe", title: "Retrouver Pâte à crêpes avant le gâteau", description: "C'est ta mission principale.", status: "pending" },
  { id: "o-agathe-2", characterId: "agathe", title: "Faire parler chaque invité avec une anecdote", description: "Chaque souvenir personnel débloque un indice.", status: "pending" },
  { id: "o-agathe-3", characterId: "agathe", title: "Désigner le ou les coupables avant le dessert", description: "Avec ou sans certitude.", status: "pending" },
  { id: "o-lucas-1", characterId: "lucas", title: "Soutenir Agathe dans l'enquête", description: "Et garder ton sang-froid.", status: "pending" },
  { id: "o-lucas-2", characterId: "lucas", title: "Ne pas pleurer pendant ton discours", description: "Bonne chance.", status: "pending" },
  // Coupables
  { id: "o-arthur-1", characterId: "arthur", title: "Ne JAMAIS avouer ce qui s'est passé", description: "Sauf si tu craques sous la pression finale.", status: "pending" },
  { id: "o-arthur-2", characterId: "arthur", title: "Garder le ticket de caisse hors de vue", description: "Idéalement, le déchirer si possible.", status: "pending" },
  { id: "o-eugenie-1", characterId: "eugenie", title: "Surveiller le grand sac en permanence", description: "Il contient le Croque-Souci.", status: "pending" },
  { id: "o-eugenie-2", characterId: "eugenie", title: "Protéger Arthur s'il commence à craquer", description: "Il craque toujours.", status: "pending" },
  // Témoins
  { id: "o-victorine-1", characterId: "victorine", title: "Faire passer 3 mots du Corbeau aux mariés", description: "Sans te faire prendre.", status: "pending" },
  { id: "o-leopold-1", characterId: "leopold", title: "Glisser la fausse lettre de rançon", description: "Pendant l'entrée, discrètement.", status: "pending" },
  { id: "o-claire-1", characterId: "claire", title: "Parler de ton 'aura mauve' au moins une fois en public", description: "Que tout le monde t'entende.", status: "pending" },
  { id: "o-gauthier-1", characterId: "gauthier", title: "Montrer ta vidéo si on te le demande", description: "Mais seulement si on te le demande.", status: "pending" },
  { id: "o-jonas-1", characterId: "jonas", title: "Raconter le câlin bizarre de parrain Arthur", description: "Si Maman ou Papa te pose la question.", status: "pending" },
];

export const inventory: InventoryItem[] = [
  { id: "i-agathe-1", characterId: "agathe", name: "Carnet d'enquête", description: "Un joli carnet en cuir offert par Lucas." },
  { id: "i-agathe-2", characterId: "agathe", name: "Bout de bourre (indice n°1)", description: "Coton blanc retrouvé près du banc de Jonas." },
  { id: "i-lucas-1", characterId: "lucas", name: "Stylo plume de mariage", description: "Pour signer le registre — et prendre des notes." },
  { id: "i-arthur-1", characterId: "arthur", name: "Ticket de caisse froissé", description: "Le Paradis du Jouet. À PROTÉGER." },
  { id: "i-arthur-2", characterId: "arthur", name: "Mouchoir en tissu", description: "Tu transpires." },
  { id: "i-eugenie-1", characterId: "eugenie", name: "Grand sac en raphia", description: "Contient le Croque-Souci. Ne pas ouvrir devant les mariés." },
  { id: "i-victorine-1", characterId: "victorine", name: "Carnet de mots du Corbeau", description: "3 petits papiers déjà rédigés." },
  { id: "i-leopold-1", characterId: "leopold", name: "Fausse lettre de rançon", description: "Pliée dans ta poche intérieure." },
  { id: "i-claire-1", characterId: "claire", name: "Petite peluche porte-bonheur", description: "Sirius, ton chat-talisman." },
  { id: "i-gauthier-1", characterId: "gauthier", name: "Téléphone (3 vidéos de l'apéro)", description: "Une contient un indice involontaire." },
  { id: "i-jonas-1", characterId: "jonas", name: "Place de Pâte à crêpes (vide)", description: "Son petit oreiller préféré, désespérément vide." },
];

const REL = (sourceId: CharacterId, targetId: CharacterId, label: string, description: string): Relation => ({
  sourceId,
  targetId,
  label,
  description,
});

export const relations: Relation[] = [
  // Agathe
  REL("agathe", "lucas", "Mon mari", "L'amour de ta vie. Tu sais qu'il craque pour les beaux discours larmoyants."),
  REL("agathe", "jonas", "Mon fils", "Ton petit prince. Pâte à crêpes est sa raison de vivre."),
  REL("agathe", "gauthier", "Mon frère", "Discret mais loyal. Il filme tout, tu le sais."),
  REL("agathe", "leopold", "Mon oncle", "Adorable mais blagueur — méfiance pendant l'enquête."),
  REL("agathe", "claire", "Ma cousine", "Géniale mais farfelue. Ses 'auras' sont à prendre avec des pincettes… ou pas."),
  REL("agathe", "eugenie", "La marraine de Jonas", "Tu l'aimes énormément. Vous avez partagé des vacances inoubliables en Bretagne à 17 ans."),
  REL("agathe", "arthur", "Le parrain de Jonas", "Meilleur ami de Lucas. Il est nerveux aujourd'hui — pourquoi ?"),
  REL("agathe", "victorine", "Belle-grand-mère", "Mémé Victorine. Elle voit tout, elle entend tout."),
  // Lucas
  REL("lucas", "agathe", "Ma femme", "Ta force tranquille."),
  REL("lucas", "arthur", "Mon meilleur ami", "Frère d'âme depuis la fac. Vous avez cassé un vase chinois ensemble — il s'en souvient encore."),
  REL("lucas", "eugenie", "Marraine de Jonas", "Vieille amie d'Arthur, complice de toutes ses bêtises."),
  REL("lucas", "victorine", "Ma grand-mère", "Mémé qui t'a appris à conduire (mal). Elle adore raconter cette histoire."),
  REL("lucas", "jonas", "Mon fils", "Sans Pâte à crêpes il ne dort pas. Tu dois le retrouver."),
  // Arthur
  REL("arthur", "lucas", "Mon meilleur ami", "Tu as menti à beaucoup de monde aujourd'hui, mais pas à lui — pour l'instant."),
  REL("arthur", "eugenie", "Complice de toujours", "Vous êtes dans la mouise ensemble. Restez soudés."),
  REL("arthur", "jonas", "Mon filleul", "Tu l'aimes comme un fils. Tu voulais lui faire la plus belle surprise du monde."),
  REL("arthur", "victorine", "La grand-mère de Lucas", "Elle te fixe depuis l'apéro. Elle SAIT."),
  // Eugénie
  REL("eugenie", "arthur", "Mon complice", "Inséparables depuis l'école primaire."),
  REL("eugenie", "agathe", "Mon amie de toujours", "Vous avez vécu un été magique en Bretagne à 17 ans."),
  REL("eugenie", "jonas", "Mon filleul", "Adorable petit garçon. Tu te sens TRÈS coupable."),
  // Victorine
  REL("victorine", "lucas", "Mon petit-fils chéri", "Tu connais toutes ses bêtises."),
  REL("victorine", "arthur", "Le 'meilleur ami'", "Tu ne l'as jamais vraiment porté dans ton cœur. Trop agité."),
  REL("victorine", "eugenie", "La marraine", "Elle change de sac trois fois par fête. Suspect."),
  // Léopold
  REL("leopold", "agathe", "Ma nièce préférée", "Tu adores la faire enrager (gentiment)."),
  REL("leopold", "jonas", "Mon petit-neveu", "Tu as déjà fait croire qu'on l'avait perdu à son baptême. Toujours rigolo."),
  // Claire
  REL("claire", "agathe", "Ma cousine", "Tu lui as offert un attrape-rêves pour son mariage."),
  REL("claire", "jonas", "Mon petit cousin", "Tu lui parles aux peluches depuis sa naissance."),
  // Gauthier
  REL("gauthier", "agathe", "Ma sœur", "Tu lui fais une vidéo souvenir."),
  REL("gauthier", "jonas", "Mon neveu", "Tu es son tonton préféré (à part Arthur)."),
  // Jonas
  REL("jonas", "agathe", "Maman", "La plus belle du monde."),
  REL("jonas", "lucas", "Papa", "Le plus fort du monde."),
  REL("jonas", "arthur", "Parrain", "Il sent bizarre aujourd'hui. Et il fait des câlins trop longs."),
  REL("jonas", "eugenie", "Marraine", "Elle a un sac TRÈS grand aujourd'hui."),
];

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
    content: "Bon, moi je dis que c'est la faute du DJ. Toujours suspect, un DJ.",
    mediaType: "text",
    timestamp: "19:48",
  },
  {
    id: "m-5",
    senderId: "victorine",
    content: "Hmm.",
    mediaType: "text",
    timestamp: "19:49",
  },
  {
    id: "m-6",
    senderId: "arthur",
    content: "Quelle histoire incroyable… qui voudrait faire ça à un enfant ? Vraiment, j'en perds mes mots.",
    mediaType: "text",
    timestamp: "19:50",
  },
  {
    id: "m-7",
    senderId: "eugenie",
    content: "Restons calmes. Pâte à crêpes va sûrement réapparaître.",
    mediaType: "text",
    timestamp: "19:51",
  },
  {
    id: "m-8",
    senderId: "gauthier",
    content: "J'ai filmé l'apéro si ça peut aider. Je revérifie.",
    mediaType: "image",
    mediaUrl: "video-aperitif",
    mediaCaption: "Vidéo — Apéritif (00:42)",
    timestamp: "19:53",
  },
  {
    id: "m-9",
    senderId: "corbeau",
    content: "Cherchez du côté de ceux qui faisaient un cadeau aujourd'hui. — Le Corbeau",
    mediaType: "text",
    timestamp: "19:55",
  },
  {
    id: "m-10",
    senderId: "jonas",
    content: "papa il sent bizar parrain",
    mediaType: "text",
    timestamp: "19:58",
  },
];

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
    description: "Un invité apporte aux mariés le ticket de caisse froissé du Paradis du Jouet.",
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
export function getObjectivesFor(id: CharacterId) {
  return objectives.filter((o) => o.characterId === id);
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
