"use strict";
var AdminApp = AdminApp || null;
(function(){
	AdminApp = function() {
		var that = this;
		
		this.router = new (Backbone.Router.extend({
			routes: {
				"": "users", // FIXME: add home page?
				"officials": "officials",
				"families": "families",
				"users": "users",
			},
			officials: function() {
				var official_collection = new collections.Official();
				React.render(<components.OfficialsPanel collection={official_collection} />, document.getElementById("body"));
				official_collection.fetch();
			},
			families: function() {
				var family_collection = new collections.Family();
				React.render(<components.FamiliesPanel collection={family_collection} />, document.getElementById("body"));
				family_collection.fetch();
			},
			users: function() {
				var user_collection = new collections.User();
				React.render(<components.UsersPanel collection={user_collection} />, document.getElementById("body"));
				user_collection.fetch();
			},
		}))();
	};


	AdminApp.prototype.start = function() {
		var token = new models.Token();
		React.render(<components.Header model={token} />, document.getElementById("header"));
		React.render(<components.Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};
})();