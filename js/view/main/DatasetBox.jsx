"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		EditableName = require("jsx!view/EditableName"),
		ClickToTopMixin = require("mixin/ClickToTopMixin"),
		Va = require("validator"),
		ValidationMixin = require("mixin/ValidationMixin"),
		ValidationMessages = require("jsx!view/ValidationMessages"),
		Notification = require("jsx!view/Notification"),
		ReactTransitionGroup = React.addons.TransitionGroup;
		
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ValidationMixin, ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				description: this.model().get("description"),
			};
		},

		getValidationSchema: function() {
			return {
				name: Va.lidator().required().string(),
				description: Va.lidator().required().string(),
			};
		},
		getObjectToValidate: function() {
			return {
				name: this.refs.name.state.name,
				description: this.state.description,
			};
		},
		getValidationElementMap: function() {
			return {
				name: React.findDOMNode(this.refs.name),
				description: React.findDOMNode(this.refs.description),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		render: function() {
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="edit">
						<div className="pure-g">
							<label className="pure-u-1 pad">
								<div className="label">Name</div>
								<EditableName className="pure-u-1" ref="name" model={this.model()} />
							</label>
							<label className="pure-u-1 pad">
								<div className="label">Description</div>
								<input ref="description" className="pure-u-1" type="text" valueLink={this.linkState("description")} required />
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
								<div className="field text-large pad">{this.model().get("name")}</div>
								<div className="field text pad"><pre>{this.model().get("description")}</pre></div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
								<a href={"#datasets/" + this.model().get("username") + "/" + this.model().id}>
									<button className="pull-right button button-flat">Update</button>
								</a>
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
				name: this.refs.name.state.name,
				description: this.state.description,
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
			var name = this.model().get("name");
			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting {name}...</span>, 0);
			this.model().destroy({
				wait: true,
				success: function(){
					Notification.replace(notif, <span><i className="fa fa-trash"/>&ensp;{name} deleted</span>);
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});