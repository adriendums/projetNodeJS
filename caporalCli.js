/*###############################################################
	DEPENDANCES
###############################################################*/

	// Utilisation des fonctionnalités en ligne de commande
	var cli = require('caporal');
	var colors = require('colors');

	// Parser des différents formats de données
	var VpfParser = require('./VpfParser.js');
	var dateParser = require('./dateParser.js');
	var vCard = require('vcards-js');

	// Exploration des dossiers et fichiers
	var fs = require('fs');
	var recursiveSync = require('fs-readdir-recursive');

	// Génération de graphiques
	var vg = require('vega');
	var vegalite = require('vega-lite');

	// Toutes les méthodes utiles à la réalisation des specs
	var Utils = require('./utils.js');

	//Adaptablilité à tous les systèmes d'exploitation
	const path = require('path');


/*###############################################################
	CAPORAL.JS COMMANDES
###############################################################*/

cli
	.version('0.06')

	/*.command('test', 'test')
	.argument('dossier', 'dossier')
	.action(function(args, options, logger){

		var test = read(args.dossier);
	})

	// CHECK SI THE PARSER EST OK
	.command('check', 'Check du parser fonctionnel')
	.argument('<file>', 'The file to check with parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', cli.BOOL, false)
	.option('-t, --showTokenize', 'log the tokenization results', cli.BOOL, false)
	.action(function(args, options, logger){

		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			//var analyzer = new VpfParser();
			analyzer = VpfParser(data);
			console.log(analyzer);
		});

	})*/

	// SPECIFICATION 1 - GENERATION DE VCARD POUR CHAQUE COLLABORATEUR
	// *** FONCTIONNEL ?
    .command('vcard', 'Créer une Vcard de contact pour les collaborateurs')
    .argument('<chemin>', 'chemin du dossier de tous les collaborateurs ou du collaboteur')
    .action(function(args, options, logger){

        vCard = vCard();

        // chemin du dossier donné en argument
        let walkPath = args.chemin+'/';
        logger.info("Traitement en cours".green);

        // création du dossier si non existant
        // du dossier vcard
        var vcardDir = './vCards';

		if (!fs.existsSync(vcardDir)){
		    fs.mkdirSync(vcardDir);
		}


        // *** obtenir le nom si c'est un collaborateur
        // séparer le chemin selon les dossier
        let separator = '\\';
        let  nom = walkPath.split(separator);
        // récupérer le dernier : initial
        // exemple ; arnold-j
        nom = nom[nom.length-1];

        var prenomDestinataire;
        var nomDestinataire ;
        var organisationDestinataire;
        var emailDestinataire;

        var read = recursiveSync(walkPath);

        read.forEach(function(mail){
            //logger.info(mail.green);
            readMail(walkPath+'/'+mail);
        });

        // lecture du mail
        function readMail(mail){
            var mailbinaire = fs.readFileSync(mail);
            analyzer = VpfParser(mailbinaire.toString("utf8"));

            // récupérer l'adresse mail
            var emailDestinataire = analyzer.destinataire;
            //Tableau d'adresse mail
            if (emailDestinataire != undefined){

                var listeDestinataires= emailDestinataire.split(', ');
                //listeDestinataires= emailDestinataire.split("e-mail <");


           		//console.log(listeDestinataires);

                var newList = [];

                for( var ind = 0 ; ind < listeDestinataires.length; ind++){
                    newList.push((listeDestinataires[ind]).split('@'));
                }

                for (ind=0;ind < newList.length; ind++){
                    // On sépare le nom et le prénom
                    var nomPrenomDestinataire = (newList[ind][0]).split(".");
                    var prenomDestinataire = nomPrenomDestinataire[0];
                    var nomDestinataire = nomPrenomDestinataire[1];
                    // On sépare l'organisation du .com
                    if(newList[ind][1] != undefined)
                        var organisationDestinataire = (newList[ind][1]).split('.com');

                    //logger.info(organisationDestinataire.green);
                    //organisationDestinataire = organisationDestinataire[0];

                    //Nom du fichier de la vCard
                    prenomDestinataire = prenomDestinataire.split("email <");

                   	if(prenomDestinataire == "email <" || prenomDestinataire == "e-mail <" ){
                   		prenomDestinataire = undefined;
                   	}

                   	//console.log(prenomDestinataire);

                    var nomvCard = prenomDestinataire + "_" + nomDestinataire+ ".vcf";
                    if(equals(nomvCard)){
                        console.log("Le nom du collaborateur existe déjà.");
                    } else {
                        createVCard(prenomDestinataire, nomDestinataire, organisationDestinataire, listeDestinataires[ind]);
                    }

                }

            }

        }

        //Vérifier si la vCard existe déjà en cherchant dans le dossier des vCards
        function equals(newNameVCard) {
            var walkPathNewVCard = recursiveSync('./vCards');
            walkPathNewVCard.forEach(function (dossier) {
                //logger.info(dossier.red);
                //logger.info(newNameVCard.green);
                let nomVCardCollaborateur = dossier;

                if (newNameVCard == nomVCardCollaborateur)
                    return true;
                else
                    return false;
            })
        }

        function createVCard(prenom, nom, organisation,email){

            //afficher vCard, les parties commentées pour l'affichage de la vCard sont les parties qui ne peuvent pas encore être implémentées dedans
            let vCardABNF = "Begin:VCard \nVersion 4.0 \n";
            vCardABNF = vCardABNF +"N:"+ nom +"; " + prenom;
            /*if(deuxiemePrenomDestinataire != null)
                vCardABNF += ";" + deuxiemePrenomDestinataire;*/
            /*if (titre != null)
                vCardABNF += ";"+titreDestinataire+"\n";
            if(individual != null)
                vCardABNF+="KIND:"+individual+"\n";*/
            vCardABNF += "\nFN:" + prenom+" "+ nom +"\n";
            vCardABNF += "EMAIL:" + email +"\n";
            /*if(numeroTelephone != null)
                vCardABNF += "TEL:Type=Work;textphone:"+numeroTelephone+"\n";
            if(nickName != null)
                vCardABNF+="NICKNAME:"+nickName+"\n";*/
            if(organisation != null)
                vCardABNF+="ORG:"+organisation+"\n";
            /*if(titleDestinataire != null)
                vCardABNF+="TITLE:"+titleDestinataire+"\n";
            if(role!= null)
                vCardABNF+="ROLE:"+role+"\n";*/
            vCardABNF+="END:VCARD\n";

            //console.log(vCardABNF);
            //set properties
            vCard.firstName = prenom;
            vCard.lastName = nom;
            vCard.email = email;
            //vCard.title = titleDestinataire;
            vCard.organization = organisation;
            //vCard.workPhone = numeroTelephone;

            //save to file
            //  vCard.saveToFile('./vCards/eric-nesser.vcf');

						// Modification de carrarav
						let path = './vCards/'+ prenom +"_"+ nom +'.vcf';
						//logger.info("Le fichier "+path+" a bien été généré".green);
            vCard.saveToFile(path);

        }
				logger.info("");
				logger.info("Les fichiers ont été générés dans le dossier ".green + "./vcards/".blue);
        logger.info("Création de vcard terminée.".green);

    })


	// SPECIFICATION 2 - NOMBRE DE MAILS ECHANGES
	// *** FONCTIONNEL SANS LES DATES
	.command('spec_2', 'Connaitre le nombre d email echanges par tous')
	.argument('<chemin>', 'chemin du dossier de tous les collaborateurs ou du collaboteur')
	.argument('<dateDeb>', 'période de début souhaitee')
	.argument('<dateDeFin>', 'période de fin souhaitee')
	.argument('<heureDeb>', 'heure de début souhaitee')
	.argument('<heureDeFin>', 'heure de fin souhaitee')
	.action(function(args, options, logger){

		logger.info("Traitement en cours".green);
		// récupérer le nombre de mail total
		var total = Utils.get_nombre_mails(args.chemin, args.dateDeb, args.dateDeFin, args.heureDeb, args.heureDeFin);

		// obtenir le nom si c'est un collaborateur
			// séparer le chemin selon les dossier
		var separator = path.sep;
		nom = args.chemin.split(separator);
			// récupérer le dernier : initial
			// exemple ; arnold-j
		nom = nom[nom.length-1];
			// nom : arnold-j par exemple
			// nom2[0] = arnold
			// nom2[1] = j
		nom2 = nom.split('-');
			// le prenom : arnold
			// le nom : jt

		if( nom == nom2[0] )
			console.log("Nombre d'emails échangés entre le " + args.dateDeb + " à " + args.heureDeb
				+ " et le " + args.dateDeFin + " à " + args.heureDeFin + "\n Entre tous les collaborateurs : " + total);
		else
			console.log("Le nombre de mails échangés entre le " + args.dateDeb + " à " + args.heureDeb
				+ " et le " + args.dateDeFin + " à " + args.heureDeFin + "\n Par "+ nom2[0]+" " +nom2[1] +" : " + total);
	})



	// SPECIFICATION 3 - TOP 10 MOTS LES PLUS UTILISES EN MAIL
	// *** FONCTIONNEL
	.command('spec_3', 'Top 10 des termes utilisés en objet de mail')
	.argument('<dossier>', 'chemin du dossier utilisateur')
	.action(function(args, options, logger){

		// récupérer le nom du collaborateur pour le fichier
		// qui est la derniere partie de l'url chemin
		var separatorDir = '/';
		var tmp = (args.dossier).split(separatorDir);
		var nom = tmp[tmp.length-1];

		//console.log(tmp);
		//console.log(nom);

		// récupérer le top
		var top_10 = Utils.get_objets_messages(args.dossier, nom);

		// le fichier sera généré dans l'endroit dans lequel l'utilisateur se trouve
		var currentPath = process.cwd();
		var nomFile = "top_10_mots_objets_"+nom+".txt";
		logger.info("Un fichier ".green+ nomFile.green+" a été généré dans le dossier ".green + currentPath.green + ".".green);

		// génération du fichier texte avec le top 10
		fs.writeFile(nomFile, top_10, function (err) { if (err) throw err; });
	})


	// SPECIFICATION 4 - TOP 10 INTERLOCUTEURS CONTACTES
	.command('spec_4', 'Top 10 des interlocuteurs les plus contactés')
	.argument('<chemin>', 'nom du dossier du collaborateur')
	.action(function(args, options, logger){

		// Récupération du top 10
		var nom_collab = args.chemin;
		var top_10_interlocuteurs = Utils.get_top_10_interlocuteurs(nom_collab);

		// Affichage du top
		logger.info( "\r\n" + "Le top 10 des interlocuteurs les plus contactés pour " + nom_collab + ": \r\n");
		top_10_interlocuteurs.forEach(function(interlocuteur) {
				logger.info("- " + interlocuteur.nom + " : contacté " + interlocuteur.nb + " fois. " +"\r")
		})

	})

	// SPECIFICATION 5 - LISTE DES BUZZY DAYS
	.command('spec_5', 'Liste des buzzy days')
	.action(function(args, options, logger){

		logger.info("\r\n" + "Veuillez patienter.")
			logger.info("Le traitement peut durer jusqu'à 1 minute.")
			logger.info("Pour arrêter le traitement : Ctrl + c ")

		// Recupérer les buzzys day
		var buzzy_days = Utils.get_buzzys_days();
		var count = buzzy_days.pop().count;

		// Les afficher
		logger.info( "\r\n" + "La liste des buzzy days : " + "\r\n");
		buzzy_days.forEach(function(day) {
				logger.info("- " + day.jour + "-" + day.mois + "-" + day.annee +"\r")
		})
		logger.info("\r\n" + "Le nombre de buzzy days est de : " + count + '.' )

	})

	// SPECIFICATION 6 - VISUALISER LE NOMBRE D ECHANGES ENTRE COLLABORATEURS 
	.command('spec_6', 'Générer le visuel du nombre d echange')
	.argument('<directory>', 'le dossier du collaborateur')
	.action(function(args, options, logger){

		var graph = Utils.draw_graph_echanges(args.directory, logger);

	})

	// SPECIFICATION 7 - RECHERCHE DE MAILS PAR FILTRE
	.command('spec_7', 'Recherche de mails par critères')
	.argument('[string]', ' terme recherché dans tous les envoyeurs, destinataires et objets') // argument optionnel - recherche dans tous les champs
	.option('-e, --envoyeur <string>', 'nom et/ou prénom de l\'envoyeur recherché')
	.option('-d, --destinataire <string>', 'nom et/ou prénom du destinataire recherché')
	.option('-o, --objet <string>', 'objet du mail recherché')
	.action(function(args, options, logger){

		if(args.string == null && options.envoyeur == null && options.destinataire == null && options.objet == null){
			logger.info("Vous n'avez entré aucun critère de recherche.".red)
		}else{
			logger.info("\r\n" + "Veuillez patienter.")
			logger.info("Le traitement peut durer jusqu'à 1 minute.")
			logger.info("Pour arrêter le traitement : Ctrl + c .")

			var critere = args.string;
			var mails_correspondants = Utils.get_mails_par_critere(critere, options.envoyeur, options.destinataire, options.objet);

			// Affichage des mails correspondant s'ils existent
			if (mails_correspondants.length > 0 ){
				logger.info( "\r\n" + "Mails correspondants à vos critères de recherches : " + "\r\n");
				mails_correspondants.forEach(function(mail) {
					logger.info("###################################")
					logger.info("\r\n" + mail +"\r\n")
				})
			}else{
				logger.info("Auncun mail ne correspond à vos critères.".red)
			}
		}

  	// SPECIFICATION 8 - RECHERCHE PAR NOM DU COLLABORATEUR
	}).command('spec_8', 'Recherche de mail par nom du collaborateur')
	.argument('<string>', 'prenom et/ou nom du collaborateur dans cet ordre')
	.action(function(args, options, logger){


			logger.info("\r\n" + "Veuillez patienter.")
			logger.info("Le traitement peut durer jusqu'à 1 minute.")
			logger.info("Pour arrêter le traitement : Ctrl + c ")

			var nom_collab = args.string;
			var mails_correspondants = Utils.get_mails_par_critere(null, nom_collab , null , null);

			// Affichage des mails correspondant s'ils existent
			if (mails_correspondants.length > 0 ){

				var liste_mail = "";
				mails_correspondants.forEach(function(mail) {
					liste_mail = liste_mail + "\r\n" + "###################################" + "\r\n" + mail +"\r\n";
				})

				// Générer la liste dans le dossier rapport
				var file_path = "rapports/liste_mails_" + nom_collab + ".txt"
				var stream = fs.createWriteStream(file_path);
				stream.once('open', function(err) {
					if (err){
						logger.info(err.red)
					}
  					stream.write("Liste de mails pour la recherche " + nom_collab + "\r\n\r\n");
  					stream.write(liste_mail);
  					stream.end();
				});
				logger.info(("Fichier bien généré dans : " + file_path).green)
			}else{
				logger.info("Auncun mail ne correspond à ce collaborateur".red)
			}

	})

	// SPECIFICATION 9 - REDDACTION RAPPORT RCOM
	.command('spec_9', 'Rédiger un rapport individuel (RCom)')
	.argument('<string>', 'nom du dossier du collaborateur')
	.argument('<dateDeb>', 'date début')
	.argument('<dateF>', 'date fin')
	.argument('<heureD>', 'heure début')
	.argument('<heureF>', 'heure fin')
	.action(function(args, options, logger){

		logger.info("\r\n" + "Veuillez patienter.")
		logger.info("Le traitement peut durer jusqu'à 1 minute.")
		logger.info("Pour arrêter le traitement : Ctrl + c ")

		// Récupération des différents arguments
		var args2 = process.argv.slice(3);
		var nom_collab = args2[0];
		var date_debut = args2[1].split('/');
		var date_fin = args2[2].split('/');


		// Todo = méthode pour vérifier la bonne saisie des arguments

		// Aide pour la génération du rapport
		var separation = "\r\n" + "********************************************************" + "\r\n"
		//var file_path = "rapports/Rcom_" + nom_collab /*+ "_" + date_debut + "_" + date_fin*/ + ".txt"
		var tmp_nom_collab = nom_collab.split('/');
		var file_path = "rapports/" + tmp_nom_collab[1]+".txt";

		// Nombre de mail échanger sur période donnée - méthode à implementer
		var nombre_mails = Utils.get_nombre_mails(nom_collab, args.dateDeb, args.dateF, args.heureD, args.heureF);
		var content_spec_2 = "Le nombre de mails échangés par "+  tmp_nom_collab[1] +" entre le " + args.dateDeb + " à " + args.heureD +" et le " +  args.dateF + " à " + args.heureF+ " est de : " + nombre_mails +"." + separation;

		// 10 objets de message les plus utilisés - méthode à implementer
		var objets_messages = Utils.get_objets_messages(nom_collab);
		var content_spec_3 = objets_messages + "\r\n"

		// Liste buzzys days - méthode à implementer
		var buzzys_days = Utils.get_buzzys_days();
		var content_spec_5 = "\r\n" + "Liste buzzys days - " + buzzys_days.pop().count + " trouvé(s)." + separation;
		buzzys_days.forEach(function(date) {
				var nouvelle_date = " - " + date.jour + "/" + date.mois + "/" + date.annee;
				content_spec_5 = content_spec_5 + nouvelle_date
		})

		// Les 10 interlocuteurs les plus contactés
		var top_10_interlocuteurs = Utils.get_top_10_interlocuteurs(nom_collab);
		var content_spec_4 = "Les 10 interlocuteurs les plus contactés :" + separation;
		top_10_interlocuteurs.forEach(function(interlocuteur) {
				var nouvelle_ligne = "- " + interlocuteur.nom + " : contacté " + interlocuteur.nb + " fois. " +"\r\n";
				content_spec_4 = content_spec_4 + nouvelle_ligne
		})

		// Génération du graphique avec nombre d'échanges
		var graph_echanges = Utils.draw_graph_echanges(args.string, logger);

		// Générer le rapport dans le dossier rapport
		var stream = fs.createWriteStream(file_path);
		stream.once('open', function(err) {
			if (err){
				logger.info(err.red)
			}
  			stream.write("Rapport Rcom pour " + nom_collab + "\r\n\r\n");
  			stream.write(content_spec_2);
  			stream.write(content_spec_3);
  			stream.write(content_spec_4);
  			stream.write(content_spec_5);
  			stream.end();
		});
		logger.info(("Fichier bien généré dans : " + file_path).green)

	});

cli.parse(process.argv);
