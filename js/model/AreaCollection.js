"use strict";
define(["backbone", "Area", "backbone-pagec"], function(Backbone, Area) {
	return Backbone.PageableCollection.extend({
		model: Area,
		url: "api.php/areas",
		parse: function(data) {
			return data.data;
		},
	});
});