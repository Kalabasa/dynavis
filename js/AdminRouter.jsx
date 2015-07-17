"use strict";
define(["backbone", "react"], function(Backbone, React) {
	return Backbone.Router.extend({
		initialize: function(options) {
			this.token = options.token;
			this.bus = options.bus;
			this.listenTo(this, "route", this.on_route);
		},

		on_route: function(route, params) {
			this.bus.router.emit("route", {
				route: route,
				params: params,
			});
		},

		routes: {
			"": "users", // TODO: add home page?
			"officials": "officials",
			"families": "families",
			"elections": "elections",
			"areas": "areas",
			"(users/:username/)datasets": "datasets",
			"users": "users",
		},
		officials: function() {
			require([
				"model/OfficialCollection", "jsx!view/admin/OfficialsPanel"
			], function(OfficialCollection, OfficialsPanel) {
				var official_collection = new OfficialCollection(null, {per_page: 10});
				React.render(<OfficialsPanel collection={official_collection} />, document.getElementById("body"));
				official_collection.fetch();
			});
		},
		families: function() {
			require([
				"model/FamilyCollection", "jsx!view/admin/FamiliesPanel"
			], function(FamilyCollection, FamiliesPanel) {
				var family_collection = new FamilyCollection(null, {per_page: 10});
				React.render(<FamiliesPanel collection={family_collection} />,  document.getElementById("body"));
				family_collection.fetch();
			});
		},
		elections: function() {
			require([
				"model/ElectionCollection", "jsx!view/admin/ElectionsPanel"
			], function(ElectionCollection, ElectionsPanel) {
				var election_collection = new ElectionCollection(null, {per_page: 10});
				React.render(<ElectionsPanel collection={election_collection} />,  document.getElementById("body"));
				election_collection.fetch();
			});
		},
		datasets: function(username) {
			var that = this;
			require([
				"model/DatasetCollection", "jsx!view/admin/DatasetsPanel"
			], function(DatasetCollection, DatasetsPanel) {
				var dataset_collection = new DatasetCollection(null, username ? {username: username} : null);
				React.render(<DatasetsPanel collection={dataset_collection} token={that.token} />, document.getElementById("body"));
				dataset_collection.fetch();
			});
		},
		areas: function(username) {
			require([
				"model/AreaCollection", "jsx!view/admin/AreasPanel"
			], function(AreaCollection, AreasPanel) {
				var area_collection = new AreaCollection();
				React.render(<AreasPanel collection={area_collection} />, document.getElementById("body"));
				area_collection.fetch();
			});
		},
		users: function() {
			require([
				"model/UserCollection", "jsx!view/admin/UsersPanel"
			], function(UserCollection, UsersPanel) {
				var user_collection = new UserCollection();
				React.render(<UsersPanel collection={user_collection} />, document.getElementById("body"));
				user_collection.fetch();
			});
		},
	});
});