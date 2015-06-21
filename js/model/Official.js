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

	collections.OfficialFamily = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.official_id = options.official_id;
		},
		url: function() {
			return "api.php/officials/" + this.official_id + "/families";
		},
		model: models.Family,
		parse: function(data) {
			return data.data;
		},

		add_family: function(id) {
			var that = this;
			$.ajax({
				method: "POST",
				url: that.url(),
				data: JSON.stringify({id: id}),
				processData: false,
				dataType: "json",
				success: function() {
					that.fetch();
				},
				error: function() {
					console.error("Error add_family");
				},
			});
		},
	});
})();