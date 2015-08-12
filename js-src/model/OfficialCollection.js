"use strict";
define(["backbone", "model/Official", "backbone-pagec"], function(Backbone, Official) {
	return Backbone.PageableCollection.extend({
		model: Official,
		url: "api.php/officials",
		parse: function(data) {
			return data.data;
		},
	});
});