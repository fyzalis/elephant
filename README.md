# elephant
Affichage historique navigation personnalisé et basé sur un scoring de page intéressantes pour l'utilisateur.


Ce module permettra d'afficher une liste de pages qui sont sensés être plus intéerssantes que les autres pour l'utilisateur d'un site web.

Ca se présentera comme un mini historique de navigation.

Les liens affichés à l'intérieur seront les pages "produits" d'un site d'annonces immobilières.
L'ordre de classement des différentes pages enregistrées doit se faire par un petit algo, en js (pas de backend pour l'instant), qui prendra en compte certains paramètres mesurables tels que :
- le temps passé sur la page
- le fait de plus ou moins scroller dans la page
- le nombre de fois ou l'utilisateur à visité la page
- des éléments "déclencheurs" (du type ouvrir une liste d'information, ouvrir des photos, etc...)
- un possible bouton "favoris", pour que l'utilisateur puisse notifié son interet

liste non-exhaustive

Pourquoi elephant ? Parcequ'ils ont une bonne mémoire, surtout pour retrouver leur point d'eau ! :)

Bon allez, let's code !


# Installation
1 - Copier le dossier elephant dans votre répertoire javascript

2 - appeler les fichier JS et CSS correspondant dans vos balise head
~~~~
<link rel="stylesheet" href="/path/to/elephant.min.css">
<script type="text/javascript" src="/path/to/elephant.min.js"></script>
~~~~

3 - Positionner la div déclencheuse du comptage des stats dans les pages désirées
~~~~
<div id="elephant" data-text="Le texte qui s'affichera dans le rendu visuel" data-image="l'image lié à cette page"></div>
~~~~
Puis exécuter le plugin JS
~~~~
$.fn.elephant();
~~~~
