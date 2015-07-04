"use strict";
define(function(require){
	var React = require("react"),
		Token = require("model/Token"),
		MainRouter = require("jsx!MainRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/main/Sidebar");

	var MainApp = function() {
		this.token = new Token();
		this.router = new MainRouter({token: this.token});
	};

	MainApp.prototype.start = function() {
		React.render(<Header model={this.token} />, document.getElementById("header"));
		React.render(<Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});