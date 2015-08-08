"use strict";
define(["jquery", "backbone", "model/Election"], function($, Backbone, Election) {
	return Backbone.Collection.extend({
		model: Election,
		initialize: function(models, options) {
			this.area = options.area;
			this.area_id = this.area.get("id");
			this.area_code = this.area.get("code");
		},
		url: function() {
			if(this.area_id)
				return "api.php/areas/id/" + encodeURIComponent(this.area_id) + "/elections";
			else 
				return "api.php/areas/" + encodeURIComponent(this.area_code) + "/elections";
		},
		parse: function(data) {
			return data.data;
		},
	});
});