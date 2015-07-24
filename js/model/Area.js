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

		fetch: function(options) {
			var id = this.get(this.idAttribute);
			options = options || {};
			options.url = options.url || this.urlRoot.replace(/[^\/]$/, "$&/") + encodeURIComponent(id);
			Backbone.Model.prototype.fetch.call(this, options);
		},
	});
});