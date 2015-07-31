"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		OfficialFamilyCollection = require("model/OfficialFamilyCollection"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		EditableOfficialName = require("jsx!view/EditableOfficialName"),
		OfficialName = require("jsx!view/OfficialName"),
		OfficialFamilyList = require("jsx!view/admin/OfficialFamilyList"),
		ClickToTopMixin = require("mixin/ClickToTopMixin"),
		Va = require("validator"),
		ValidationMixin = require("mixin/ValidationMixin"),
		ValidationMessages = require("jsx!view/ValidationMessages"),
		ReactTransitionGroup = React.addons.TransitionGroup;

	return React.createBackboneClass({
		mixins: [ValidationMixin, ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				families: new OfficialFamilyCollection(null, {official_id: this.model().id}),
			};
		},

		componentWillMount: function() {
			this.state.families.fetch();
		},

		getValidationSchema: function() {
			return {
				surname: Va.lidator().required().string(),
				name: Va.lidator().required().string(),
				nickname: Va.lidator().string(),
			};
		},
		getObjectToValidate: function() {
			return {
				surname: this.refs.name.state.surname,
				name: this.refs.name.state.name,
				nickname: this.refs.name.state.nickname,
			};
		},
		getValidationElementMap: function() {
			return {
				surname: React.findDOMNode(this.refs.name.get_input_surname()),
				name: React.findDOMNode(this.refs.name.get_input_name()),
				nickname: React.findDOMNode(this.refs.name.get_input_nickname()),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		render: function() {
			var classes = "data-row";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				fields = (
					<form onSubmit={this.handle_save}>
						<ValidationMessages validation={this.state.validation} />
						<div className="pure-g form">
							<EditableOfficialName className="pure-u-1" ref="name" model={this.model()} />
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button className="pull-right button button-primary mar" type="submit" onClick={this.handle_save}>Save</button>
								<button className="pull-right button mar" type="button" onClick={this.handle_cancel}>Cancel</button>
							</div>
						</div>
					</form>
				);
			}else{
				fields = [
					(<div className="pure-g form">
						<OfficialName className="field pure-u-5-6 text-large" model={this.model()} />
						<div className="pure-u-1-6">
							<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
						</div>
					</div>),
					(<OfficialFamilyList collection={this.state.families} />)
				];
			}
			return (
				<div className={classes}>
				<ReactTransitionGroup><SliderTransitionGroupChild key={classes}>
					{fields}
				</SliderTransitionGroupChild></ReactTransitionGroup>
				</div>
			);
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.resetValidation();
			this.setState({edit: false});
		},

		handle_save: function(e) {
			e.preventDefault();
			var that = this;

			if(!this.validate()) return;

			var patch = this.model().isNew()
				? this.refs.name.state
				: _.omit(this.refs.name.state, function(value, key, object) {
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
					}
				});
			}
		},
	});
});