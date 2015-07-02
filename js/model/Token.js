"use strict";
define(["jquery", "localStorage", "backbone", "model/User"], function($, localStorage, Backbone, User) {
	return Backbone.Model.extend({
		urlRoot: "api.php/tokens",
		defaults: {
			username: null,
			token: null,
			expiry: null,
		},

		initialize: function() {
			var that = this;

			var cookie = localStorage.getItem("dynavis_token");
			if(cookie) {
				var data = JSON.parse(cookie);
				this.set(data);
				$.ajaxSetup({
					headers: {"Authorization": 'Token token="' + data.token + '"'}
				});
				this.fetch({
					error: function() {
						$.ajaxSetup();
						that.clear();
						localStorage.removeItem("dynavis_token");
					},
				});
			}
		},

		get_user: function() {
			if(this.isNew()) return null;
			return InstanceCache.get("User", this.get("username"));
		},

		login: function(username, password) {
			var that = this;
			$.ajax({
				method: "POST",
				url: that.urlRoot,
				data: JSON.stringify({username: username, password: password}),
				processData: false,
				dataType: "json",
				success: function(data) {
					$.ajaxSetup({
						headers: {"Authorization": 'Token token="' + data.token + '"'}
					});
					that.set(data);
					that.fetch();
					localStorage.setItem("dynavis_token", JSON.stringify(data), data.expiry);
				},
				error: function() {
					console.error("Error login");
				},
			});
		},

		logout: function() {
			var that = this;
			$.ajax({
				method: "DELETE",
				url: that.url(),
				success: function() {
					$.ajaxSetup();
					that.clear();
					localStorage.removeItem("dynavis_token");
				},
				error: function() {
					console.error("Error logout");
					that.fetch();
				},
			});
		},
	});
});