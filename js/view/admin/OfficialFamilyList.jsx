"use strict";
var components = components || {};
(function(){
	components.OfficialFamilyList = React.createBackboneClass({
		getInitialState: function() {
			return {input: ""};
		},

		render: function() {
			var tokens = this.collection().map(function(family) {
				return <components.OfficialFamilyToken model={family} />;
			});
			return (
				<div>
					<h3>Families:</h3>
					{tokens}
					<form>
						<input type="text" value={this.state.input} onChange={this.handle_change} />
						<button onClick={this.handle_add}>Add</button>
					</form>
				</div>
			);
		},

		handle_change: function(e) {
			this.setState({input: e.target.value});
		},

		handle_add: function(e) {
			e.preventDefault();
			var input = this.state.input;
			var family = this.props.families.findWhere({name: input});

			this.collection().add_family(family.id);

			this.setState({input: ""});
		},
	});
})();