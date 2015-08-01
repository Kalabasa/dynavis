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

define(["require", "underscore", "bloodhound"].concat(MODEL_PATHS_VALUES), function(require, _, Bloodhound) {
	var create_hound = function(path) {
		return new Bloodhound({
			queryTokenizer: Bloodhound.tokenizers.nonword,
			datumTokenizer: Bloodhound.tokenizers.obj.nonword,
			remote: {
				prepare: function(query, settings) {
					query.q = query.string; delete query.string;
					query.count = query.limit; delete query.limit;
					return _.extend(settings, {
						url: "api.php/" + path + "?" + _.map(_.keys(query), function(k) {
							var v = query[k];
							if(typeof v == "boolean") v = v ? 1 : 0;
							return encodeURIComponent(k) + "=" + encodeURIComponent(v);
						}).join("&"),
					});
				},
				url: "api.php/" + path + "?count=1",
				transform: function(data) { return data.data; },
			},
		});
	};

	var InstanceCache = function() {
		this.model_paths = MODEL_PATHS;
		this.active_list = [];
		this.hash = {};
		this.models = {};
		this.hounds = {
			"Official": create_hound("officials"),
			"Family": create_hound("families"),
			"Area": create_hound("areas"),
			"Party": create_hound("parties"),
		};
	};

	InstanceCache.prototype.get = function(name, id, fetch) {
		if(id !== id) return null; // for NaN

		this.remove_expired();
		
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

		if(fetch) instance.fetch();

		this.set_active(name, id);

		return instance;
	};

	InstanceCache.prototype.get_existing = function(name, id) {
		if(this.hash[name] && this.hash[name][id]) return this.hash[name][id];
		return null;
	};

	InstanceCache.prototype.set = function(name, key, value) {
		if(!this.hash[name]) this.hash[name] = {};
		this.hash[name][key] = value;
		this.set_active(name, key);
	};

	InstanceCache.prototype.delete = function(name, key) {
		if(this.hash[name]) delete this.hash[name][key];
	};

	InstanceCache.prototype.search = function(name, query, callback, async) {
		if(typeof query === "string") {
			query = {
				string: query,
				limit: 6,
			};
		}

		var callback_sync, callback_async;
		if(async) {
			callback_sync = callback;
			callback_async = async;
		}else{
			callback_sync = callback_async = (function() {
				var fin = false;
				var exec_count = 0;
				var collected_data = [];
				return function(data) {
					if(!fin) {
						exec_count++;
						collected_data = collected_data.concat(data);
						if (collected_data.length >= query.limit || exec_count == 2) {
							fin = true;
							callback(data);
						}
					}
				};
			})();
		}

		this.hounds[name].search(query, callback_sync, callback_async);
	};

	InstanceCache.prototype.set_active = function(name, key, time) {
		if (typeof time === "undefined") time = 60000;

		var obj = _.findWhere(this.active_list, {name: name, key: key});
		if(obj) {
			obj.expiry += time;
		}else{
			obj = {
				name: name,
				key: key,
				expiry: Date.now() + time,
			};
			this.active_list.push(obj);
		}
	};

	InstanceCache.prototype.remove_expired = function() {
		var now = Date.now();
		_.each(this.active_list, function(obj) {
			if(obj.expiry < now) {
				if(this.hash[obj.name]) delete this.hash[obj.name][obj.key];
			}
		}, this);
		this.active_list = _.reject(this.active_list, function(obj) {
			return obj.expiry < now;
		});
	};

	return new InstanceCache();
});

})();