"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Official = Backbone.Model.extend({
		defaults: {
			id: null,
			surname: null,
			name: null,
			nickname: null,
		},

		families: function() {
			return new collections.OfficialFamily(null, {official_id: this.get("id")});
		},
	});

	// TODO: paginat
	collections.Official = Backbone.Collection.extend({
		url: "api.php/officials",
		model: models.Official,
		parse: function(data) {
			return data.data;
		},
	});
})();