"use strict";
define(["backbone", "model/FamilyMemberCollection"], function(Backbone, FamilyMemberCollection) {
	return Backbone.Model.extend({
		defaults: {
			name: null,
		},

		get_members: function() {
			if(this.members === undefined) {
				var that = this;

				this.members = null;
				this.on("change:id", function(model, value, options) {
					that.members = new FamilyMemberCollection(null, {family_id: value});
				}, this);
				
				if(!this.isNew()) {
					that.members = new FamilyMemberCollection(null, {family_id: this.get("id")});
				}
			}

			return this.members;
		},
	});
});