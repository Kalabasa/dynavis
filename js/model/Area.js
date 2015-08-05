"use strict";
define(["underscore", "backbone"], function(_, Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/areas",
		defaults: {
			code: null,
			name: null,
			level: null,
		},
		idAttribute: "code",
		parse: function(r,o) {
			return {
				id: parseInt(r.id, 10),
				code: parseInt(r.code, 10),
				name: r.name,
				level: r.level,
			}
		},

		isNew: function() {
			return !this.has("id");
		},

		sync: function(method, model, options) {
			var base = this.urlRoot.replace(/[^\/]$/, "$&/");

			if(this.has("id") || method === "update" || method === "patch" || method === "delete") {
				// use id url when writing
				var id = this.get("id");
				options = options || {};
				options.url = options.url || base + "id/" + encodeURIComponent(id);
			}else if(method === "read") {
				// use code url when reading without id
				var code = this.get("code");
				options = options || {};
				options.url = options.url || base + encodeURIComponent(code);
			}
			Backbone.Model.prototype.sync.call(this, method, model, options);
		},
	}, {
		get_level: function(code) {
			code = ("0"+code).slice(-9);
			if(code.substr(6,3) !== "000") {
				return "barangay";
			}else if(code.substr(4,2) !== "00") {
				return "municipality";
			}else if(code.substr(2,2) !== "00") {
				return "province";
			}else{
				return "region";
			}
		},
	});
});