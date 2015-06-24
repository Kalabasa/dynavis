"use strict";
var AdminApp = AdminApp || null;
(function(){
	AdminApp = function() {
		var that = this;

		this.instance_cache = new InstanceCache();
		
		this.official_hound = new Bloodhound({
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			datumTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "api.php/officials?q=%QUERY",
				wildcard: "%QUERY",
				transform: function(data) { return data.data; },
			},
		});
		this.family_hound = new Bloodhound({
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			datumTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "api.php/families?q=%QUERY",
				wildcard: "%QUERY",
				transform: function(data) { return data.data; },
			},
		});
		
		this.router = new (Backbone.Router.extend({
			routes: {
				"": "users", // FIXME: add home page?
				"officials": "officials",
				"families": "families",
				"elections": "elections",
				"users": "users",
			},
			officials: function() {
				var official_collection = new collections.Official();
				React.render(<components.OfficialsPanel collection={official_collection} family_hound={that.family_hound} />, document.getElementById("body"));
				official_collection.fetch();
			},
			families: function() {
				var family_collection = new collections.Family();
				React.render(<components.FamiliesPanel collection={family_collection} official_hound={that.official_hound} />, document.getElementById("body"));
				family_collection.fetch();
			},
			elections: function() {
				var election_collection = new collections.Election();
				React.render(<components.ElectionsPanel collection={election_collection} instance_cache={that.instance_cache} official_hound={that.official_hound} />, document.getElementById("body"));
				election_collection.fetch();
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