# IGR205-Séminaires de projets

**Interactions sur des graphes de connaissances interconnectés**

Site pédagogique: [Liste des projets](https://perso.telecom-paristech.fr/jthiery/cours/igr205/igr205.html)

Work space: [Google Drive](https://drive.google.com/open?id=1SBImnKs75XvDbojn9aVy144yBejnYwrB)

## Encadrants

[Jean-Claude Moissinac](https://moissinac.wp.imt.fr/)

[James R. Eagan](https://perso.telecom-paristech.fr/eagan/)

## Membres

[ROBINEAU Corentin](https://github.com/AlwaysFurther)

[ZHANG Bolong](https://github.com/BolongZHANG)

[ZHU Fangda](https://github.com/zhufangda)

[BAO Yukun](https://github.com/baoyukun)

## Domaines

`Graph mining`, `Ontology`, `Visualization`, `Informatique`, `Programmation`

## Introduction

De nombreux travaux visent à produire des graphes de connaissances interconnectés. Cette tendance est communément appelée Linked Open Data ou LOD. Des principes généraux simples -le modèle RDF- permettent de représenter des connaissances dans un graphe -KG, pour Knowledge Graph- et de relier simplement ces connaissances à d'autres présentes dans d'autres graphes. Le graphe le plus connu, et auquel se lient de nombreux autres est DBPedia, un graphe constitué à partir de nombreux faits extraits de WikiPedia.
Un nombre grandissant d'entreprises et de centres de recherche travaillent à établir des méthodes pour exploiter ces graphes. Dans ce projet, nous allons nous focaliser sur les visualisations et les interactions possibles et utiles sur de tels graphes.
Pour ce projet, le jeu de données SemBib sera exploité, en liaison avec d'autres comme HAL, DBPedia, Orcid... Sembib est un ensemble de graphes de connaissances décrivant les près de 12000 publications scientifiques produites par Telecom ParisTech depuis 1969. D'autres ensembles de données pourront être proposés.
Le but va être d'explorer différentes possibilités pour la visualisation et l'exploration de tels ensembles de données et d'analyser les avantages et les inconvénient de différentes approches existantes. L'article en référence est une bonne base sur ce sujet ; d'autres pistes seront proposées et enfin, d'autres pourront être explorées à l'initiative du groupe.

## Développement du projet

- [**Semaine 1**](#semaine-1)
- [**Semaine 2**](#semaine-2)
- [**Semaine 3**](#semaine-3)
- [**Semaine 4**](#semaine-4)
- [**Semaine 5**](#semaine-5)

### Semaine 1
**28/05-01/06**

#### Partie algorithme

Nous avons tout d’abord effectué des recherches afin de trouver des articles intéressants sur les différentes manières d’explorer les graphes RDF. Au début, nous souhaitions essayer d’explorer le graphe tout entier cependant, nous nous sommes vite rendu compte que les graphes RDF sont pour la plupart beaucoup trop volumineux. Ainsi, nous avons commencé à nous pencher sur les techniques permettant de faire des requêtes qui renvoient les éléments du graphes correspondant à une demande d’un utilisateur. Nous avons décidé que cette demande se ferait sous la forme de mots clefs. Dans beaucoup de papiers et d’exemples, les algorithme reposait sur une connaissance préalable de la structure du graphe à savoir, les principales classes et prédicats. Cependant, nous souhaitions créer un algorithme universelles qui puissent découvrir la structure du graphe.

Après plusieurs recherches, nous avons porté notre attention sur l’article [Top-k Exploration of Query Candidates for Efficient Keyword Search on Graph-Shaped (RDF) Data](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4812421).

Les étapes principales sont les suivantes:

- Le mapping des mots clefs aux éléments du graphes RDF
- La création d’un graphe “résumé” du graphe d’origine
- L’exploration de ce graphe pour trouver des sous graphes connectant les mots clefs
- Détermination des top-k graphes (les meilleurs) par l'intermédiaire d’une fonction d’évaluation
- Génération des requêtes SPARQL pour les top-k graphes

Le graphe “résumé” est un graphe constitué seulement des sommets de type classe du graphe d’origine. Les arêtes de ce graphe sont les arêtes (prédicats) du graphes d’origine qui relient des entités. Un projet appartenant à la classe Project est une entité. En effet, ce n’est pas un attribut / donnée car ce projet est composé d’un nom, d’une date de publication,etc. Ces derniers en revanche sont des données.

![figure](doc/graph.png)

Par `Yukun BAO` et `Corentin ROBINEAU`

[*Retour au calendrier*](#développement-du-projet)

### Semaine 2
**04/06-08/06**

#### Partie algorithme

Nous sommes intéressés par la question: Comment explorer un large graphe RDF efficacement et intuitivement. SPARQL est un langage prédominant pour réaliser des requêtes sur les graphes RDF. Cependant, il demande à l’utilisateur d'avoir une connaissance parfaite de la syntaxe mais aussi de la structure du graphe.

Avec l’algorithme suivant , nous voudrions combiner la recherche par mots clefs avec le langage de requête SPARQL. Etant donnée une requête (Q , q) où Q est une requête SPARQL et q et un ensemble de mots clés, nous supposons que la force de relation de la réponse dépend de la longueur du chemin . En fait, des prédicats différents devrait avoir des poids différents pour la force de relation et cela peut être mesuré par une métrique de distance. Un autre challenge pour résoudre ce problème et l'efficacité de la recherche. Une recherche exhaustive peut se dérouler de la façon suivante: On cherche tous les sous graphes qui match la requête Q puis on calcul le plus court chemin entre ces sous graphes et les sommets qui contiennent les keyword. Evidemment, c’est une solution inefficace en pratique. On peut trouver les match de la requête Q avec des heuristiques afin de stopper le processus de recherche le plus tôt possible. De plus, on peut utiliser un schéma de reconnaissance séquentiel afin d’élaguer les branches de recherches. Enfin, pour accélérer le calcul de la distance, on peut sélectionner des pivots et les considérer comme des racines indépendantes dans l’arbre de recherche.

Quelques exemples de keyword+query pour que vous puissiez comprendre ce que l'on voudrais demander sur les données:

nom de fichier | contenu | interprétation
--- | --- | ---
dblp_Q1.txt | `Jian Pei; Wen Jin\n select * where    { ?paper <http://swrc.ontoware.org/ontology#year> "2005" . ?paper <http://swrc.ontoware.org/ontology#booktitle> "@@VLDB" . ?paper <http://purl.org/dc/elements/1.1/creator> ?person2 .    }` | Qui a écrit une papier nommé VLDB en 2005 et garde une bonne relation avec Jian Pei et Wen Jin?
dblp_Q2.txt | `Skyline\n select * where    { ?paper <http://swrc.ontoware.org/ontology#year> "2005" . ?paper <http://swrc.ontoware.org/ontology#booktitle> "@@VLDB" . ?paper <http://purl.org/dc/elements/1.1/creator> ?person1 . ?paper <http://purl.org/dc/elements/1.1/creator> ?person2 .    }` | Quels deux chercheurs ont fait des recherches sur Skyline et co-écrit un article dans VLDB 2005?
yago_Q1.txt | `Peking\n select * where    { ?p    <http://mpii.de/yago/resource/actedIn>    ?f1 . ?p    <http://mpii.de/yago/resource/created>    ?f2 . ?f1    rdf:type    <http://mpii.de/yago/resource/wikicategory_Comedy_films> . ?f2    <http://mpii.de/yago/resource/hasProductionLanguage>    <http://mpii.de/yago/resource/English_language>    . }` | Quels producteurs de films anglais ont joué dans un film de comédie et se sont liés à l'université de Pékin?
yago_Q2.txt | `Toronto; database\n select * where    {?p    <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>    <http://mpii.de/yago/resource/wordnet_scientist_110560637> . ?p    <http://mpii.de/yago/resource/hasWonPrize>    ?a . ?a    <http://www.w3.org/2000/01/rdf-schema#label>    "Turing Award"    . }` | Quels lauréats du prix Turing dans le domaine de la base de données sont principalement liés à Toronto?

On commence par un indexage hors ligne où les donnée du graphe sont traitées et placées dans des structures de données spécifiques. Du point de vue du graphe, les mots clefs peuvent faire référence à des C-Vertices ( les classes ),  des E-Vertices ( les entités ) ou des V-vertices ( les données ) et les arêtes du graphe. Nous ne nous intéresserons pas aux E-vertices dans le processus d’indexage car on peut supposer qu’il est peu probable que les utilisateurs utilisent la verbose des URI d’une E-Vertex. Afin de reconnaître aussi les mots clefs qui ne match pas exactement avec les données, la structure de donnée qui map les élément du graphe au kley word est implémentée sous la forme d’un index inversé. Ainsi, la structure de donnée va analyser un mot clef et retourner une liste d’éléments qui ont des labels avec une sémantique ou une syntaxe similaire.

Par `Yukun BAO` et `Corentin ROBINEAU`

[*Retour au calendrier*](#développement-du-projet)


### Semaine 3
**11/06-15/06**

#### Partie algorithme

La partie principale de l’algorithme consiste en trois parties. Tout d’abord, on explore le graphe pour trouver des sommets qui connectent les sommets “mot clef”. Ensuite, on génère des match à partir des sommets connectant les sommets “mot clef” et on obtient des centaines de milliers de sous graphes( graphe résumé ). Pour finir, on extrait les top-k sous graphes qui correspondent le mieux au mots clefs de l'utilisateur. Lors de l’exploration du graphe, pour chaque mot clef on a une file de priorité de triplets (sommet , chemin vers un sommet “mot clef” , longueur du chemin). Tous les éléments sont triés dans l’ordre non descendant de la longueur du chemin. Chaque mot clef est aussi associé à un ensemble de résultats dans lequel on peut trouver tous les sommets visibles avec un chemin de longueur inférieur à l’infinie.

Pour la génération des match de sous graphes, on utilise un algorithme basé sur le parcours en profondeur pour réaliser le processus de matching en commençant par un sommet v qui est directement visible par le sommet “mot clef”.  Supposons que v match un sommet u dans la requête Q, alors on cherche le graphe pour atteindre le voisin de v qui est un voisin de u et dont l'arête qui les relies est une arête de la requête. Le recherche va s’étendre pas à pas jusqu’à ce que l’on trouve un match ou que l’on ne puisse plus continuer. Pour accélérer la traversée, on sélectionne des sommets que l’on appellera pivots et on calcul les arbres de plus courts ayant pour racine ces pivots. Si la traversée rencontre un pivot, on peut utiliser l’arbre de plus court chemin afin d’explorer l’espace. Enfin, afin de calculer les top-k match, on commence par calculer le coût des match avec les sous graphes pour lesquels les sommets sont directement visibles par les mots clefs, ce qui peut mener à un seuil d’évaluation représentant le k-ième plus petit coût jusqu'à maintenant. Quand il y a moins de k match de ce type, le seuil devrait être infinie. Si le seuil est inférieur à toutes les évaluations des match où tous les sommets ne sont pas visible directement par les mots clefs, l'algorithme s’arretera et renverra les résultats qu’il a trouvé, sinon l’algorithme entame la prochaine itération.

![figure](doc/Diagram1.jpg)

Par `Yukun BAO` et `Corentin ROBINEAU`

[*Retour au calendrier*](#développement-du-projet)


### Semaine 4
**18/06-22/06**

#### Partie algorithme
Par `Yukun BAO` et `Corentin ROBINEAU`

[*Retour au calendrier*](#développement-du-projet)


### Semaine 5
**25/06-29/06**

#### Partie algorithme
Par `Yukun BAO` et `Corentin ROBINEAU`

[*Retour au calendrier*](#développement-du-projet)

## Reference

- [Exploration and Visualization in the Web of Big Linked Data: A Survey of the State of the Art](https://arxiv.org/pdf/1601.08059.pdf)
- [Top-k Exploration of Query Candidates for Efficient Keyword Search on Graph-Shaped (RDF) Data](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4812421)
