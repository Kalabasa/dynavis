"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Official = Backbone.Model.extend({
		defaults: {
			surname: null,
			name: null,
			nickname: null,
		},

		families: function() {
			return new collections.OfficialFamily(null, {official_id: this.get("id")});
		},
	});

	models.OfficialSingle = models.Official.extend({urlRoot: "api.php/officials"});

	// TODO: paginat
	collections.Official = Backbone.Collection.extend({
		model: models.Official,
		url: "api.php/officials",
		parse: function(data) {
			return data.data;
		},
	});
})();