"use strict";
var components = components || {};
(function(){
	components.OfficialFamilyList = React.createBackboneClass({
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
						return <components.OfficialFamilyToken key={family.id} model={family} />;
					})}
					<form onSubmit={this.handle_submit}>
						<components.TypeaheadInput
							for="family"
							ref="input"
							display={display}
							collection={this.collection()}
							instance_cache={this.props.instance_cache}
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
				model: models.Family.extend({urlRoot: this.collection().url()}),
				name: "family",
				attributes: function(str) {
					return {name: that.refs.input.state.value};
				},
				callback: function(item) {
					that.refs.input.clear();
				},
			});
		},
	});
})();