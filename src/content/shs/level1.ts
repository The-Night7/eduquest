// SHS · niveau 1 : démarche de recherche (Quivy) et sources
import { pick } from "../../core/rng";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Order, gq, poolQcm, poolVF } from "../factories";

const STEPS = [
  "Étape 1 — La question de départ",
  "Étape 2 — L'exploration (lectures, entretiens exploratoires)",
  "Étape 3 — La problématique (hypothèses)",
  "Étape 4 — Le modèle d'analyse, l'échantillonnage et les modalités de recueil",
  "Étape 5 — L'observation : le recueil de l'information",
  "Étape 6 — L'analyse des informations",
  "Étape 7 — La conclusion",
] as const;

function stepsOrder(): RawQuestion {
  const start = pick([0, 1, 2]);
  const sol = STEPS.slice(start, start + 5);
  const decoys = pick([
    ["Rédiger la conclusion avant d'avoir recueilli les données", "Choisir la méthode avant d'avoir formulé la question"],
    ["Recueillir les données avant d'avoir construit le modèle d'analyse", "Ne jamais lire ce qui a déjà été écrit sur le sujet"],
  ]);
  return Order("Remets dans l'ordre ces étapes du manuel de recherche en sciences sociales (Quivy et Van Campenhoudt).", [...sol], decoys, "La collecte des données n'intervient qu'à l'étape 5 : les étapes 1 à 4 sont une phase préparatoire indispensable.");
}

const stepsQ = poolQcm([
  { q: "À quelle étape du manuel de Quivy intervient le recueil des données ?", r: "L'étape 5 (observation)", w: ["L'étape 1 (question de départ)", "L'étape 3 (problématique)", "L'étape 7 (conclusion)"], e: "Les quatre premières étapes sont préparatoires." },
  { q: "Que vise la problématique ?", r: "Formuler des hypothèses claires et plausibles à tester", w: ["Choisir le logiciel d'analyse", "Fixer la taille de l'échantillon", "Rédiger la bibliographie"], e: "Quels facteurs ont un effet sur tel phénomène ? On avance des hypothèses testables." },
  { q: "Pourquoi se donne-t-on des indicateurs ?", r: "Pour rendre les hypothèses mesurables ou au moins testables", w: ["Pour éviter de lire des articles", "Pour remplacer les hypothèses", "Pour choisir la couleur des graphiques"], e: "Un indicateur traduit un concept abstrait en observation." },
  { q: "Que sont des « sources primaires » ?", r: "Des sources de première main, non réélaborées par un chercheur", w: ["Les articles les plus cités", "Les ouvrages classiques", "Les résumés de cours"], e: "Exemple : un post de forum ou une conversation en ligne." },
  { q: "À quoi sert l'état de l'art ?", r: "À savoir ce qui a été fait et dit sur le sujet pour préciser son apport", w: ["À éviter toute lecture critique", "À copier la problématique d'un autre chercheur", "À remplacer le recueil de données"], e: "Entrer en dialogue avec les travaux existants." },
  { q: "Quelle est la bonne attitude de lecture ?", r: "Une lecture active et critique, avec diversité des points de vue", w: ["Ne retenir que les sources qui confirment son idée", "Lire uniquement des sources primaires", "Se limiter à un seul auteur"], e: "Diversifier les points de vue et se mettre à la place de l'autre." },
]);

const vf = poolVF([
  { q: "Le recueil des données est la toute première étape d'une enquête en sciences sociales.", t: false, e: "Il intervient à l'étape 5, après la question, l'exploration, la problématique et le modèle d'analyse." },
  { q: "Une problématique transforme la question de départ en hypothèses testables.", t: true, e: "Étape 3 du manuel de recherche." },
  { q: "Si l'enquête répond à la demande d'un tiers (un client), il est indispensable de bien comprendre ses objectifs.", t: true, e: "Question de départ / demande / objectifs." },
  { q: "Les entretiens exploratoires font partie de l'étape d'exploration.", t: true, e: "Lectures et entretiens exploratoires, étape 2." },
  { q: "Les revues de HAL, Cairn, Persée ou OpenEdition servent à trouver des articles de recherche.", t: true, e: "Plateformes d'articles et d'ouvrages en ligne." },
  { q: "L'INSEE et data.gouv.fr sont des sources de données sur la société.", t: true, e: "Sources statistiques publiques." },
]);

