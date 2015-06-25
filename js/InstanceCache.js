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
			"official": models.OfficialSingle,
			"family": models.FamilySingle,
			"area": models.AreaSingle,
			// "party": models.PartySingle,
			"user": models.UserSingle,
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