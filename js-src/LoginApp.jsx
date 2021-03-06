"use strict";
define(function(require){
	var Backbone = require("backbone"),
		React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		InstanceCache = require("InstanceCache"),
		LoginPage = require("jsx!view/login/LoginPage");

	var LoginApp = function() {
		this.token = new Token();
		InstanceCache.set("Token", "session", this.token, false);
	};

	LoginApp.prototype.start = function() {
		if(this.token.get_user()) {
			this.on_login();
		}else{
			this.login = React.render(<LoginPage model={this.token} onLogin={this.on_login.bind(this)} />, document.getElementById("body"));
			Backbone.history.start();
		}
	};

	LoginApp.prototype.on_login = function() {
		var target = (location.search.split("n=")[1]||"").split("&")[0] || (this.token.get_user_role() == "admin" ? "admin" : "app");
		window.location.href = decodeURIComponent(target);
	};

	return LoginApp;
});