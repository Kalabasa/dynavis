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
		this.token.on("change", this.check_login, this);
	};

	AdminApp.prototype.start = function() {
		if(!this.check_login()) return;

		this.header = React.render(<Header title="Dashboard" bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));

		Backbone.history.start();
	};

	AdminApp.prototype.check_login = function() {
		if(!this.token.get_user()) {
			React.unmountComponentAtNode(document.getElementById("header"));
			React.unmountComponentAtNode(document.getElementById("sidebar"));
			React.unmountComponentAtNode(document.getElementById("body"));
			window.location.href = "login.html?n=" + encodeURIComponent(window.location.href);
			return false;
		}else if(this.token.get_user_role() != "admin") {
			React.unmountComponentAtNode(document.getElementById("header"));
			React.unmountComponentAtNode(document.getElementById("sidebar"));
			React.unmountComponentAtNode(document.getElementById("body"));
			window.location.href = "index.html";
			return false;
		}
		return true;
	};

	return AdminApp;
});