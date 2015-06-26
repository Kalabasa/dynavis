"use strict";
var components = components || {};
(function(){
	components.FamilyBox = React.createBackboneClass({
		getInitialState: function() {
			return {family_members: this.model().members()};
		},

		componentWillMount: function() {
			this.state.family_members.fetch();
		},

		componentDidChangeModel: function() {
			this.setState({family_members: this.model().members()});
			this.state.family_members.fetch();
		},
		
		render: function() {
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					<components.FamilyMemberList collection={this.state.family_members} onDelete={this.props.onDelete} official_hound={this.props.official_hound} />
				</li>
			);
		},
	});
})();