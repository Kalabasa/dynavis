"use strict";
define(function(require){
	var React = require("react"),
		Token = require("model/Token"),
		AdminRouter = require("jsx!AdminRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/admin/Sidebar");

	var AdminApp = function() {
		this.router = new AdminRouter();
		this.router.on("route", this.on_route, this);

		this.token = new Token();
	};

	AdminApp.prototype.on_route = function(route, params) {
		this.header.set_title(route);
	};

	AdminApp.prototype.start = function() {
		this.header = React.render(<Header title="Dashboard" />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar token={this.token} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return AdminApp;
});