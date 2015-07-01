"use strict";
var InstanceCache = InstanceCache || null;
var models = models || {};
(function() {
	InstanceCache = function() {
		var create_hound = function(path) {
			return new Bloodhound({
				queryTokenizer: Bloodhound.tokenizers.nonword,
				datumTokenizer: Bloodhound.tokenizers.nonword,
				remote: {
					cache: false,
					url: "api.php/" + path + "?q=%QUERY",
					wildcard: "%QUERY",
					transform: function(data) { return data.data; },
				},
			});
		};

		this.hash = {
			"official": {},
			"family": {},
			"area": {},
			"party": {},
			"election": {},
			"dataset": {},
			"user": {},
		};
		this.models = {
			"official": models.OfficialSingle,
			"family": models.FamilySingle,
			"area": models.AreaSingle,
			"party": models.PartySingle,
			"election": models.ElectionSingle,
			"dataset": models.DatasetSingle,
			"user": models.UserSingle,
		};
		this.hounds = {
			"official": create_hound("officials"),
			"family": create_hound("families"),
			"area": create_hound("areas"),
			"party": create_hound("parties"),
		};
	};

	InstanceCache.prototype.get = function(name, id) {
		if(isNaN(id) || typeof id !== "number") {
			return null;
		}

		if(this.hash[name][id]) {
			return this.hash[name][id];
		}

		var instance = this.hash[name][id] = new this.models[name]();
		instance.set(instance.idAttribute, id);
		instance.fetch();

		return instance;
	};

	InstanceCache.prototype.search = function(name, query, sync, async) {
		this.hounds[name].search(query, sync, async);
	};
})();