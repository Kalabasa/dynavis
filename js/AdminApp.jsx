"use strict";
define(function(require){
	var Backbone = require("backbone"),
		React = require("react"),
		InstanceCache = require("InstanceCache"),
		OfficialCollection = require("model/OfficialCollection"),
		FamilyCollection = require("model/FamilyCollection"),
		ElectionCollection = require("model/ElectionCollection"),
		DatasetCollection = require("model/DatasetCollection"),
		UserCollection = require("model/UserCollection"),
		Token = require("model/Token"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/admin/Sidebar"),
		OfficialsPanel = require("jsx!view/admin/OfficialsPanel"),
		FamiliesPanel = require("jsx!view/admin/FamiliesPanel"),
		ElectionsPanel = require("jsx!view/admin/ElectionsPanel"),
		DatasetsPanel = require("jsx!view/admin/DatasetsPanel"),
		UsersPanel = require("jsx!view/admin/UsersPanel");

	var AdminApp = function() {
		var that = this;

		this.router = new (Backbone.Router.extend({
			routes: {
				"": "users", // FIXME: add home page?
				"officials": "officials",
				"families": "families",
				"elections": "elections",
				"(users/:username/)datasets": "datasets",
				"users": "users",
			},
			officials: function() {
				var official_collection = new OfficialCollection();
				React.render(<OfficialsPanel collection={official_collection} />, document.getElementById("body"));
				official_collection.fetch();
			},
			families: function() {
				var family_collection = new FamilyCollection(null, {per_page: 10});
				React.render(<FamiliesPanel collection={family_collection} />,  document.getElementById("body"));
				family_collection.fetch();
			},
			elections: function() {
				var election_collection = new ElectionCollection();
				React.render(<ElectionsPanel collection={election_collection} />,  document.getElementById("body"));
				election_collection.fetch();
			},
			datasets: function(username) {
				var dataset_collection = new DatasetCollection(username ? {username: username} : null);
				React.render(<DatasetsPanel collection={dataset_collection} />, document.getElementById("body"));
				dataset_collection.fetch();
			},
			users: function() {
				var user_collection = new UserCollection();
				React.render(<UsersPanel collection={user_collection} />, document.getElementById("body"));
				user_collection.fetch();
			},
		}))();
	};

	AdminApp.prototype.start = function() {
		var token = new Token();
		React.render(<Header model={token} />, document.getElementById("header"));
		React.render(<Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return AdminApp;
});