"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	collections.FamilyMember = Backbone.Collection.extend({
		model: models.Official,
		initialize: function(models, options) {
			this.family_id = options.family_id;
		},
		url: function() {
			return "api.php/families/" + this.family_id + "/officials";
		},
		parse: function(data) {
			return data.data;
		},
		add_member: function(official) {
			var that = this;
			$.ajax({
				method: "POST",
				url: that.url(),
				data: JSON.stringify(official),
				processData: false,
				dataType: "json",
				success: function() {
					that.add(official);
				},
				error: function() {
					console.error("Error add_member");
				},
			});
		},
	});

	collections.OfficialFamily = Backbone.Collection.extend({
		model: models.Family,
		initialize: function(models, options) {
			this.official_id = options.official_id;
		},
		url: function() {
			return "api.php/officials/" + this.official_id + "/families";
		},
		parse: function(data) {
			return data.data;
		},
		add_family: function(family) {
			var that = this;
			$.ajax({
				method: "POST",
				url: that.url(),
				data: JSON.stringify(family),
				processData: false,
				dataType: "json",
				success: function() {
					that.add(family);
				},
				error: function() {
					console.error("Error add_family");
				},
			});
		},
	});
})();