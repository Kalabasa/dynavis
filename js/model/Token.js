"use strict";
var models = models || {};
(function() {
	models.Token = Backbone.Model.extend({
		urlRoot: "api.php/tokens",
		defaults: {
			id: null,
			username: null,
			token: null,
			expiry: null,
		},

		initialize: function() {
			var that = this;

			var cookie = docCookies.getItem("dynavis_token");
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
						docCookies.removeItem("dynavis_token");
					},
				});
			}
		},

		get_user: function() {
			if(this.isNew()) return null;
			var username = this.get("username");
			return new models.User({username: username});
		},

		login: function(username, password) {
			var that = this;
			$.post(this.urlRoot, {
				username: username,
				password: password,
			}, function(data) {
				$.ajaxSetup({
					headers: {"Authorization": 'Token token="' + data.token + '"'}
				});
				that.set(data);
				that.fetch();
				docCookies.setItem("dynavis_token", JSON.stringify(data), data.expiry); // TODO: secure cookie (https)
			}, "json")
				.fail(function() {
					console.log("LOGIN FAIL");
				});
		},

		logout: function() {
			var that = this;
			$.ajax(this.url(), {
				method: "DELETE",
				success: function() {
					$.ajaxSetup();
					that.clear();
					docCookies.removeItem("dynavis_token");
				},
				error: function() {
					console.log("logout error");
				},
			});
		},
	});
})();