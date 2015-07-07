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
		this.router.on("route", this.on_route, this);
	};

	MainApp.prototype.on_route = function(route, params) {
		this.header.set_title(route);
	};

	MainApp.prototype.start = function() {
		this.header = React.render(<Header title="Dashboard" />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar token={this.token} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});