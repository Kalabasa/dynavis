"use strict";
define(function(require) {
	var Bloodhound = require("bloodhound"),
		OfficialSingle = require("model/OfficialSingle"),
		FamilySingle = require("model/FamilySingle"),
		Area = require("model/Area"),
		Party = require("model/Party"),
		Election = require("model/Election"),
		Dataset = require("model/Dataset"),
		User = require("model/User");

	var InstanceCache = function() {
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
			"Official": {},
			"Family": {},
			"Area": {},
			"Party": {},
			"Election": {},
			"Dataset": {},
			"User": {},
		};
		this.models = {
			"Official": OfficialSingle,
			"Family": FamilySingle,
			"Area": Area,
			"Party": Party,
			"Election": Election,
			"Dataset": Dataset,
			"User": User,
		};
		this.hounds = {
			"Official": create_hound("officials"),
			"Family": create_hound("families"),
			"Area": create_hound("areas"),
			"Party": create_hound("parties"),
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

	return new InstanceCache();
});