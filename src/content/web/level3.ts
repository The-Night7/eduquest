// Informatique 4 · niveau 3 : PHP, AJAX, jQuery
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolQcm, poolVF } from "../factories";
import { code } from "../algo/util";

function phpArray(): RawQuestion {
  const a = Array.from({ length: ri(3, 5) }, () => ri(1, 9));
  const i = ri(0, a.length - 1);
  const kind = pick(["count", "sum", "index"] as const);
  const lit = `[${a.join(", ")}]`;
  if (kind === "count") return Num(`Que renvoie ${code(`count(${lit})`)} en PHP ?`, Fr(a.length), "count compte les éléments.");
  if (kind === "sum") return Num(`Que renvoie ${code(`array_sum(${lit})`)} en PHP ?`, Fr(a.reduce((x, y) => x + y, 0)), "array_sum additionne les éléments.");
  return Num(`Que renvoie ${code(`${lit}[${i}]`)} en PHP ? (indices depuis 0)`, Fr(a[i] as number), `L'élément d'indice ${i}.`);
}

function readyState(): RawQuestion {
  const rows: Array<[number, string]> = [[0, "UNSENT : requête non initialisée"], [1, "OPENED : open() appelé"], [2, "HEADERS_RECEIVED : en-têtes reçus"], [3, "LOADING : réception du corps"], [4, "DONE : réponse complète reçue"]];
  const [n, d] = pick(rows);
  return Num(`Quel numéro de readyState correspond à « ${d.split(" : ")[1]} » ?`, Fr(n), `${n} = ${d}.`);
}

const php = poolVF([
  { q: "Le code PHP est exécuté côté serveur ; le navigateur ne reçoit que le résultat (HTML).", t: true, e: "Le client ne voit jamais le code PHP." },
  { q: "Les variables PHP commencent par le signe `$`.", t: true, e: "`$nom`, `$tableau`." },
  { q: "Avec method=\"post\", les valeurs sont lues dans `$_POST['champ']`.", t: true, e: "`$_GET` pour method=\"get\"." },
  { q: "Avec method=\"get\", les données du formulaire n'apparaissent pas dans l'URL.", t: false, e: "GET les place dans l'URL (?nom=valeur) : à éviter pour un mot de passe." },
  { q: "En PHP, la concaténation de chaînes utilise l'opérateur +.", t: false, e: "C'est le point « . » (le + est arithmétique)." },
  { q: "Une page PHP doit avoir l'extension .php pour être interprétée par le serveur.", t: true, e: "Sinon le code est renvoyé tel quel au navigateur." },
]);

const ajax = poolQcm([
  { q: "AJAX permet de…", r: "mettre à jour une partie de la page sans la recharger", w: ["exécuter du PHP dans le navigateur", "remplacer JavaScript", "télécharger la page entière plus vite"], e: "Échanges asynchrones avec le serveur via XMLHttpRequest (ou fetch)." },
  { q: "Quelle condition indique une réponse AJAX réussie ?", r: "readyState == 4 && status == 200", w: ["readyState == 200 && status == 4", "readyState == 4 || status == 404", "status == 4"], e: "4 = terminé, 200 = HTTP OK." },
  { q: "Que fait xhttp.open(\"GET\", \"file1.txt\", true) ?", r: "Prépare une requête GET asynchrone vers file1.txt (sans l'envoyer)", w: ["Envoie immédiatement la requête", "Ouvre le fichier en écriture", "Télécharge file1.txt sur le disque"], e: "L'envoi se fait avec send()." },
  { q: "Que signifie le dernier paramètre true de open() ?", r: "La requête est asynchrone", w: ["La requête est sécurisée (HTTPS)", "La réponse est en JSON", "La requête est de type POST"], e: "Le navigateur n'est pas bloqué en attendant la réponse." },
  { q: "Où se trouve le texte renvoyé par le serveur dans un XMLHttpRequest ?", r: "this.responseText", w: ["this.status", "this.readyState", "this.open"], e: "responseText contient le corps de la réponse." },
]);

const jq = poolQcm([
  { q: "Que fait `$(\"#menu\").hide()` ?", r: "Cache l'élément d'id « menu »", w: ["Cache tous les éléments de classe « menu »", "Supprime l'élément du DOM", "Crée un élément d'id « menu »"], e: "`$` prend un sélecteur CSS ; hide() applique display: none." },
  { q: "Que sélectionne `$(\"div p\")` ?", r: "Tous les paragraphes descendants d'un div", w: ["Les paragraphes enfants directs d'un div", "Les div qui suivent un paragraphe", "Le premier paragraphe de la page"], e: "L'espace = descendants ; « > » = enfants directs." },
  { q: "Que sélectionne `$(\".note\")` ?", r: "Tous les éléments de classe « note »", w: ["L'élément d'id « note »", "Les balises <note>", "Le premier élément de classe « note »"], e: "« . » = classe." },
  { q: "Que renvoie `$(\"li\")` ?", r: "Un objet jQuery contenant tous les <li>", w: ["Un seul élément du DOM", "Un tableau de chaînes", "Un booléen"], e: "Un objet jQuery = ensemble de nœuds du DOM." },
  { q: "Quelle instruction ajoute du texte à l'élément d'id « r » ?", r: "`$(\"#r\").text(\"Bonjour\")`", w: ["`$(\".r\").text(\"Bonjour\")`", "`$(\"r\").text(\"Bonjour\")`", "`$(\"#r\").hide(\"Bonjour\")`"], e: "#r pour l'id, text() pour le contenu texte." },
]);

