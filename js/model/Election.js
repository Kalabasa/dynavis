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
		parse: function(r,o) {
			return {
				official_id: parseInt(r.official_id, 10),
				year: parseInt(r.year, 10),
				year_end: parseInt(r.year_end, 10),
				position: r.position,
				votes: r.votes ? parseInt(r.votes, 10) : null,
				area_code: parseInt(r.area_code, 10),
				party_id: r.party_id ? parseInt(r.party_id, 10) : null,
			};
		},
	});
});