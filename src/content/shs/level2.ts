// SHS · niveau 2 : méthodes quantitatives et qualitatives
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Order, gq, poolQcm, poolVF } from "../factories";

const classify = poolQcm([
  { q: "Approche extensive, grand nombre d'enquêtés, questions standardisées : de quelle famille de méthodes s'agit-il ?", r: "Quantitative", w: ["Qualitative", "Ni l'une ni l'autre", "Uniquement documentaire"], e: "Quantitatif : extensif, standardisé, recherche de fréquences et de liaisons." },
  { q: "Approche intensive, petit nombre d'enquêtés, questionnement ouvert, recherche de sens : quelle famille ?", r: "Qualitative", w: ["Quantitative", "Statistique", "Aucune"], e: "Qualitatif : intensif, ouvert, exploration, saturation de l'information." },
  { q: "Un questionnaire fermé passé à 2000 personnes relève plutôt de…", r: "L'approche quantitative", w: ["L'entretien semi-dirigé", "L'observation participante", "Le focus group"], e: "Standardisation et grand échantillon." },
  { q: "Un entretien semi-dirigé avec 12 personnes relève plutôt de…", r: "L'approche qualitative", w: ["L'approche quantitative", "Le sondage d'opinion", "L'analyse statistique de bases"], e: "Petit nombre, questionnement ouvert." },
  { q: "Quelle est la finalité principale d'un entretien exploratoire ?", r: "Découvrir des dimensions du sujet auxquelles on n'avait pas pensé", w: ["Obtenir un échantillon représentatif", "Mesurer des fréquences", "Valider définitivement une hypothèse"], e: "Il alimente la problématique avant la construction du modèle." },
]);

const quali = poolQcm([
  { q: "Laquelle n'est PAS une méthode de collecte qualitative citée en cours ?", r: "Le questionnaire standardisé en ligne à grande échelle", w: ["L'entretien individuel", "Le focus group", "L'observation"], e: "Qualitatives : entretien (directif, semi-dirigé, ouvert), focus group, étude documentaire, observation." },
  { q: "Qu'est-ce qu'un focus group ?", r: "Un entretien de groupe", w: ["Un questionnaire anonyme", "Une base de données publique", "Une expérience de laboratoire"], e: "Entretien collectif animé par un chercheur." },
  { q: "Que signifie la « saturation de l'information » ?", r: "De nouveaux entretiens n'apportent plus d'éléments nouveaux", w: ["Les données sont trop nombreuses pour être stockées", "Les enquêtés refusent de répondre", "Le questionnaire est trop long"], e: "Critère d'arrêt courant des enquêtes qualitatives." },
]);

const vf = poolVF([
  { q: "Les méthodes qualitatives visent le même degré de représentativité statistique que les méthodes quantitatives.", t: false, e: "Elles cherchent le sens et l'exploration, pas la représentativité." },
  { q: "Les méthodes quantitatives supposent qu'on sache déjà quelles questions poser.", t: true, e: "Standardisation des questions." },
  { q: "Les deux familles de méthodes sont complémentaires.", t: true, e: "Par exemple : entretiens exploratoires puis questionnaire." },
  { q: "Une méthode est bonne dans l'absolu, quel que soit le sujet.", t: false, e: "Le choix dépend de la question de recherche et des hypothèses." },
  { q: "Avec peu d'enquêtés, on peut malgré tout approfondir leur point de vue.", t: true, e: "C'est l'atout de l'approche intensive." },
]);

function methodBug(): RawQuestion {
  return Bug(
    "Une équipe veut connaître la proportion d'étudiants qui utilisent un outil numérique donné. Une ligne de son choix de méthode est fausse.",
    [
      "Objectif : mesurer une fréquence dans une population.",
      "On cherche donc un grand nombre d'enquêtés pour des résultats généralisables.",
      "On choisit alors cinq entretiens ouverts très longs.",
      "On analysera ensuite les réponses avec des statistiques.",
    ],
    2,
    [
      "On choisit alors un questionnaire standardisé administré à un large échantillon.",
      "On choisit alors un seul focus group.",
      "On choisit alors de ne pas recueillir de données.",
    ],
    "Mesurer une fréquence demande une approche quantitative (questionnaire, grand échantillon), pas des entretiens ouverts.",
  );
}

function mixedOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre une enquête qui combine les deux approches.",
    [
      "Entretiens exploratoires qualitatifs pour repérer les dimensions du sujet.",
      "Construction d'hypothèses et d'indicateurs à partir de ces entretiens.",
      "Questionnaire standardisé passé à un large échantillon.",
      "Analyse statistique, puis retour aux verbatims pour interpréter les résultats.",
    ],
    ["Questionnaire sans aucune exploration préalable, puis entretiens pour justifier les questions.", "Conclusion avant l'analyse."],
    "Complémentarité : le qualitatif explore et donne du sens, le quantitatif mesure et généralise.",
  );
}

function methodGuided(): RawQuestion {
  return Guided(
    "Hypothèse : « plus un étudiant travaille en groupe, meilleurs sont ses résultats ». On doit choisir un dispositif d'enquête.",
    [
      gq("Que cherche-t-on à établir ?", ["Une liaison entre deux variables mesurables", "Le sens subjectif que donne chaque étudiant", "Une histoire de vie", "Une description sans chiffre"], ["Relier « travail en groupe » et « résultats »."], "Une liaison : approche quantitative."),
      gq("Quelle méthode est la plus adaptée ?", ["Questionnaire standardisé + notes", "Un seul entretien ouvert", "Observation d'une seule classe pendant un jour", "Un focus group de trois personnes"], ["Il faut un nombre suffisant d'enquêtés."], "Grand échantillon et questions standardisées."),
      gq("Que faire pour comprendre POURQUOI le groupe aide (ou pas) ?", ["Compléter par des entretiens qualitatifs", "Augmenter encore l'échantillon", "Supprimer l'hypothèse", "Ne rien faire"], ["Les chiffres montrent le « combien », pas le « pourquoi »."], "Complémentarité quanti/quali."),
    ],
    "Retenir : mesurer → quanti ; comprendre/explorer → quali ; combiner quand c'est possible.",
  );
}

export const level: Level = {
  id: "SHS2",
  name: "Quantitatif & qualitatif",
  fiche: "Séance 2",
  icon: "📊",
  color: "#7b2cbf",
  gens: [["classify", classify], ["quali", quali], ["vf", vf], ["method-bug", methodBug], ["mixed-order", mixedOrder], ["method-guided", methodGuided]],
  piege: "Quantitatif = mesurer et généraliser (extensif) ; qualitatif = comprendre et explorer (intensif). Les deux se complètent.",
  rappel: [
    "Quantitatif : approche extensive, grand nombre d'enquêtés, questions standardisées, fréquences et liaisons.",
    "Qualitatif : approche intensive, petit nombre d'enquêtés, questionnement ouvert, sens, exploration, saturation.",
    "Méthodes qualitatives : entretien (directif, semi-dirigé, ouvert), focus group, étude documentaire, observation.",
  ],
};
