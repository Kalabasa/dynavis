"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Family = Backbone.Model.extend({
		defaults: {
			name: null,
		},

		members: function() {
			return new collections.FamilyMember(null, {family_id: this.get("id")});
		},
	});

	models.FamilySingle = models.Family.extend({urlRoot: "api.php/families"});

	// TODO: Pagination
	collections.Family = Backbone.Collection.extend({
		model: models.Family,
		url: "api.php/families",
		parse: function(data) {
			return data.data;
		},
	});
})();