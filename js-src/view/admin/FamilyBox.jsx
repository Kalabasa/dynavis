"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		FamilyMemberCollection = require("model/FamilyMemberCollection"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		EditableName = require("jsx!view/EditableName"),
		Name = require("jsx!view/Name"),
		FamilyMemberList = require("jsx!view/admin/FamilyMemberList"),
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
				members: new FamilyMemberCollection(null, {family_id: this.model().id}),
			};
		},

		getValidationSchema: function() {
			return {
				name: Va.lidator().required().string(),
			};
		},
		getObjectToValidate: function() {
			return {
				name: this.refs.name.state.name,
			};
		},
		getValidationElementMap: function() {
			return {
				name: React.findDOMNode(this.refs.name),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		componentWillMount: function() {
			if(!this.model().isNew()) {
				this.state.members.fetch();
				this.state.members.on("remove", this.check_empty, this);
			}
		},

		componentDidUnmount: function() {
			if(!this.model().isNew()) {
				this.state.members.off("remove", this.check_empty, this);
			}
		},
		
		render: function() {
			var classes = "data-row";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" type="reset" onClick={this.handle_cancel}>Cancel</button>;
				}
				fields = (
					<form onSubmit={this.handle_save}>
						<ValidationMessages validation={this.state.validation} />
						<div className="pure-g form pad">
							<EditableName className="pure-u-1" ref="name" model={this.model()} autoFocus />
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button ref="save" className="pull-right button button-primary mar" type="submit">Save</button>
								{cancel_button}
								<button className="pull-left button button-complement mar" type="button" onClick={this.handle_delete}>Delete</button>
							</div>
						</div>
					</form>
				);
			}else{
				fields = [
					(<div className="pure-g">
						<Name className="field pure-u-5-6 text-large" model={this.model()} />
						<div className="pure-u-1-6">
							<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
						</div>
					</div>),
					(<FamilyMemberList collection={this.state.members} onDeleteMember={this.props.onDeleteMember} />)
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

		check_empty: function() {
			if(this.state.members.size() == 0) {
				this.model().destroy();
			}
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

			if(!this.validate()) return;

			var that = this;
			var new_name = this.refs.name.state.name;
			if(!this.model().isNew() && this.model().get("name") === new_name) {
				this.setState({edit: false});
			}else{
				this.model().save({name: new_name}, {
					patch: !this.model().isNew(),
					wait: true,
					success: function() {
						that.setState({edit: false});
					}
				});
			}
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},
	});
});