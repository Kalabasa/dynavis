"use strict";
define(["backbone", "react", "InstanceCache", "jsx!view/Spinner"], function(Backbone, React, InstanceCache, Spinner) {
	return Backbone.Router.extend({
		initialize: function(options) {
			this.bus = options.bus;
			this.listenTo(this, "route", this.on_route);
			this.official_collection = null;
			this.family_collection = null;
			this.election_collection = null;
			this.area_collection = null;
			this.dataset_collection = {};
			this.user_collection = null;
		},

		on_route: function(route, params) {
			React.render(<Spinner/>, document.getElementById("body"));
			this.bus.router.emit("route", {
				route: route,
				params: params,
			});
		},

		routes: {
			"": "home",
			"home": "home",
			"officials": "officials",
			"families": "families",
			"elections": "elections",
			"areas": "areas",
			"(users/:username/)datasets": "datasets",
			"users": "users",
		},
		home: function() {
			require([
				"jsx!view/admin/HomePanel"
			], function(HomePanel) {
				React.render(<HomePanel />, document.getElementById("body"));
			}.bind(this));
		},
		officials: function() {
			require([
				"model/OfficialCollection", "jsx!view/admin/OfficialsPanel"
			], function(OfficialCollection, OfficialsPanel) {
				this.official_collection = this.official_collection || new OfficialCollection(null, {per_page: 8});
				React.render(<OfficialsPanel collection={this.official_collection} />, document.getElementById("body"));
				this.official_collection.resetParams();
				this.official_collection.fetch();
			}.bind(this));
		},
		families: function() {
			require([
				"model/FamilyCollection", "jsx!view/admin/FamiliesPanel"
			], function(FamilyCollection, FamiliesPanel) {
				this.family_collection = this.family_collection || new FamilyCollection(null, {per_page: 6});
				React.render(<FamiliesPanel collection={this.family_collection} />,  document.getElementById("body"));
				this.family_collection.resetParams();
				this.family_collection.fetch();
			}.bind(this));
		},
		elections: function() {
			require([
				"model/ElectionCollection", "jsx!view/admin/ElectionsPanel"
			], function(ElectionCollection, ElectionsPanel) {
				this.election_collection = this.election_collection || new ElectionCollection(null, {per_page: 8});
				React.render(<ElectionsPanel collection={this.election_collection} />,  document.getElementById("body"));
				this.election_collection.resetParams();
				this.election_collection.fetch();
			}.bind(this));
		},
		datasets: function(username) {
			require([
				"model/DatasetCollection", "jsx!view/admin/DatasetsPanel"
			], function(DatasetCollection, DatasetsPanel) {
				this.dataset_collection[username] = this.dataset_collection[username] || new DatasetCollection(null, username ? {username: username} : null);
				React.render(<DatasetsPanel collection={this.dataset_collection[username]} />, document.getElementById("body"));
				this.dataset_collection[username].resetParams();
				this.dataset_collection[username].fetch();
			}.bind(this));
		},
		areas: function(username) {
			require([
				"model/AreaCollection", "jsx!view/admin/AreasPanel"
			], function(AreaCollection, AreasPanel) {
				this.area_collection = this.area_collection || new AreaCollection();
				React.render(<AreasPanel collection={this.area_collection} />, document.getElementById("body"));
				this.area_collection.resetParams();
				this.area_collection.fetch();
			}.bind(this));
		},
		users: function() {
			require([
				"model/UserCollection", "jsx!view/admin/UsersPanel"
			], function(UserCollection, UsersPanel) {
				this.user_collection = this.user_collection || new UserCollection();
				React.render(<UsersPanel collection={this.user_collection} />, document.getElementById("body"));
				this.user_collection.resetParams();
				this.user_collection.fetch();
			}.bind(this));
		},
	});
});