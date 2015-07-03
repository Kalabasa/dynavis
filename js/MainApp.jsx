"use strict";
define(function(require){
	var React = require("react"),
		Token = require("model/Token"),
		MainRouter = require("jsx!MainRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/main/Sidebar");

	var MainApp = function() {
		this.router = new MainRouter();
	};

	MainApp.prototype.start = function() {
		React.render(<Header model={new Token()} />, document.getElementById("header"));
		React.render(<Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});