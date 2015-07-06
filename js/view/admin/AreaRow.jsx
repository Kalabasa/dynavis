"use strict";
define(["react", "jsx!view/EditableName", "jsx!view/TypeaheadInput", "jsx!view/Name", "react.backbone"], function(React, EditableName, TypeaheadInput, Name) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

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
			var parent = isNaN(parent_code) ? null : InstanceCache.get("Area", parent_code);
			if(parent) parent.fetch();

			var fields = null;
			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<li>
						Name <EditableName ref="name" model={this.model()} />
						Code <input type="text" valueLink={this.linkState("code")} disabled={!this.model().isNew()} required />
						{/* TODO: USE RADIO BUTTON or WHATEVER SELECTOR */}
						Level <input type="text" valueLink={this.linkState("level")} required />
						Parent <TypeaheadInput
							for="Area"
							ref="parent"
							display={display}
							model={parent}
							required />
						<button onClick={this.handle_save}>Save</button>
						{cancel_button}
						<button onClick={this.handle_delete}>Delete</button>
					</li>
				);
			}else{
				return (
					<li>
						<Name model={this.model()} />
						{this.format_code(this.model().get("code"))}
						{this.model().get("level")}
						<Name model={parent} />
						<button onClick={this.handle_edit}>Edit</button>
					</li>
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