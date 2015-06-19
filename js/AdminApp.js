"use strict";
var AdminApp = AdminApp || null;
(function(){
	AdminApp = function() {
		var that = this;
		
		this.header_factory = React.createFactory(components.Header);
		this.sidebar_factory = React.createFactory(components.Sidebar);
		this.users_panel_factory = React.createFactory(components.UsersPanel);

		this.router = new (Backbone.Router.extend({
			routes: {
				"": "users",
				"users": "users",
			},
			users: function() {
				var user_collection = new collections.User();
				var users_panel = that.users_panel_factory({collection: user_collection});
				React.render(users_panel, document.getElementById("body"));
				user_collection.fetch();
			},
		}))();
	};


	AdminApp.prototype.start = function() {
		var token = new models.Token();
		var header = this.header_factory({model: token});
		React.render(header, document.getElementById("header"));

		var sidebar = this.sidebar_factory();
		React.render(sidebar, document.getElementById("sidebar"));

		Backbone.history.start();
	};
})();