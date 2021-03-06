"use strict";
define(function(require){
	var Backbone = require("backbone"),
		React = require("react"),
		Events = require("minivents"),
		Token = require("model/Token"),
		InstanceCache = require("InstanceCache"),
		MainRouter = require("jsx!MainRouter"),
		Header = require("jsx!view/Header"),
		Sidebar = require("jsx!view/main/Sidebar"),
		Infobar = require("jsx!view/main/Infobar"),
		ChoroplethDataProcessor = require("ChoroplethDataProcessor"),
		TagCloudDataProcessor = require("TagCloudDataProcessor");

	var MainApp = function() {
		this.token = new Token();
		InstanceCache.set("Token", "session", this.token, false);
		this.bus = {
			router: new Events(),
			
			main_settings: new Events(),
			choropleth_settings: new Events(),
			tagcloud_settings: new Events(),
			
			choropleth_data: new Events(),
			tagcloud_data: new Events(),
		};

		new ChoroplethDataProcessor(this.bus);
		new TagCloudDataProcessor(this.bus);

		this.router = new MainRouter({bus: this.bus});
		this.token.on("change", this.check_login, this);
	};

	MainApp.prototype.start = function() {
		this.header = React.render(<Header title="" bus={this.bus} />, document.getElementById("header"));
		this.sidebar = React.render(<Sidebar bus={this.bus} />, document.getElementById("sidebar"));
		this.infobar = React.render(<Infobar bus={this.bus} />, document.getElementById("infobar"));

		Backbone.history.start();
	};

	MainApp.prototype.check_login = function() {
		if(Backbone.history.getFragment() !== "" && !this.token.get_user()) {
			this.router.navigate("", true);
			return false;
		}
		return true;
	};

	return MainApp;
});