function planBug(): RawQuestion {
  return Bug(
    "Un étudiant prépare une enquête sur « les liens entre adolescents et réseaux sociaux ». Une ligne de son plan est à corriger.",
    [
      "1. Je précise ma question de départ et mes objectifs.",
      "2. Je lis des travaux existants et je mène quelques entretiens exploratoires.",
      "3. Je lance directement un questionnaire à 1000 personnes, puis je chercherai mes hypothèses.",
      "4. J'analyse les réponses, puis je conclus.",
    ],
    2,
    [
      "3. Je formule ma problématique et mes hypothèses, je construis mon modèle d'analyse, puis je choisis mon échantillon et mon mode de recueil.",
      "3. J'analyse les données avant de les recueillir.",
      "3. Je supprime l'exploration pour gagner du temps.",
    ],
    "Sans problématique ni modèle d'analyse, on recueille des données sans savoir quoi tester : les étapes 3 et 4 précèdent le recueil.",
  );
}

function guided(): RawQuestion {
  return Guided(
    "Question de départ : « Quels liens les adolescents ont-ils avec les réseaux sociaux ? » On veut la transformer en enquête.",
    [
      gq("Quelle étape vient juste après la question de départ ?", ["L'exploration (lectures, entretiens exploratoires)", "L'analyse des informations", "Le recueil des données", "La conclusion"], ["Avant de décider quoi mesurer, il faut savoir ce qui existe déjà."], "Étape 2 : l'exploration."),
      gq("Laquelle est une hypothèse testable ?", ["Plus un adolescent passe de temps sur les réseaux, moins il dort", "Les réseaux sociaux sont un phénomène moderne", "Les adolescents aiment internet", "Les réseaux sociaux existent"], ["Une hypothèse relie des facteurs et peut être confirmée ou infirmée."], "Elle relie deux variables mesurables."),
      gq("Quel indicateur mesure « le temps passé sur les réseaux » ?", ["Le nombre d'heures déclarées par jour", "L'avis de l'enseignant", "Le nombre de messages reçus par an", "Le prix du téléphone"], ["Un indicateur doit être mesurable et relié au concept."], "Un indicateur traduit le concept en observation."),
      gq("À quel moment collecte-t-on les données ?", ["Après la problématique et le modèle d'analyse", "Avant la question de départ", "À la place de l'exploration", "Après la conclusion"], ["Les étapes 1 à 4 sont préparatoires."], "À l'étape 5."),
    ],
    "Démarche : question → exploration → problématique/hypothèses → modèle et recueil → analyse → conclusion.",
  );
}

export const level: Level = {
  id: "SHS1",
  name: "Démarche de recherche",
  fiche: "Séance 2",
  icon: "🔎",
  color: "#9d4edd",
  gens: [["order", stepsOrder], ["steps", stepsQ], ["vf", vf], ["plan-bug", planBug], ["guided", guided]],
  piege: "On ne recueille pas avant d'avoir une problématique, des hypothèses et un modèle d'analyse : la collecte est l'étape 5.",
  rappel: [
    "Quivy : 1 question de départ, 2 exploration, 3 problématique, 4 modèle d'analyse + échantillon + recueil, 5 observation, 6 analyse, 7 conclusion.",
    "État de l'art : dialoguer avec les travaux existants ; lecture active et critique ; sources primaires vs travaux de chercheurs.",
    "Hypothèses claires et plausibles, testées par des indicateurs mesurables.",
  ],
};
