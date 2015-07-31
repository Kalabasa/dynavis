"use strict";
define(["underscore"], function(_) {
	var Va = function(schema) {
		this.schema = schema || {};
	};

	Va.prototype.lidate = function(object, whitelist) {
		var valid = true;
		var messages = {};

		var keys = _.union(_.keys(object), _.keys(this.schema));
		if(whitelist) keys = _.pick(keys, whitelist);

		_.each(keys, function(k) {
			var validator = this.schema[k];
			if(!validator) {
				valid = false;
				messages[k] = "is an unknown property";
			}
			validator = validator.root;
			var err, value = object[k];
			do {
				if(validator.getErrorMsg && (err = validator.getErrorMsg(value, object)) !== null) {
					valid = false;
					messages[k] = err;
					break;
				}
				validator = validator.next;
			}while(validator);
		}, this);

		return {
			valid: valid,
			messages: messages,
		};
	};

	Va.lidator = function() {
		return new Va.Node();
	};

	Va.Node = function() {
		this.getErrorMsg = null;
		this.next = null;
		this.root = this;
	};

	Va.Node.prototype._end = function() {
		this.next = new Va.Node();
		this.next.root = this.root;
		return this.next;
	};

	Va.Node.prototype.optional_if = function(condition) {
		this.getErrorMsg = function(obj, others) {
			if(condition(obj, others)) this.next = null;
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.custom = function(method, errorMessage) {
		this.getErrorMsg = function(obj, others) {
			if(!method(obj, others)) return errorMessage;
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.any = function() {
		this.getErrorMsg = function(obj) {
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.required = function() {
		this.getErrorMsg = function(obj) {
			if(!obj) return "is required";
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.object = function() {
		this.getErrorMsg = function(obj) {
			if(obj === null) return null;
			if(typeof obj !== "object") return "must be an object";
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.string = function(minLen, maxLen) {
		minLen = minLen || 0;
		maxLen = maxLen || Infinity;
		this.getErrorMsg = function(obj) {
			if(obj === null) return null;
			if(typeof obj !== "string") return "must be a string";
			var clauses = [];
			if(minLen > 0) clauses.push("at least " + minLen + " characters long");
			if(maxLen < Infinity) clauses.push("not longer than " + maxLen + " characters");
			if(obj.length < minLen || obj.length > maxLen) return "must be " + clauses.join(" but ");
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.integerish = function(min, max) {
		min = min || 0;
		max = max || Infinity;
		this.getErrorMsg = function(obj) {
			// http://stackoverflow.com/a/14794066
			var msg = "must be an integer";
			if(obj === null) return null;
			var x;
			if (isNaN(obj)) return msg;
			x = parseFloat(obj);
			if((x | 0) !== x) return msg;
			var clauses = [];
			if(min > 0) clauses.push("at least " + min);
			if(max < Infinity) clauses.push("not greater than " + max);
			if(x < min || x > max) return "must be " + clauses.join(" but ");
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.lessThan = function(value) {
		this.getErrorMsg = function(obj, others) {
			var y = value, yname = value;
			if(typeof value === "object") {
				var key = value.key;
				y = parseFloat(others[key]);
				yname = key;
			}
			if(parseFloat(obj) >= y) return "must be less than " + yname;
			return null;
		};
		return this._end();
	};
	Va.Node.prototype.greaterThan = function(value) {
		this.getErrorMsg = function(obj, others) {
			var y = value, yname = value;
			if(typeof value === "object") {
				var key = value.key;
				y = parseFloat(others[key]);
				yname = key;
			}
			if(parseFloat(obj) <= y) return "must be greater than " + yname;
			return null;
		};
		return this._end();
	};

	return Va;
});