var fs = require('fs');
var VpfParser = require('./VpfParser.js');

var recursiveSync = require('fs-readdir-recursive');
var stringify = require('csv-stringify');

var dateParser = require('./dateParser.js');
var vg = require('vega');
var vegalite = require('vega-lite');


module.exports = {

	//////////////////////////////////////////////////////////////////

	get_nombre_mails: function (nom_collab, dateD, dateF, heureD, heureF) {
		// dates format : jj/mm/aaaa
		// heures format : 00h00

		// créer 2 Dates
		// date[0] = jj, date[1] = mm, date[2] = aaa
		var dateDebut = dateD.split('/');
		var dateFin = dateF.split('/');

		// h[0] = heure, h[1] = minutes
		heureDebut = heureD.split('h');
		heureFin = heureF.split('h');

		// new Date(year, month, day, hours, minutes, seconds, milliseconds);
		// -1 aux mois car Date va de 0 à 11, pour 0 janvier, 11 décembre
		dateDebut = new Date(dateDebut[2], dateDebut[1]-1, dateDebut[0], heureDebut[0], heureDebut[1], 0, 0);
		dateFin = new Date(dateFin[2], dateFin[1]-1, dateFin[0], heureFin[0], heureFin[1], 0, 0);

		// commpte le nombre de mail
		var count = 0; 

		var read = recursiveSync(nom_collab);

			read.forEach(function(mail){
					var mailbinaire = fs.readFileSync(nom_collab+'/'+mail);
					analyzer = VpfParser(mailbinaire.toString("utf8"));
					fileDate = dateParser(analyzer.date);

					// *** si l'annee de fin est supérieur à l'année de début 
					if( dateFin.getFullYear() > dateDebut.getFullYear() ){
						// si l'année est supérieur à l'année de début && inférieur ou égale à l'année de fin, on prend tout
						if( (fileDate.getFullYear() > dateDebut.getFullYear()) && ( fileDate.getFullYear() <= dateFin.getFullYear() ) )
							count++;
						// si l'année est inférieure à année début, on prend rien

						// si l'année est égale à l'année de début
						else if ( fileDate.getFullYear() == dateDebut.getFullYear ){
							// on garde si mois >= mois début et jour >= jour début
							if( (fileDate.getMonth() >= dateDebut.getMonth()) && (fileDate.getDate() >= dateDebut.getDate()) )
								count++;
						}
					}
					// *** si l'annee de fin est égale à l'année de début 
					else{
						// on prend si le mois est supérieur égal au mois début && inférieur égal au moins fin
						if( (fileDate.getMonth() >= dateDebut.getMonth()) && (fileDate.getMonth() <= dateFin.getMonth()) ){
								
							// *** si le jour de fin est supérieur au jour de début 
							if( dateDebut.getDate() < dateFin.getDate()){
								// si jour supérieur égal au jour début && inférieur égal jour de fin
								if( (fileDate.getDate() >= dateDebut.getDate()) && (fileDate.getDate() <= dateFin.getDate()) ){
									count++;
								}
							}
							// *** si le jour de début est supérieur ou égal (13/10 & 5/12 par exemple) 
							else {
								// on prend si jour > 13 & mois >= 10
								// ou si jour < 5 & mois <= 12
								if( ((fileDate.getDate() > dateDebut.getDate()) && (fileDate.getFullYear() >= dateDebut.getFullYear()))
									|| ( (fileDate.getDate() < dateFin.getDate()) && (fileDate.getFullYear() <= dateFin.getFullYear())) )
									count++;
							}

						}
					}
			});
			return count;
	},

	//////////////////////////////////////////////////////////////////

	get_buzzys_days: function () {
		var buzzy_days_liste = [];
		var read = recursiveSync("donneesSujetB");
		var count = 0;

		//console.log("Liste des Buzzy days : ")
		read.forEach(function(mail){
				var mailbinaire = fs.readFileSync("donneesSujetB"+'/'+mail);
				p = VpfParser(mailbinaire.toString("utf8"));

				//console.log(p)

		//Lecture de la date
			var date = dateParser(p.date);

			//Définition des Buzzy Days
			if( date.getHours() > 22 || date.getHours() < 8 || date.getDay() == '5' || date.getDay() == '6' ){

				if(buzzy_days_liste.length == 0){
  					//ajout du 1er element si buzzy days vide
  					buzzy_days_liste.push({ "jour" : date.getDate(), "mois" : parseInt(date.getMonth() + 1), "annee" : date.getFullYear() });
  					count ++;
  				}else{
  					// Ajoute les jours s'ils ne sont pas déjà présents
  					var index_day = buzzy_days_liste.findIndex((day => day.jour == date.getDate() && day.mois == parseInt(date.getMonth() + 1) && day.annee == date.getFullYear() ));
  					if( index_day == -1 ){
  						buzzy_days_liste.push({ "jour" : date.getDate(), "mois" : parseInt(date.getMonth() + 1), "annee" : date.getFullYear() });
  						count ++;
  					}
  				}

			};			

		});

        // On trie les buzzy days par date
        var buzzy_days_tries = buzzy_days_liste.sort(function(a, b) {
            var dateA = new Date(a["annee"], a["mois"], a["jour"]);
            var dateB = new Date(b["annee"], b["mois"], b["jour"]);
            return dateA - dateB;
        });
        
		buzzy_days_tries.push({ "count" : count });
		return buzzy_days_tries;

	},

	//////////////////////////////////////////////////////////////////

	get_top_10_interlocuteurs: function (nom_collab) {
	
		var nom_collab = nom_collab;
		var dirname = /*"donneesSujetB/" + */nom_collab + "/_sent_mail/";
		var files = fs.readdirSync(dirname);

  		const interlocuteurs = [];
  		const top_10_interlocuteurs = [];

  		// Ajout des interlocuteurs
  		files.forEach(function(file) {

  			// Récupération des données d'un mail parser	
  			var mail = fs.readFileSync(dirname + file);
  			analyzer = VpfParser(mail.toString("utf8"));

  			if(interlocuteurs.length == 0){
  				//ajout du 1er element si interlocuteurs vide
  				interlocuteurs.push({"nom" : analyzer.nomDestinataire, "nb" : 1});
  			}else{
  				// incrémente nb de contact ou ajoute interlocuteur
  				var index_interlocuteur = interlocuteurs.findIndex((obj => obj.nom == analyzer.nomDestinataire));
  				if( index_interlocuteur >= 0){ 
  					interlocuteurs[index_interlocuteur].nb++;
  				}else{
  					interlocuteurs.push({"nom" : analyzer.nomDestinataire, "nb" : 1});
  				}
  			}

		});

		// Tri des 10 interlocuteurs les plus contactés - peut être optimisé
		for (var i = 0; i < 10; i++){
			// recup le + contacté des interlocuteurs
			var max_count = Math.max.apply(Math, interlocuteurs.map( interlocuteur => interlocuteur.nb))
			var index_to_remove = interlocuteurs.findIndex(interlocuteur => interlocuteur.nb == max_count );
			var new_top = interlocuteurs.find(interlocuteur => interlocuteur.nb == max_count );
			// le retirer de interlocuteurs et ajouter au top 10
			interlocuteurs.splice(index_to_remove, 1)
			top_10_interlocuteurs.push(new_top);
		}

		return top_10_interlocuteurs;	

	},

	//////////////////////////////////////////////////////////////////

	draw_graph_echanges: function (dossier, logger) {

		// hashmap<key, value>
		// Key = le destinataire
		// Value  = le nombre de fois qu'il a été contacté
		var destinatairesListe = new Map([[undefined,undefined]]);

		var iterator= destinatairesListe.keys();
		var keyTrouve = null;
		var trouve = false;

		// lecture recursive du dossier
		var read = recursiveSync(dossier);

		// compter les destinataires
		read.forEach(function(mail){
			compterDest(dossier+'/'+mail);
		});

		function compterDest(mail){
			var mailbinaire = fs.readFileSync(mail);
  			mailParse = VpfParser(mailbinaire.toString("utf8"));

  			// dans plusieurs mail, il n'y a pas de "To"
  			// il faut donc prendre ceux où il y en a
  			if (mailParse.destinataire != undefined){
  					// si plusieurs destinaires, séparés par une virgule
					var destinataire = mailParse.destinataire.split(', ');
						// chercher dans tous les destinaires trouvés
					destinataire.forEach(function(mailDestinataire){
						
					destinatairesListe.forEach(logMapElements);

					function logMapElements(value, key, map) {
						// occurrence trouve
						if( mailDestinataire == key ){
							trouve = true;
							keyTrouve = key;
						}
					}

					// nombre d'occurence + 1
					if (trouve){
						destinatairesListe.set(keyTrouve, destinatairesListe.get(keyTrouve)+1 );
					}
					else{
						// 1er apparence du mot
						destinatairesListe.set(mailDestinataire, 1);
					}

					// remise à false sinon reste à true pour toujours
					trouve = false;
				});
  			}

  			// suppression de certaines erreurs
			destinatairesListe.delete('');
			destinatairesListe.delete(undefined);

		}


		//  CSV des données pour les exploiter en vega-lites
		let data = [];
		let columns = {
		  nomCollaborateur: 'nomCollaborateur',
		  nombre: 'nombre'
		};

		destinatairesListe.forEach(writeIntoCSVFormat);

		// écriture dans liste
		function writeIntoCSVFormat(value, key, map){
			data.push([key, value]);
		}
		// créer le csv
		stringify(data, { header: true, columns: columns }, (err, output) => {
			if (err) throw err;
			fs.writeFile('my.csv', output, (err) => {
				if (err) throw err;
				console.log("fichier crée");
			});
		});


		var svgToDraw =
		{
			"title": "Nombre d'échanges du collaborateur choisi en fonction des autres collaborateurs",
		 	"data": {"url": "my.csv"},
		 	"mark": "circle",
			"encoding": 
			{
		    	"x": {
		    		"field": "nomCollaborateur", 
		    		"type": "nominal",
		    		"axis": {"title": "Nom des collaborateurs"}
		    	},

				"y": {
					"field": "nombre", 
					"type": "quantitative",
					"axis": {"title": "Nombre de mails échangé"}
				},

				"size" : {"field" : "nombre", "type" : "quantitative"}
			}
		}

		// compiler vega-lite
		const myChart = vegalite.compile(svgToDraw).spec;

		// SVG version 
		// création du SVG depuis le csv
		var runtime = vg.parse(myChart);
		var view = new vg.View(runtime).renderer('svg').run();
		var mySvg = view.toSVG();
		mySvg.then(function(res){
			fs.writeFileSync("./rapports/nombre_echange_collab.svg", res)
			view.finalize();
			logger.info("Graphique généré : ./rapports/nombre_echange_collab.svg");
		});

	},

	//////////////////////////////////////////////////////////////////

	get_objets_messages: function (dossier) {
		//expression régulière
		//var regex = new RegExp('^(([a-z])*|[\b])*');
		//console.log(regex.exec("adk ij fk"));
		var nom = dossier.split('/');

		// hashmap<key, value>
		// Key = le terme utilisé dans les 
		// Value  = le nombre d'occurence du mot
		var tabMotNbOccurence = new Map([[0,0]]);

		var read = recursiveSync(dossier);

			read.forEach(function(mail){
				// parser le mail récupéré
				var mailbinaire = fs.readFileSync(dossier+'/'+mail);
	  			analyzer = VpfParser(mailbinaire.toString("utf8"));

	  			// récupérer l'objet du mail
	  			var sujet = analyzer.objet;

	  			// réduire toutes les lettres au format minuscule
	  			sujet = sujet.toLowerCase();

	  			// séparer mot par mot 
				var separator = " ";
					// exemple d'objet : test de sujet
					// mot[0] = test, mot[1] = de, mot[2] = sujet
				var mot= sujet.split(separator);

				// clé si mot déjà trouvé
				var keyTrouve = null;
				var trouve = false;

				for( var i = 0; i < mot.length; i++){
					// lecture de chaque élément de tabMotNbOccurebce
					tabMotNbOccurence.forEach(logMapElements);

					function logMapElements(value, key, map) {
						// occurrence trouve
						if( mot[i] == key ){
							trouve = true;
							keyTrouve = key;
						}
					}

					// nombre d'occurence + 1
					if (trouve){
						tabMotNbOccurence.set(keyTrouve, tabMotNbOccurence.get(keyTrouve)+1 );
					}
					else{
						// 1er apparence du mot
						tabMotNbOccurence.set(mot[i], 1);
					}
				}
			});

			// retirer les mots de liaisons ou caractères spéciaux
			deleteMots(tabMotNbOccurence);

			// récupérer le top10
			const mapSort1 = new Map([...tabMotNbOccurence.entries()].sort((a, b) => b[1] - a[1]));
			
			
			// txt : ce qu'on va écrire dans le fichier txt
			// on récupère les 10 premiers
			var txt = "Liste des 10 termes les plus utilisés par " + nom[1] + " \r\n\n";
			for(var z = 0; z < 10 ; z++){
				var keySort = Array.from(mapSort1.keys())[z];
				txt += " • " + keySort + " : utilisé " + mapSort1.get(keySort) + " fois\r\n"; 
			}

			return txt;
			

		// supprimer certains mots de liaisons
		// ou non importants/pertinents
		function deleteMots(tab){
			tab.delete('-');		tab.delete("--");
			tab.delete(0);			tab.delete("re");
			tab.delete("re:");		tab.delete("for");
			tab.delete("and");		tab.delete("the");
			tab.delete("your");		tab.delete("from");
			tab.delete("to"); 		tab.delete("with");
			tab.delete("on"); 		tab.delete("of");
			tab.delete("fw:");		tab.delete('&');
			tab.delete("fw");
		}
	},

	//////////////////////////////////////////////////////////////////

	get_mails_par_critere: function (critere, from, to, subject) {

		const mails_correspondants = [] ;

		// Passer les paramètres en minuscule pour une meilleure comparaison
		if (critere != undefined) { critere = critere.toLowerCase() }
		if (from != undefined) { from = from.toLowerCase() }
		if (to != undefined) { to = to.toLowerCase() }
		if (subject != undefined) { subject = subject.toLowerCase(); }

		var dossier_principal = "donneesSujetB";
		var dossiers_collaborateurs = fs.readdirSync(dossier_principal);

  		// Recherche pour chaque mail
  		dossiers_collaborateurs.forEach(function(d) {

  			var dossier_collaborateur = fs.readdirSync("donneesSujetB/"+ d)
  			dossier_collaborateur.forEach(function(sous_dossier) {

  				var mails = fs.readdirSync("donneesSujetB/"+ d + "/" + sous_dossier)
  				mails.forEach(function(mail) {

  					// Récupération des données
  					var chemin_fichier = "donneesSujetB/"+ d + "/" + sous_dossier + "/" + mail;
  					stats = fs.lstatSync(chemin_fichier);

  					if (stats.isFile()) {
  						var mail = fs.readFileSync(chemin_fichier);
  						mail = mail.toString("utf8");
  						analyzer = VpfParser(mail);

  						var destinataire = analyzer.nomDestinataire.toLowerCase();
  						var envoyeur = analyzer.nomUtilisateur.toLowerCase();
  						var objet =	analyzer.objet.toLowerCase();

  						// Si l'option from a été entrée seule
  						if(from != null && to == null && subject == null){
  							if(envoyeur.includes(from)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si l'option to a été entrée seule
  						if(to != null && from == null && subject == null ){
  							if(destinataire.includes(to)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si l'option subject a été entrée seule
  						if(subject != null && to == null && from == null){
  							if(objet.includes(subject)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si l'option from et to
  						if(to != null && from != null && subject == null){
  							if(destinataire.includes(to) && envoyeur.includes(from) ){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si subject et from
  						if(subject != null && from != null && to == null){
  							if(objet.includes(subject) && envoyeur.includes(from)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si l'option subject and to
  						if(subject != null && to != null && from == null){
  							if(objet.includes(subject) && destinataire.includes(to)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si toutes les options sont présentes
  						if(subject != null && to != null && from != null){
  							if(objet.includes(subject) && destinataire.includes(to) && envoyeur.includes(from)){
  								mails_correspondants.push(mail);
  							}
  						}

  						// Si aucune option, recherche du critere dans tous les champs 
  						if(from == null && to == null && subject == null && critere != null){
  							if(destinataire.includes(critere) || envoyeur.includes(critere) || objet.includes(critere)){
  								mails_correspondants.push(mail);
  							}
  						}
  						
        			}		

  				})

  			});

		});

		return mails_correspondants;
	}

	//////////////////////////////////////////////////////////////////

}
