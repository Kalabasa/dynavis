"use strict";
var components = components || {};
(function(){
	components.FamilyBox = React.createBackboneClass({
		getInitialState: function() {
			return {
				edit: false,
			};
		},

		componentWillMount: function() {
			this.model().get_members().fetch();
		},
		
		render: function() {
			var info = null;
			if(this.state.edit) {
				info = (
					<div>
						<components.EditableName ref="name" model={this.model()} />
						<button onClick={this.handle_save}>Save</button>
						<button onClick={this.handle_cancel}>Cancel</button>
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				);
			}else{
				info = (
					<div>
						<components.Name model={this.model()} />
						<button onClick={this.handle_edit}>Edit</button>
					</div>
				);
			}
			return (
				<li>
					{info}
					<components.FamilyMemberList collection={this.model().get_members()} onDelete={this.props.onDelete} instance_cache={this.props.instance_cache} />
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
			if(this.model().get("name") === new_name) {
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
})();