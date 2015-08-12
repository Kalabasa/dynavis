"use strict";
define(["backbone", "model/User", "backbone-pagec"], function(Backbone, User) {
	return Backbone.PageableCollection.extend({
		model: User,
		url: "api.php/users",
		parse: function(data) {
			return data.data;
		},
	});
});