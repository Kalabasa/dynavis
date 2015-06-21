"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Family = Backbone.Model.extend({
		defaults: {
			id: null,
			name: null,
		},

		members: function() {
			return new collections.FamilyMember(null, {family_id: this.get("id")});
		},
	});

	// TODO: Pagination
	collections.Family = Backbone.Collection.extend({
		url: "api.php/families",
		model: models.Family,
		parse: function(data) {
			return data.data;
		},
	});
})();