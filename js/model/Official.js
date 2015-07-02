"use strict";
define(["backbone", "model/OfficialFamilyCollection"], function(Backbone, OfficialFamilyCollection) {
	return Backbone.Model.extend({
		defaults: {
			surname: null,
			name: null,
			nickname: null,
		},

		initialize: function() {
			var that = this;

			this.families = null;
			this.on("change:id", function(model, value, options) {
				that.families = new OfficialFamilyCollection(null, {official_id: value});
			}, this);
			
			if(!this.isNew()) {
				this.families = new OfficialFamilyCollection(null, {official_id: this.get("id")});
			}
		},

		get_families: function() {
			return this.families;
		},

		get_full_name: function() {
			var nickname = null;
			if(this.get("nickname")) {
				nickname = ' "' + this.get("nickname") + '"';
			}else{
				nickname = "";
			}
			return this.get("surname") + ", " + this.get("name") + nickname;
		},
	});
});