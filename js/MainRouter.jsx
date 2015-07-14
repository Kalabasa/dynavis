"use strict";
define(["backbone", "react"], function(Backbone, React) {
	return Backbone.Router.extend({
		initialize: function(options) {
			this.bus = options.bus;
			this.token = options.token;
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
				var user = that.token.get_user();
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