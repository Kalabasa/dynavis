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
			var classes = "data-row container-fluid";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				fields = [
					(<div className="row">
						<EditableName className="col-md-12" ref="name" model={this.model()} />
					</div>),
					(<div className="row">
						<div className="col-md-12">
							<button className="pull-left btn btn-danger" onClick={this.handle_delete}>Delete</button>
							<button className="pull-right btn btn-primary" onClick={this.handle_save}>Save</button>
							<button className="pull-right btn btn-default" onClick={this.handle_cancel}>Cancel</button>
						</div>
					</div>)
				];
			}else{
				fields = [
					(<div className="row">
						<Name className="field col-md-10 text-large" model={this.model()} />
						<div className="col-md-2">
							<button className="pull-right btn btn-default" onClick={this.handle_edit}>Edit</button>
						</div>
					</div>),
					(<FamilyMemberList collection={this.state.members} onDeleteMember={this.props.onDeleteMember} />)
				];
			}
			return (
				<div className={classes}>
					{fields}
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