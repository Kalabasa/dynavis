"use strict";
define(["underscore", "validator"], function(_, Va) {
	return {
		getInitialState: function() {
			return {
				validation: {
					valid: true,
					messages: {},
				}
			};
		},

		componentWillMount: function() {
			this._va = new Va(this.getValidationSchema());
		},

		resetValidation: function() {
			this.setState({
				validation: {
					valid: true,
					messages: {},
				}
			});
		},

		validate: function(keys) {
			var obj = this.getObjectToValidate();
			var result = this._va.lidate(obj, keys);
			this.setState({validation: result});
			if(result.valid) {
				_.mapObject(obj, function(value, key) {
					this._validationResult(key, true, null);
				}, this);
			}else{
				_.mapObject(result.messages, function(message, key) {
					this._validationResult(key, false, message);
				}, this);
			}
			return result.valid;
		},

		validationOverride: function(key, valid, message) {
			var result = this.state.validation;
			result.valid = valid;
			result.messages[key] = message;
			this.setState({validation: result});
			this._validationResult(key, valid, message);
		},

		_validationResult: function(key, valid, message) {
			if(typeof this.validationCallback === "function") this.validationCallback(key, valid, message);
			if(typeof this.getValidationElementMap === "function") {
				var element = this.getValidationElementMap()[key];
				if(element) {
					$(element)[valid?"removeClass":"addClass"]("validation-error");
				}
			}
		},
	};
});