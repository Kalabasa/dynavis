"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/elections",
		defaults: {
			official_id: null,
			year: null,
			year_end: null,
			position: null,
			votes: null,
			area_code: null,
			party_id: null,
		},
	});
});