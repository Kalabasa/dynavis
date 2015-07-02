"use strict";
define(["backbone", "model/FamilyMemberCollection"], function(Backbone, FamilyMemberCollection) {
	return Backbone.Model.extend({
		defaults: {
			name: null,
		},

		initialize: function() {
			var that = this;

			this.members = null;
			this.on("change:id", function(model, value, options) {
				that.members = new FamilyMemberCollection(null, {family_id: value});
			}, this);
			
			if(!this.isNew()) {
				that.members = new FamilyMemberCollection(null, {family_id: this.get("id")});
			}
		},

		get_members: function() {
			return this.members;
		},
	});
});