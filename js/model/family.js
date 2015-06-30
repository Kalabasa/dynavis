"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Family = Backbone.Model.extend({
		defaults: {
			name: null,
		},

		initialize: function() {
			var that = this;

			this.members = null;
			this.on("change:id", function(model, value, options) {
				that.members = new collections.FamilyMember(null, {family_id: value});
			}, this);
			
			if(!this.isNew()) {
				that.members = new collections.FamilyMember(null, {family_id: this.get("id")});
			}
		},

		get_members: function() {
			return this.members;
		},
	});

	models.FamilySingle = models.Family.extend({urlRoot: "api.php/families"});

	collections.Family = Backbone.PageableCollection.extend({
		model: models.Family,
		url: "api.php/families",
		parse: function(data) {
			return data.data;
		},
	});
})();