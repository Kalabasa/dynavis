"use strict";
define(["underscore", "react", "jsx!view/SliderTransitionGroupChild", "jsx!view/EditableName", "mixin/ClickToTopMixin", "react.backbone"], function(_, React, SliderTransitionGroupChild, EditableName, ClickToTopMixin) {
	var ReactTransitionGroup = React.addons.TransitionGroup;
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				name: this.model().get("name"),
				description: this.model().get("description"),
			};
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
								<input className="pure-u-1" type="text" valueLink={this.linkState("description")} required />
							</label>
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button className="pull-left button button-complement mar" onClick={this.handle_delete}>Delete</button>
								<button className="pull-right button button-primary mar" onClick={this.handle_save}>Save</button>
								{cancel_button}
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
								<div className="field text pad">{this.model().get("description")}</div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit description</button>
								<a href={"#datasets/" + this.model().get("username") + "/" + this.model().id}>
									<button className="pull-right button button-flat">Update data</button>
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
			this.setState({edit: false});
		},

		handle_save: function() {
			var that = this;

			var new_attributes = {
				name: this.state.name,
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
			this.model().destroy({wait: true});
		},
	});
});