"use strict";
define(["backbone", "model/Party", "backbone-pagec"], function(Backbone, Party) {
	return Backbone.PageableCollection.extend({
		model: Party,
		url: "api.php/parties",
		parse: function(data) {
			return data.data;
		},
	});
});