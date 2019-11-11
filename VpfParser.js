	// variable objet représantant le Mail
var Mail = require('./mail');


function parse(text) {

    // data : tableau/liste comportant les mails séparés
    var data;
    var data2 = new Array();
    var data3 = {};

    // séparator : les caractères servant à séparer les mails
    var separatorLine="\r\n";
    var separatorData =": ";

    // représente le fichier mail qui sera ainsi parsé en object Mail
    var mailParse;
    var msg = "";
    // le dernier index avant le début du message
    var lastIndexBeforeMsg;

    for(var ind=0; ind<text.length;ind++){
        // data est séparé selon les categories (from, to ..)
        // data[0] : l'id ; data[1] : la date...
        data = text.split(separatorLine);
    }

    for(var j=0; j<data.length;j++){
        // data2[0][0] = "Message-id:"
        // data2[0][1] = <l'id>
        // data2[1][0] = "Date:"
        // data2[2][0] = "From:"
        // ..etc..
        data2[j] = data[j].split(separatorData);
    }

    for(var j=0; j<data.length;j++){
        for(var index=0; index<data2[j].length;index++){
        	// si = message-id, donc data[0][0], on récup data[0][1]
            if( data2[j][index] == "Message-ID")
                var id = data2[j][index+1];
            // pareil pour chaque champs
            else if( data2[j][index] == "Date")
                var date = data2[j][index+1];

            else if( data2[j][index] == "From")
                var from = data2[j][index+1];
            // 5 car 'To' est la 4e champ du mail
            else if( data2[j][index] == "To" && j < 5)
                var to = data2[j][index+1];

            else if( data2[j][index] == "Subject"){
                var obj = data2[j][index+1];
                	// si c'est une réponse
                	// data[j][index] = "Subject"
                	// data[j][index+1] = "Re" ou "Re:"
                	// donc on récupere index+2
				if( data2[j][index+1] == "Re"){
					var obj = data2[j][index+2];
				}
				else
					var obj = data2[j][index+1];
            }

            else if( data2[j][index] == "X-From")
            	var xfrom = data2[j][index+1];

            else if( data2[j][index] == "X-To")
            	var xto = data2[j][index+1];
            // x-filename la derniere info du mail avant le message
            else if ( data2[j][index] == "X-FileName")
                lastIndexBeforeMsg = j;
            else if( j > lastIndexBeforeMsg) {
                msg += data2[j][index];
                mailParse = new Mail(id, date, from, to, obj, msg, xfrom, xto);
            }
        }
    }
    return mailParse;
}

module.exports = parse;