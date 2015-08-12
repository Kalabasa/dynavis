"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		defaults: {
			surname: null,
			name: null,
			nickname: null,
		},
		parse: function(r,o) {
			return {
				id: parseInt(r.id, 10),
				surname: r.surname,
				name: r.name,
				nickname: r.nickname,
			};
		},

		get_full_name: function() {
			if(!this.get("surname") || !this.get("name")) return null;

			var nickname = null;
			if(this.get("nickname")) {
				nickname = ' "' + this.get("nickname") + '"';
			}else{
				nickname = "";
			}
			return this.get("surname") + ", " + this.get("name") + nickname;
		},
	});
});