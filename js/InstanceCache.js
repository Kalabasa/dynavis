"use strict";
(function() {

var MODEL_PATHS = {
	"Official": "model/OfficialSingle",
	"Family": "model/FamilySingle",
	"Area": "model/Area",
	"Party": "model/Party",
	"Election": "model/Election",
	"Dataset": "model/Dataset",
	"User": "model/User",
	"Token": "model/Token",
};

var MODEL_PATHS_VALUES = []
for(var key in MODEL_PATHS) {
	MODEL_PATHS_VALUES.push(MODEL_PATHS[key]);
}

define(["require", "bloodhound"].concat(MODEL_PATHS_VALUES), function(require, Bloodhound) {
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

	var InstanceCache = function() {
		this.model_paths = MODEL_PATHS;
		this.hash = {};
		this.models = {};
		this.hounds = {
			"Official": create_hound("officials"),
			"Family": create_hound("families"),
			"Area": create_hound("areas"),
			"Party": create_hound("parties"),
		};
	};

	InstanceCache.prototype.get = function(name, id) {
		if(id !== id) return null; // for NaN
		
		if(this.hash[name]) {
			if(this.hash[name][id]) {
				return this.hash[name][id];
			}
		}else{
			this.hash[name] = {};
		}

		if(!this.models[name]) {
			this.models[name] = require(this.model_paths[name]);
		}

		var instance = this.hash[name][id] = new this.models[name]();
		instance.set(instance.idAttribute, id);

		return instance;
	};

	InstanceCache.prototype.get_existing = function(name, id) {
		if(this.hash[name] && this.hash[name][id]) return this.hash[name][id];
		return null;
	};

	InstanceCache.prototype.set = function(name, key, value) {
		if(!this.hash[name]) this.hash[name] = {};
		this.hash[name][key] = value;
	};

	InstanceCache.prototype.search = function(name, query, sync, async) {
		this.hounds[name].search(query, sync, async);
	};

	return new InstanceCache();
});

})();