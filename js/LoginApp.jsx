"use strict";
define(function(require){
	var React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		InstanceCache = require("InstanceCache"),
		LoginPage = require("jsx!view/login/LoginPage");

	var MainApp = function() {
		this.token = new Token();
		InstanceCache.set("Token", "session", this.token);
	};

	MainApp.prototype.start = function() {
		this.login = React.render(<LoginPage model={this.token} onLogin={this.on_login} />, document.getElementById("body"));
		Backbone.history.start();
	};

	MainApp.prototype.on_login = function() {
		var target = (location.search.split("n=")[1]||"").split("&")[0] || ".";
		window.location.href = decodeURIComponent(target);
	};

	return MainApp;
});