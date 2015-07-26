"use strict";
define(["backbone", "model/Dataset", "backbone-pagec"], function(Backbone, Dataset) {
	return Backbone.PageableCollection.extend({
		model: Dataset,
		initialize: function(models, options) {
			if(options && options.username) {
				this.username = options.username;
				this.type = options.type || null;
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

		fetch: function(options) {
			options = options || {};
			if(this.type) {
				options.data = options.data || {}
				options.data.type = options.data.type || this.type;
			}
			Backbone.PageableCollection.prototype.fetch.call(this, options);
		},
	});
});