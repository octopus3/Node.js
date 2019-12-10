var Stype = require("./Stype.js")
var game_config = {
	gateway_config:{
		host:"127.0.0.1",
		prots: [6080,6081,6082,6083],
	},
	game_server:{
		0:{
			stype:Stype.TalkRoom,
			host:"127.0.0.1",
			port:6084,
		},

		1:{
			stype:Stype.Auth,
			host:"127.0.0.1",
			prot:6085,
		}
	},
};
module.exports = game_config;