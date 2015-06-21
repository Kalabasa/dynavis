"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	collections.FamilyMember = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.family_id = options.family_id;
		},
		url: function() {
			return "api.php/families/" + this.family_id + "/officials";
		},
		model: models.Official,
		parse: function(data) {
			return data.data;
		},

		add_member: function(id) {
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
					console.error("Error add_official");
				},
			});
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