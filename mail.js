var mail = function(id, date, from, to, obj, msg, xFrom, xTo){
	this.id = id;
	this.date = date;
	this.utilisateur = from;
	this.destinataire = to;
	this.objet = obj;
	this.message = msg;
	this.nomUtilisateur = xFrom;
	this.nomDestinataire = xTo;

}

module.exports = mail;