PRODUCT DOCUMENTATION
=====================



Installation et dépendances
---------------------------

- Compatible Windows & MAC OS (mêmes commandes dans le terminal)

1. Cloner le dossier du depôt avec la commande checkout

2. Se placer dans le dossier trunk et installer ces différentes dépendences :
	* `npm install`
	* `npm install node`

3. Installer également : 
	* `npm install caporal –save`
	* `npm install colors`
	* `npm install vega`
	* `npm install vega-lite`
	* `npm install csv-stringify`
	* `npm install csv`
	* `npm install fs-readdir-recursive`
	* `npm install nodeunit`
	* `npm install vcards-js`
	


Guide de démarrage 
------------------

1. Se placer dans la racine du dossier trunk à l'aide de l'invité de commande. 

2. Pour voir les commandes et actions disponibles entrez la commande : `node caporalCli.js h`



Fonctionnalités
---------------

1. Générer une VCard pour chaque collaborateur : 
`node caporalCli.js vcard <dossier du collaborateur>`
Les VCards se trouvent dans le dossier vCards

2. Voir le nombre de mail échangés par période : 
`node caporalCli.js spec_2 <dossier du collaborateur> <dateDeb> <dateDeFin> <heureDeb> <heureDeFin>`
(voir les formats de dates & heures ci-dessous)

3. Voir le top 10 des objets les plus présents dans les mails : 
`node caporalCli.js spec_3 <dossier collaborateur(s)>`
	
4. Voir le top 10 des interlocuteurs les plus contactés par collaborateur: 
`node caporalCli.js spec_4 <dossier collaborateur>`

5. Voir la liste des "buzzys days" : 
`node caporalCli.js spec_5 <dossier collaborateur>`

6. Voir le nombre d'échange entre collaborateur : 
`node caporalCli.js spec_6 <dossier collaborateur>`
Le graphique est généré à la racine du dossier sous le nom de "nombre_echange_collab.svg".

7. Filtrer la liste de mails par envoyeurs et/ou destinataires et/ou objets : 
	* `node caporalCli.js spec_7 [critère]` - recherche le critére dans tous les champs envoyeurs/destinataires/objets
	* `node caporalCli.js spec_7 --envoyeur <terme>` - recherche  le terme dans les envoyeurs
	* `node caporalCli.js spec_7 --destinataire <terme>` - recherche le terme dans les destinataires
	* `node caporalCli.js spec_7 --objet <terme>` - recherche le terme dans les objets
	* Les options --envoyeur, --destinataire et --objet peuvent être appliquées dans la même commande
		* Exemple = `node caporalCli.js spec_7 --objet "avaya" --envoyeur "Jeff"`

8. Voir la liste des mails des collaborateurs par nom : 
`node caporalCli.js spec_8 <nom>`

9. Générer le rapport Rcom : `node caporalCli.js spec_9 <dossier collaborateur> <dateDeb> <dateF> <heureD> <heureF>` 

- dossier du collaborateur exemple  : "campbell-l", "arnold-j"
- les dates au format "10/10/2001"
- les heures au format "23h00"
- le nom peut être soit le prénom, soit le nom soit le 'prénom nom' dans cet ordre 
Le rapport se trouve dans le dossier rapport.

10. Pour faire les tests, se placer dans le dossier trunk/test :
`node <runner a tester>`



Messages d'erreur
-----------------

* `Error: ENOENT: no such file or directory`
Ce message apparait lorsque le chemin fourni est incorrect. Pour palier à ce problème, placer vous à la racine du dossier contenant les données et entrez la commande "pwd". 

* `Le nom du collaborateur existe déjà`
Ce message apparait lorsque l'utilisateur fait une création de VCard. Elles se trouvent dans le dossier vCards.

* `Error: Wrong number of argument(s) for command spec_2. Got X, expected exactly 5.`
Ce message apparait lorsque l'utilisateur veut connaitre le nombre d'emails échangé sur une période donnée et qu'il manque des paramètres. 
Pour palier à ce problème, allez voir dans la partie fonctionnalité les différents paramètres à indiquer ainsi que leur format dans la partie fonctionnalité.

* `Vous n'avez entrer aucun critère de recherche`
Ce message apparait lorsque l'utilisateur fait une recherche de mails par critère et qu'aucun critère n'a été entré ou alors que le critère entré n'existe pas. 
Pour palier à ce problème, allez voir dans la partie fonctionnalité les différents critères à utiliser dans la partie fonctionnalité.

* `Error: Wrong number of argument(s) for command spec_5. Got 1, expected exactly 0.`
Ce message apparait lorsque l'utilisateur veut obtenir la liste des Buzzy-day.
Pour palier à ce problème, il ne faut pas indiquer le chemin. 


* `Aucun mail ne correspond à vos critères`
Ce message apparait lorsque l'utilisateur fait une recherche de mails par critère. Soit les critères entrés sont au mauvais format, soit aucun mail ne correspond a ces critères.
Pour palier à ce problème, allez voir dans la partie fonctionnalité les différents critères à utiliser dans la partie fonctionnalité.

* `Auncun mail ne correspond à ce collaborateur`
Ce message apparait lorsque l'utilisateur fait une recherche de mails par nonm de collaborateur. Soit les critères entrés sont au mauvais format, soit aucun mail n'a été envoyé par cette personne'.
Pour palier à ce problème, allez voir dans la partie fonctionnalité les différents critères à utiliser dans la partie fonctionnalité.




PROCESS DOCUMENTATION
=====================


Description
-----------

 Application en ligne de commande permettant d’aider à l’analyse des communications et des expertises à l’intérieur des équipes de collaborateurs de UIConsult.



Parties prenantes
-----------------

* `Client` : Le cabinet de conseil UIConsult

* `Commanditaire` : L'équipe PandaCompagny, composée de 
	* Guillaume *****
	* Mathieu *****
	* Farah *****
	* Elena *****

* `Développeurs` : L'équipe JavaSpies, composée de
	* Victor *****
	* Damien *****
	* Adrien *****
	* Adrien *****
	* Mathilde *****



Architecture de l'application
-----------------------------

DOSSIERS

* __donneesSujetB__ - contient les données des messageries des collaborateurs
* __node_module__ - contient les dépendances node
* __rapport__ - contient les rapports générés
* __test__ - contient tests unitaires
* __vCards__ - contient les vcards qui seront générées à l'issue de la spec 1 (le dossier sera crée automatiquement)


FICHIERS

* __caporalCli.js__ - décrit toutes les commandes exécutables
* __mail.js__ - décrit le format des données mail
* __utils.js__ - contient les fonctions de récupération de mails
* __VpfParser.js__ - permet de parser les mails
* __test/unit/testDate.js__ - runner des tests du parser de date
* __test/unit/testVpf.js__ - runner des tests du parser de mail
* __test/unit/testDateParser.js__ - tests unitaires du parser de date
* __test/unit/testVpfParser.js__ - tests unitaires du parser de mail

Les graphiques seront générés en csv et en svg à la racine de l'application.



Dates importantes
-----------------

* `08/10/2018` Le cabinet de conseil UIConsult fait appel à l'équipe JavaSpies pour élaborer un logiciel spécifique.

* `04/11/2018` L'équipe JavaSpies transmet le cahier des charges à l'équipe PandaCompagny.

* `05/12/2018` L'équipe PandaCompagny remet le code à l'équipe JavaSpies.

* `10/12/2018` L'équipe JavaSpies teste le logiciel et liste les améliorations à apporter.

* `11/01/2019` L'équipe JavaSpies remet le logiciel au cabinet de conseil UIConsult.



License
-------

`MIT`

 


