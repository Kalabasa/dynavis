"use strict";
define(["backbone", "model/Family", "backbone-pagec"], function(Backbone, Family) {
	return Backbone.PageableCollection.extend({
		model: Family,
		url: "api.php/families",
		parse: function(data) {
			return data.data;
		},
	});
});