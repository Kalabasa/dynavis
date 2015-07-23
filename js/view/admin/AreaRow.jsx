"use strict";
define(["react", "jsx!view/SliderTransitionGroupChild", "jsx!view/EditableName", "jsx!view/TypeaheadInput", "jsx!view/Name", "mixin/ClickToTopMixin", "react.backbone"], function(React, SliderTransitionGroupChild, EditableName, TypeaheadInput, Name, ClickToTopMixin) {
	var ReactTransitionGroup = React.addons.TransitionGroup;
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ClickToTopMixin],

		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				code: this.format_code(this.model().get("code")),
				level: this.model().get("level"),
			};
		},

		render: function() {
			var display = function(item) {
				return item.name;
			};

			var parent_code = parseInt(this.model().get("parent_code"));
			var parent = isNaN(parent_code) ? null : InstanceCache.get("Area", parent_code, true);

			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="edit">
						<div className="pure-g">
							<label className="pure-u-1-2 pad">
								<div className="label">Name</div>
								<EditableName className="pure-u-1" ref="name" model={this.model()} />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Code</div>
								<input className="pure-u-1" type="text" valueLink={this.linkState("code")} readOnly={!this.model().isNew()} required />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Type</div>
								<select className="pure-u-1" valueLink={this.linkState("level")} required>
									<option value="region">Region</option>
									<option value="province">Province</option>
									<option value="municipality">City/Municipality</option>
									<option value="barangay">Barangay</option>
								</select>
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Parent</div>
								<TypeaheadInput className="pure-u-1"
									for="Area"
									ref="parent"
									display={display}
									model={parent}
									required />
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
				if(parent) {
					var parent_field = [
						(<span className="pure-u-1-4 label">Parent</span>),
						(<Name className="pure-u-3-4 field" model={parent} />)
					];
				}
				var type = {
					"region": "Region",
					"province": "Province",
					"municipality": "City/Municipality",
					"barangay": "Barangay",
				}[this.model().get("level")];
				return (
					<div className="data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="display">
						<div className="pure-g">
							<div className="pure-u-5-6">
								<div className="pure-g">
									<div className="pure-u-1 field-group">
										<Name className="pure-u-1 field text-large" model={this.model()} />
									</div>
								</div>
								<div className="pure-g">
									<div className="pure-u-1-3 field-group">
										<span className="pure-u-1-4 label">Type</span>
										<span className="pure-u-3-4 field">{type}</span>
									</div>
									<div className="pure-u-1-3 field-group">
										<span className="pure-u-1-4 label">PSGC</span>
										<span className="pure-u-3-4 field">{this.format_code(this.model().get("code"))}</span>
									</div>
									<div className="pure-u-1-3 field-group">
										{parent_field}
									</div>
								</div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
							</div>
						</div>
					</SliderTransitionGroupChild></ReactTransitionGroup>
					</div>
				);
			}
		},

		format_code: function(code) {
			if(!code) return null;
			return ("00" + code).slice(-9);
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.setState({edit: false});
		},

		handle_save: function() {
			var name = this.refs.name.state.name;

			var code = parseInt(this.state.code);
			if(this.state.code && isNaN(code) || this.state.code.length !== 9) {
				console.error("Invalid code format.");
				return;
			}

			var level = this.state.level;

			var parent_code = null;
			if(this.refs.parent.state.selected) {
				parent_code = this.refs.parent.state.selected.code;
			}

			this.save(code, name, level, parent_code);
		},

		save: function(code, name, level, parent_code) {
			var that = this;

			var new_attributes = {
				code: code,
				name: name,
				level: level,
				parent_code: parent_code,
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
					}
				});
			}
		},

		handle_delete: function() {
			this.model().destroy({wait: true});
		},
	});
});