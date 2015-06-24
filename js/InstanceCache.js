"use strict";
var InstanceCache = InstanceCache || null;
var models = models || {};
(function() {
	InstanceCache = function() {
		this.hash = {
			"official": {},
			"family": {},
			"area": {},
			"party": {},
			"user": {},
		};
		this.models = {
			"official": models.Official.extend({urlRoot: "api.php/officials"}),
			"family": models.Family.extend({urlRoot: "api.php/families"}),
			"area": models.Area.extend({urlRoot: "api.php/areas"}),
			// "party": models.Party.extend({urlRoot: "api.php/parties"}),
			"user": models.User.extend({urlRoot: "api.php/users"}),
		};
	};

	InstanceCache.prototype.get = function(name, id) {
		if(this.hash[name][id]) {
			return this.hash[name][id];
		}
		var instance = this.hash[name][id] = new this.models[name]({id: id});
		instance.fetch();
		return instance;
	};
})();