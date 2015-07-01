"use strict";
var components = components || {};
(function(){
	components.OfficialRow = React.createBackboneClass({
		getInitialState: function() {
			return {
				edit: false,
			};
		},

		componentWillMount: function() {
			this.model().get_families().fetch();
		},

		render: function() {
			var info = null;
			if(this.state.edit) {
				info = (
					<div>
						<components.EditableOfficialName ref="name" model={this.model()} />
						<button onClick={this.handle_save}>Save</button>
						<button onClick={this.handle_cancel}>Cancel</button>
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				);
			}else{
				info = (
					<div>
						<components.OfficialName model={this.model()} />
						<button onClick={this.handle_edit}>Edit</button>
					</div>
				);
			}
			return (
				<li>
					{info}
					<components.OfficialFamilyList collection={this.model().get_families()} instance_cache={this.props.instance_cache} />
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

			var patch = _.omit(this.refs.name.state, function(value, key, object) {
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

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
})();