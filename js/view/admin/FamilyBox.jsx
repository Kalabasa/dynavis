"use strict";
define(["react", "model/FamilyMemberCollection", "jsx!view/EditableName", "jsx!view/Name", "jsx!view/admin/FamilyMemberList", "react.backbone"], function(React, FamilyMemberCollection, EditableName, Name, FamilyMemberList) {
	return React.createBackboneClass({
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
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				fields = (
					<div>
						<EditableName ref="name" model={this.model()} />
						<button onClick={this.handle_save}>Save</button>
						<button onClick={this.handle_cancel}>Cancel</button>
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				);
			}else{
				fields = (
					<div>
						<Name model={this.model()} />
						<button onClick={this.handle_edit}>Edit</button>
					</div>
				);
			}
			return (
				<li>
					{fields}
					<FamilyMemberList collection={this.state.members} onDeleteMember={this.props.onDeleteMember} />
				</li>
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