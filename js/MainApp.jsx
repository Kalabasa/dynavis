"use strict";
define(function(require){
	var React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		InstanceCache = require("InstanceCache"),
		MainRouter = require("jsx!MainRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/main/Sidebar");

	var MainApp = function() {
		this.token = new Token();
		InstanceCache.set("Token", "session", this.token);
		this.bus = {
			router: new Events(),
			main_settings: new Events(),
			choropleth_settings: new Events(),
			tagcloud_settings: new Events(),
		};

		this.router = new MainRouter({bus: this.bus});
	};

	MainApp.prototype.start = function() {
		this.header = React.render(<Header title="" bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});