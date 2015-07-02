"use strict";
define(["jquery", "backbone", "model/Official"], function($, Backbone, Official) {
	return Backbone.Collection.extend({
		model: Official,
		initialize: function(models, options) {
			this.family_id = options.family_id;
		},
		url: function() {
			return "api.php/families/" + this.family_id + "/officials";
		},
		parse: function(data) {
			return data.data;
		},
		post_member: function(official) {
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
					console.error("Error post_member");
				},
			});
		},
	});
});