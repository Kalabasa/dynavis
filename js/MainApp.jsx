"use strict";
define(function(require){
	var React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		MainRouter = require("jsx!MainRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/main/Sidebar");

	var MainApp = function() {
		this.token = new Token();
		this.bus = {
			router: new Events(),
			choropleth_settings: new Events(),
		};

		this.router = new MainRouter({bus: this.bus, token: this.token});
	};

	MainApp.prototype.start = function() {
		this.header = React.render(<Header title="Dashboard" token={this.token} bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	return MainApp;
});