function ajaxBug(): RawQuestion {
  return Bug(
    "Fonction AJAX qui affiche le contenu de file1.txt dans un div. Une ligne est fausse.",
    [
      "var xhttp = new XMLHttpRequest();",
      "xhttp.onreadystatechange = function() {",
      "  if (this.readyState = 4 && this.status == 200) {",
      "    document.getElementById('div1').innerHTML = this.responseText;",
      "  }",
      "};",
      "xhttp.open('GET', 'file1.txt', true); xhttp.send();",
    ],
    2,
    [
      "  if (this.readyState == 4 && this.status == 200) {",
      "  if (this.readyState == 4 || this.status == 200) {",
      "  if (this.readyState == 200 && this.status == 4) {",
    ],
    "« = » est une AFFECTATION : elle écrase readyState au lieu de le comparer. Il faut « == » (ou « === »).",
  );
}

function phpBug(): RawQuestion {
  return Bug(
    "Page PHP qui reçoit un formulaire en POST (champ email). Une ligne est fausse.",
    [
      "<?php",
      "`$email = $_GET['email'];`",
      "`if (in_array($email, $utilisateurs)) { echo 'Bienvenue ' . $email; }`",
      "else { header('Location: login.html'); }",
      "?>",
    ],
    1,
    [
      "`$email = $_POST['email'];`",
      "`$email = $POST['email'];`",
      "`$email = _POST['email'];`",
    ],
    "method=\"post\" ⇒ les données arrivent dans `$_POST`, pas `$_GET`.",
  );
}

function ajaxOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre le fonctionnement d'une requête AJAX (XMLHttpRequest).",
    [
      "Créer l'objet : `new XMLHttpRequest()`.",
      "Définir la fonction de rappel `onreadystatechange`.",
      "Préparer la requête avec `open('GET', url, true)` puis l'envoyer avec `send()`.",
      "Quand `readyState == 4` et `status == 200`, lire `responseText` et mettre à jour le DOM.",
    ],
    ["Lire responseText juste après send(), sans attendre.", "Recharger la page pour afficher la réponse."],
    "L'appel est asynchrone : on réagit à la réponse dans le rappel.",
  );
}

function loginGuided(): RawQuestion {
  const n = ri(3, 6);
  return Guided(
    `Un formulaire ${code(`<form action="page1.php" method="post">`)} envoie un email. La page PHP compare l'email à un tableau de ${n} utilisateurs.`,
    [
      gq("Où le PHP lit-il l'email envoyé ?", ["`$_POST['email']`", "`$_GET['email']`", "`$email`", "`document.getElementById`"], ["Regarde l'attribut method."], "method=post ⇒ `$_POST`."),
      gq("Où le code PHP s'exécute-t-il ?", ["Sur le serveur", "Dans le navigateur", "Dans la base de données", "Dans l'en-tête HTTP"], ["Le navigateur ne voit jamais <?php … ?>."], "Côté serveur."),
      gn(`Le tableau contient ${n} utilisateurs. Que renvoie \`count($utilisateurs)\` ?`, Fr(n), ["count compte les éléments."], `Le tableau a ${n} éléments.`),
      gq("Si l'email n'est pas dans le tableau, que fait-on ?", ["On redirige vers la page de connexion", "On affiche un message de bienvenue", "On supprime le formulaire", "On stocke l'email"], ["Cf. énoncé du TP."], "Retour au formulaire (header('Location: …'))."),
    ],
    "Chaîne complète client → serveur : formulaire HTML → PHP → réponse HTML.",
  );
}

export const level: Level = {
  id: "WEB3",
  name: "PHP, AJAX & jQuery",
  fiche: "TD6-TD7 · CM13",
  icon: "🌐",
  color: "#e71d36",
  gens: [
    ["php-array", phpArray], ["readystate", readyState], ["php", php], ["ajax", ajax], ["jq", jq],
    ["ajax-bug", ajaxBug], ["php-bug", phpBug], ["ajax-order", ajaxOrder], ["login-guided", loginGuided],
  ],
  piege: "« = » affecte, « == » compare. POST → `$_POST`. readyState == 4 ET status == 200.",
  rappel: [
    "PHP côté serveur : `$variables`, tableaux, `$_GET` / `$_POST`, concaténation « . ».",
    "AJAX : XMLHttpRequest, open/send, onreadystatechange, readyState 4 + status 200, responseText.",
    "jQuery : `$(\"#id\")`, `$(\".classe\")`, `$(\"balise\")`, `$(\"div p\")` descendants, `$(\"div > p\")` enfants ; hide(), text(), html().",
  ],
};
