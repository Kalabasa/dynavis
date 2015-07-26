"use strict";
define(["underscore", "backbone"], function(_, Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/areas",
		defaults: {
			code: null,
			name: null,
			level: null,
			parent_code: null,
		},
		idAttribute: "code",

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
	});
});