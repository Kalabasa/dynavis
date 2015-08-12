"use strict";
define(["backbone", "model/Election", "backbone-pagec"], function(Backbone, Election) {
	return Backbone.PageableCollection.extend({
		model: Election,
		url: "api.php/elections",
		parse: function(data) {
			return data.data;
		},
	});
});