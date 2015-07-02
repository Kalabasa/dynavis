"use strict";
define(["react", "model/Family", "jsx!view/TypeaheadInput", "jsx!view/admin/OfficialFamilyToken", "react.backbone"], function(React, Family, TypeaheadInput, OfficialFamilyToken) {
	return React.createBackboneClass({
		filterSearch: function(data) {
			var that = this;
			return _.filter(data, function(item) {
				return that.collection().get(item.id) == null;
			});
		},

		render: function() {
			var that = this;

			var display =  function(item) {
				return item.name;
			};

			return (
				<div>
					<h3>Families:</h3>
					{this.collection().map(function(family) {
						return <OfficialFamilyToken key={family.id} model={family} />;
					})}
					<form onSubmit={this.handle_submit}>
						<TypeaheadInput
							for="Family"
							ref="input"
							display={display}
							collection={this.collection()}
							required />
						<input type="submit" value="Add" />
					</form>
				</div>
			);
		},

		handle_submit: function(e) {
			e.preventDefault();
			var that = this;
			this.refs.input.get_or_create({
				model: Family.extend({urlRoot: this.collection().url()}),
				attributes: function(str) {
					return {name: that.refs.input.state.value};
				},
				callback: function(item, created) {
					if(created) {
						that.collection().add(item);
					}else{
						that.collection().post_family(item);
					}
					that.refs.input.clear();
				},
			});
		},
	});
});