"use strict";
define(["react", "model/OfficialFamilyCollection", "jsx!view/SliderTransitionGroupChild", "jsx!view/EditableOfficialName", "jsx!view/OfficialName", "jsx!view/admin/OfficialFamilyList", "mixin/ClickToTopMixin", "react.backbone"], function(React, OfficialFamilyCollection, SliderTransitionGroupChild, EditableOfficialName, OfficialName, OfficialFamilyList, ClickToTopMixin) {
	var ReactTransitionGroup = React.addons.TransitionGroup;
	return React.createBackboneClass({
		mixins: [ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				families: new OfficialFamilyCollection(null, {official_id: this.model().id}),
			};
		},

		componentWillMount: function() {
			this.state.families.fetch();
		},

		render: function() {
			var classes = "data-row";
			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				classes += " edit";
				fields = [
					(<div className="pure-g form">
						<EditableOfficialName className="pure-u-1" ref="name" model={this.model()} />
					</div>),
					(<div className="pure-g">
						<div className="pure-u-1">
							<button className="pull-right button button-primary mar" onClick={this.handle_save}>Save</button>
							<button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>
						</div>
					</div>)
				];
			}else{
				fields = [
					(<div className="pure-g form">
						<OfficialName className="field pure-u-5-6 text-large" model={this.model()} />
						<div className="pure-u-1-6">
							<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
						</div>
					</div>),
					(<OfficialFamilyList collection={this.state.families} />)
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