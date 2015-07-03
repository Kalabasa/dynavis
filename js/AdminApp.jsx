"use strict";
define(function(require){
	var Backbone = require("backbone"),
		React = require("react"),
		Token = require("model/Token"),
		AdminRouter = require("jsx!AdminRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/admin/Sidebar");

	var AdminApp = function() {
		this.token = new Token();
		this.router = new AdminRouter();
	};

	AdminApp.prototype.start = function() {
		React.render(<Header model={this.token} />, document.getElementById("header"));
		React.render(<Sidebar />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return AdminApp;
});