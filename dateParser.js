function parseDate(date){
	//return (date);

		// split si : virgule espace
		// ou esapce
	infos = date.split(/, | /) ;

	/*infos[0] = jour de la semaine
	infos[1] = numéro du jour
	infos[2] = mois
	infos[3] = annee
	infos[4] = heure:minutes:secondes
	infos[5] = infos sur tranche horaire
	*/

	var separatorH = ":";
	/* heure[0] = heure
	heure[1] = minutes
	heure[2] = secondes */
	if ( infos[4] != undefined ){
		var heure = infos[4].split(separatorH);
	}else{
		var heure = 0;
	}
	//var heure = infos[4].split(separatorH);

	// le mois s'affiche en 3 lettres dans le mail
	// pour l'objet Date, il faut un chiffres
	var mois;
	switch(infos[2]){
		case "Jan":
			mois = 0;
			break;
		case "Fev":
			mois = 1;
			break;
		case "Mar":
			mois = 2;
			break;
		case "Apr":
			mois = 3;
			break;
		case "May":
			mois = 4;
			break;
		case "Jun":
			mois = 5;
			break;
		case "Jul":
			mois = 6;
			break;
		case "Aug":
			mois = 7;
			break;
		case "Sep":
			mois = 8;
			break;
		case "Oct":
			mois = 9;
			break;
		case "Nov":
			mois = 10;
			break;
			// decembre
		default :
			mois = 11;
			break;

	}

	// new Date(year, month, day, hours, minutes, seconds, milliseconds);
	return new Date(infos[3], mois, infos[1], heure[0], heure[1], heure[2], 0);
}


module.exports = parseDate;