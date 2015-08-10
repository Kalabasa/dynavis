"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		Name = require("jsx!view/Name"),
		TypeaheadInput = require("jsx!view/TypeaheadInput"),
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
				year: this.model().get("year"),
				value: this.model().get("value"),
			};
		},

		getValidationSchema: function() {
			return {
				area: Va.lidator().required().object(),
				year: Va.lidator().required().integerish(),
				value: Va.lidator().required().floatish(),
			};
		},
		getObjectToValidate: function() {
			return {
				area: this.refs.area.state.selected,
				year: this.state.year,
				value: this.state.value,
			};
		},
		getValidationElementMap: function() {
			return {
				area: React.findDOMNode(this.refs.area),
				year: React.findDOMNode(this.refs.year),
				value: React.findDOMNode(this.refs.value),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		render: function() {
			var display = function(item) {
				return item.name;
			};
			var area_code = this.model().get("area_code");
			var area = area_code ? InstanceCache.get("Area", area_code, true) : null;

			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="edit">
						<ValidationMessages validation={this.state.validation} />
						<div className="pure-g">
							<label className="pure-u-1-3 pad">
								<TypeaheadInput className="pure-u-1"
									for="Area"
									ref="area"
									display={display}
									model={area}
									placeholder="Area"
									required autoFocus />
							</label>
							<label className="pure-u-1-3 pad">
								<input ref="year" className="pure-u-1" type="number" placeholder="Year" valueLink={this.linkState("year")} required />
							</label>
							<label className="pure-u-1-3 pad">
								<input ref="value" className="pure-u-1" type="number" placeholder="Value" valueLink={this.linkState("value")} required />
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
				return (
					<div className="data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="display">
						<div className="pure-g">
							<div className="pure-u-5-6">
								<div className="pure-u-1-3">
									<Name className="field pad" model={area} />
								</div>
								<div className="pure-u-1-3">
									<span className="field pad">{this.model().get("year")}</span>
								</div>
								<div className="pure-u-1-3">
									<span className="field pad">{this.model().get("value")}</span>
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

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.resetValidation();
			this.setState({edit: false});
		},

		handle_save: function() {
			var that = this;

			if(!this.validate()) return;

			var new_attributes = {
				year: parseInt(this.state.year, 10),
				area_code: this.refs.area.state.selected.code,
				value: parseFloat(this.state.value),
			};

			var patch = this.model().isNew()
				? new_attributes
				: _.omit(new_attributes, function(value, key, object) {
					return that.model().get(key) === value;
				});
			
			if(_.isEmpty(patch)) {
				this.setState({edit: false});
			}else{
				this.model().save(patch, {
					patch: !this.model().isNew(),
					wait: true,
					success: function() {
						that.setState({edit: false});
					},
				});
			}
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
});