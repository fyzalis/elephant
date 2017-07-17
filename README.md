# ELEPHANT

[EN]
This Jquery plugin allows to store, to sort by interest, and to display the navigation of a user on specific pages on a website. It's a kind of "auto smart selection" of favorite user's page on a website.
At begining, this plugin is developed to a real estate website, but it could be used on a lot of various cases.

It allows to display a list of pages that interests a user during its navigation, to facilitate the search of products, and to easily find the products for which it has a real interest.

The order of classification of the various recorded pages takes into account certain measurable parameters such as:
- the time spent
- the fact of scroll, more or less
- the number of visits
- trigger elements (eg. opening a list of information, opening photos, clicking a button, etc...)
- a "favorite" button, to permit to the user to manually notify his interest

[FR]
Ce plugin Jquery permet de stocker, classer par intérêt, et restituer la navigation d'un internaute sur des pages données d'un site. C'est une sorte de 'sélection automatique et intelligente' des pages favorites d'un utilisateur sur un site.
A la base, ce plugin est développé pour un site d'agence immobilière, mais il peut être utilisé dans de nombreux autres cas.

Il permet d'afficher une liste de pages sensées intéresser l'utilisateur du site, lui faciliter la recherche de produits, et retrouver facilement les produits pour lesquels il éprouve un réel intérêt.

L'ordre de classement des différentes pages enregistrées prends en compte certains paramètres mesurables tels que :
- le temps passé
- le fait de plus ou moins scroller
- le nombre de visites
- des éléments "déclencheurs" (ex: ouvrir une liste d'informations, ouvrir des photos, cliquer sur un bouton, etc...)
- un bouton "favoris", pour que l'utilisateur puisse notifier manuellement son intérêt



# Installation
1 - Copier le dossier elephant dans votre répertoire javascript

2 - appeler les fichier JS et CSS correspondant dans vos balise head
~~~~
<link rel="stylesheet" href="/path/to/elephant.min.css">
<script type="text/javascript" src="/path/to/elephant.min.js"></script>
~~~~

3 - Positionner la div déclencheuse du comptage des stats dans les pages désirées (id='elephant')
~~~~
<div id="elephant" data-text="Le texte qui s'affichera<br />dans le rendu visuel" data-image="/path/to/image.jpg"></div>
~~~~


4 - Positionner la div de rendu dans les pages désirées (id='elephanto')
~~~~
<div id="elephanto"></div>
~~~~

5 - Positionner la div dédiée aux favoris (id='elephant_favorite')
~~~~
<div id="elephant_favorite"></div>
~~~~


6 - Puis exécuter le plugin JS
~~~~
$(document).ready(function () {
  $.fn.elephant();
});
~~~~

# Options
Le plugin Elephant prends en compte certaines options personnalisable.

**Important :** pour l'instant, l'option 'path' doit être obligatoirement renseignée.

Options par défaut :
~~~~
{
triggers: new Array(),
activeDuration: 30,
refreshRender: 1,
maxDisplayedResult: 5,
title: 'My selection',
entryName: {
  'one': '',
  'several': ''
},
favoriteTrigger: '#elephant_favorite',
path: "",
theme: "default",
lang : "en"
}
~~~~
triggers (tableau) : définie les éléments qui incrémentent la stat 'trigger' (type selecteur JQuery (tag, id, class,...)).

activeDuration (secondes) : définit la durée à partir de laquelle l'utilisateur est considéré comme inactif sur une page. Pris en compte pour l'incrémentation de la stat 'time'.

refreshRender (secondes) : définit le temps de rafraichissmeent du rendu visuel.

maxDisplayedResult (entier) : définit le nombre maximal de positions à afficher dans le rendu visuel.

title (chaîne) : définit le texte à afficher en haut du rendu visuel.

entryName (objet): défini le nom 'humain' des entrées de la sélection (ex: produit, bien immobilier, annonce, etc...)

favoriteTrigger (chaîne) : id de la div du bouton favoris.

path (chaîne): chemin du dossier du plugin (nécéssaire pour la gestion des thèmes).

theme (chaîne): nom du dossier contenant le thème désiré

lang (chaîne): fichier langue à appliquer au plugin (fr ou en)


# Themes

Afin de personnaliser le plugin sur votre site, il est très facile de faire votre propre thème. Il vous suffit juste de copier le répertoire du thème par défaut,
de personnaliser les différents fichiers (css, images), puis de l'appeler dans les options du plugin grâce à la variable 'theme'


# Screenshot

**Thème par défaut v1.0 :**
![theme par defaut](https://github.com/fyzalis/elephant/blob/master/demo/elephant-screenshot-default.png)


**Thème premiumimmoneuf v1.0 :**
![theme premium](https://github.com/fyzalis/elephant/blob/master/demo/elephant-screenshot-premium.png)



# Langues (internationalisation)

Certaines variables de texte sont stockées dans des fichiers langues (dans le dossier /lang). Elles sont automatiquement (et obligatoirement) chargées (en AJAX) via l'option {lang: 'xx'}.
Pour l'instant, seul le français et l'anglais sont disponibles.

# Export de données

Il est possible de récupérér au format HTML les données de navigation de l'utilisateur.
~~~~
$(document).ready(function () {
  var elephantExportHTML = $.fn.elephantExportHTML();
});
~~~~


# Auteur
*Plugin réalisé par [Julien Buabent](http://julienbuabent.fr), pour le groupe Immo9 (Immobilier neuf à Toulouse) [Toulouse Immo 9](http://toulouseimmo9.com), [Premium Immo Neuf](http://premiumimmoneuf.com)*
