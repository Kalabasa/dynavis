"use strict";
define(function(require){
	var React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		InstanceCache = require("InstanceCache"),
		AdminRouter = require("jsx!AdminRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/admin/Sidebar");

	var AdminApp = function() {
		this.token = new Token();
		InstanceCache.set("Token", "session", this.token);

		this.bus = {
			router: new Events(),
		};

		this.router = new AdminRouter({bus: this.bus});
	};

	AdminApp.prototype.start = function() {
		this.header = React.render(<Header title="Dashboard" bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return AdminApp;
});