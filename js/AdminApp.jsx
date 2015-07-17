"use strict";
define(function(require){
	var React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		AdminRouter = require("jsx!AdminRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/admin/Sidebar");

	var AdminApp = function() {
		this.token = new Token();
		this.bus = {
			router: new Events(),
		};

		this.router = new AdminRouter({token: this.token, bus: this.bus});
	};

	AdminApp.prototype.start = function() {
		this.header = React.render(<Header title="Dashboard" token={this.token} bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return AdminApp;
});