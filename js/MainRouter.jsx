"use strict";
define(["backbone", "react", "InstanceCache"], function(Backbone, React, InstanceCache) {
	return Backbone.Router.extend({
		initialize: function(options) {
			this.bus = options.bus;
			this.listenTo(this, "route", this.on_route);
		},

		on_route: function(route, params) {
			this.bus.router.emit("route", {
				route: route,
				params: params,
			});
		},

		routes: {
			"": "main",
			"datasets": "datasets",
		},
		main: function() {
			var that = this;
			require([
				"jsx!view/main/MapPanel"
			], function(MapPanel) {
				React.render(<MapPanel bus={that.bus} />, document.getElementById("body"));
			});
		},
		datasets: function() {
			var that = this;
			require([
				"model/DatasetCollection", "jsx!view/main/DatasetsPanel"
			], function(DatasetCollection, DatasetsPanel) {
				var token = InstanceCache.get("Token", "session");
				var user = token ? token.get_user() : null;
				if(!user) {
					that.navigate("", true);
					return;
				}
				var dataset_collection = new DatasetCollection(null, {username: user.get("username")});
				dataset_collection.fetch();
				React.render(<DatasetsPanel collection={dataset_collection}/>, document.getElementById("body"));
			});
		},
	});
});