"use strict";
define(["react", "model/OfficialFamilyCollection", "jsx!view/EditableOfficialName", "jsx!view/OfficialName", "jsx!view/admin/OfficialFamilyList", "react.backbone"], function(React, OfficialFamilyCollection, EditableOfficialName, OfficialName, OfficialFamilyList) {
	return React.createBackboneClass({
		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				families: null,
			};
		},

		componentWillMount: function() {
			this.refresh_families();
		},
		onModelChange: function() {
			this.refresh_families();
		},
		refresh_families: function() {
			if(!this.model().isNew()) {
				var families = this.state.families;
				if(!families) {
					families = new OfficialFamilyCollection(null, {official_id: this.model().id});
					this.setState({families: families});
				}
				families.fetch();
			}
		},

		render: function() {
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button onClick={this.handle_cancel}>Cancel</button>;
				}
				fields = (
					<div>
						<EditableOfficialName ref="name" model={this.model()} />
						<button onClick={this.handle_save}>Save</button>
						{cancel_button}
						<button onClick={this.handle_delete}>Delete</button>
					</div>
				);
			}else{
				fields = (
					<div>
						<OfficialName model={this.model()} />
						<button onClick={this.handle_edit}>Edit</button>
					</div>
				);
			}
			if(!this.model().isNew()) {
				var family_list = <OfficialFamilyList collection={this.state.families} />;
			}
			return (
				<li>
					{fields}
					{family_list}
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

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});