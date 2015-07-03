"use strict";
define(function(require){
	var Backbone = require("backbone"),
		React = require("react"),
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