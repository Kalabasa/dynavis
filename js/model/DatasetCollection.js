"use strict";
define(["backbone", "model/Dataset", "backbone-pagec"], function(Backbone, Dataset) {
	return Backbone.PageableCollection.extend({
		model: Dataset,
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
});