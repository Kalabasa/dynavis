"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Official = Backbone.Model.extend({
		defaults: {
			surname: null,
			name: null,
			nickname: null,
		},

		initialize: function() {
			var that = this;

			this.families = null;
			this.on("change:id", function(model, value, options) {
				that.families = new collections.OfficialFamily(null, {official_id: value});
			}, this);
			
			if(!this.isNew()) {
				this.families = new collections.OfficialFamily(null, {official_id: this.get("id")});
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

	models.OfficialSingle = models.Official.extend({urlRoot: "api.php/officials"});

	collections.Official = Backbone.PageableCollection.extend({
		model: models.Official,
		url: "api.php/officials",
		parse: function(data) {
			return data.data;
		},
	});
})();