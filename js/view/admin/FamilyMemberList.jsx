"use strict";
var components = components || {};
(function(){
	components.FamilyMemberList = React.createBackboneClass({
		getInitialState: function() {
			return {input: ""};
		},

		render: function() {
			var tokens = this.collection().map(function(official) {
				return <components.FamilyMemberItem key={official.id} model={official} />;
			});
			return (
				<div>
					<h3>Members:</h3>
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
			var official = this.props.officials.findWhere({surname: input});

			this.collection().add_member(official.id);

			this.setState({input: ""});
		},
	});
})();