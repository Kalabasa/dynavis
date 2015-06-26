"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Dataset = Backbone.Model.extend({
		urlRoot: function() {
			return "api.php/users/" + this.get("username") + "/datasets";
		},
		defaults: {
			username: null,
			name: null,
			description: null,
		},
	});

	models.DatasetSingle = models.Dataset;

	collections.Dataset = Backbone.Collection.extend({
		model: models.Dataset,
		initialize: function(models, options) {
			if(options && options.username) {
				this.username = options.username;
			}
		},
		url: function() {
			if(this.username) {
				return "api.php/users/" + this.username + "/datasets";
			}else{
				return "api.php/datasets";
			}
		},
		parse: function(data) {
			return data.data;
		},
	});
})();