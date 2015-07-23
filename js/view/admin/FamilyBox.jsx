"use strict";
define(["react", "model/FamilyMemberCollection", "jsx!view/SliderTransitionGroupChild", "jsx!view/EditableName", "jsx!view/Name", "jsx!view/admin/FamilyMemberList", "mixin/ClickToTopMixin", "react.backbone"], function(React, FamilyMemberCollection, SliderTransitionGroupChild, EditableName, Name, FamilyMemberList, ClickToTopMixin) {
	var ReactTransitionGroup = React.addons.TransitionGroup;
	return React.createBackboneClass({
		mixins: [ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				members: new FamilyMemberCollection(null, {family_id: this.model().id}),
			};
		},

		componentWillMount: function() {
			this.state.members.fetch();
		},
		
		render: function() {
			var classes = "data-row";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				fields = [
					(<div className="pure-g form pad">
						<EditableName className="pure-u-1" ref="name" model={this.model()} />
					</div>),
					(<div className="pure-g">
						<div className="pure-u-1">
							<button className="pull-left button button-complement mar" onClick={this.handle_delete}>Delete</button>
							<button className="pull-right button button-primary mar" onClick={this.handle_save}>Save</button>
							<button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>
						</div>
					</div>)
				];
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

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.setState({edit: false});
		},

		handle_save: function() {
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