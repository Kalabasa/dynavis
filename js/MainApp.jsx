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
		Header = require("jsx!view/Header");

	var MainApp = function() {
		var that = this;

		this.router = new (Backbone.Router.extend({
			routes: {
				"": "main"
			},
			main: function() {
				React.render(<img />, document.getElementById("body"));
			},
		}))();
	};

	MainApp.prototype.start = function() {
		React.render(<Header model={new Token()} />, document.getElementById("header"));
		// React.render(<Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});