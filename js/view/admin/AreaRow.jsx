"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		EditableName = require("jsx!view/EditableName"),
		TypeaheadInput = require("jsx!view/TypeaheadInput"),
		Name = require("jsx!view/Name"),
		ClickToTopMixin = require("mixin/ClickToTopMixin"),
		Va = require("validator"),
		ValidationMixin = require("mixin/ValidationMixin"),
		ValidationMessages = require("jsx!view/ValidationMessages"),
		ReactTransitionGroup = React.addons.TransitionGroup;

	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ValidationMixin, ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				code: this.format_code(this.model().get("code")),
				level: this.model().get("level") || "barangay",
			};
		},

		getValidationSchema: function() {
			return {
				name: Va.lidator().required().string(),
				code: Va.lidator().required().length(9).integerish(),
				level: Va.lidator().required(),
			};
		},
		getObjectToValidate: function() {
			return {
				name: this.refs.name.state.name,
				code: this.state.code,
				level: this.state.level,
			};
		},
		getValidationElementMap: function() {
			return {
				name: React.findDOMNode(this.refs.name),
				code: React.findDOMNode(this.refs.code),
				level: React.findDOMNode(this.refs.level),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		render: function() {
			var display = function(item) {
				return item.name;
			};

			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="edit">
						<ValidationMessages validation={this.state.validation} />
						<div className="pure-g">
							<label className="pure-u-1-2 pad">
								<div className="label">Name</div>
								<EditableName className="pure-u-1" ref="name" model={this.model()} />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Code</div>
								<input ref="code" className="pure-u-1" type="text" valueLink={this.linkState("code")} required />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Type</div>
								<select ref="level" className="pure-u-1" valueLink={this.linkState("level")} required>
									<option value="region">Region</option>
									<option value="province">Province</option>
									<option value="municipality">City/Municipality</option>
									<option value="barangay">Barangay</option>
								</select>
							</label>
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button className="pull-right button button-primary mar" onClick={this.handle_save}>Save</button>
								{cancel_button}
								<button className="pull-left button button-complement mar" onClick={this.handle_delete}>Delete</button>
							</div>
						</div>
					</SliderTransitionGroupChild></ReactTransitionGroup>
					</div>
				);
			}else{
				var type = {
					"region": "Region",
					"province": "Province",
					"municipality": "City/Municipality",
					"barangay": "Barangay",
				}[this.model().get("level")];
				return (
					<div className="data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="display">
						<div className="pure-g">
							<div className="pure-u-5-6">
								<div className="pure-g">
									<div className="pure-u-1 field-group">
										<Name className="pure-u-1 field text-large" model={this.model()} />
									</div>
								</div>
								<div className="pure-g">
									<div className="pure-u-1-3 field-group">
										<span className="pure-u-1-4 label">Type</span>
										<span className="pure-u-3-4 field">{type}</span>
									</div>
									<div className="pure-u-1-3 field-group">
										<span className="pure-u-1-4 label">PSGC</span>
										<span className="pure-u-3-4 field">{this.format_code(this.model().get("code"))}</span>
									</div>
								</div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
							</div>
						</div>
					</SliderTransitionGroupChild></ReactTransitionGroup>
					</div>
				);
			}
		},

		format_code: function(code) {
			if(!code) return null;
			return ("0" + code).slice(-9);
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.setState({edit: false});
		},

		handle_save: function() {
			var name = this.refs.name.state.name;

			if(!this.validate()) return;

			var code = parseInt(this.state.code);
			var level = this.state.level;

			this.save(code, name, level);
		},

		save: function(code, name, level) {
			var that = this;

			var new_attributes = {
				code: code,
				name: name,
				level: level,
			};

			var patch = !this.model().has("id")
				? new_attributes
				: _.omit(new_attributes, function(value, key, object) {
					return that.model().get(key) === value;
				});
			
			if(_.isEmpty(patch)) {
				this.setState({edit: false});
			}else{
				this.model().save(patch, {
					patch: this.model().has("id"),
					wait: true,
					success: function() {
						that.setState({edit: false});
					}
				});
			}
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});