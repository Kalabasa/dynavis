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
			var classes = "data-row container-fluid";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				fields = [
					(<div className="row">
						<EditableOfficialName className="col-md-12" ref="name" model={this.model()} />
					</div>),
					(<div className="row">
						<div className="col-md-12">
							<button className="pull-right btn btn-primary" onClick={this.handle_save}>Save</button>
							<button className="pull-right btn btn-default" onClick={this.handle_cancel}>Cancel</button>
						</div>
					</div>)
				];
			}else{
				fields = [
					(<div className="row">
						<OfficialName className="field col-md-10 text-large" model={this.model()} />
						<div className="col-md-2">
							<button className="pull-right btn btn-default" onClick={this.handle_edit}>Edit</button>
						</div>
					</div>),
					(<OfficialFamilyList collection={this.state.families} />)
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