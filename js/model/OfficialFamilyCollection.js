"use strict";
define(["jquery", "backbone", "model/Family"], function($, Backbone, Family) {
	return Backbone.Collection.extend({
		model: Family,
		initialize: function(models, options) {
			this.official_id = options.official_id;
		},
		url: function() {
			return "api.php/officials/" + this.official_id + "/families";
		},
		parse: function(data) {
			return data.data;
		},
		post_family: function(family) {
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
					console.error("Error post_family");
				},
			});
		},
	});
});