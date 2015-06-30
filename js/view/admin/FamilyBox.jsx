"use strict";
var components = components || {};
(function(){
	components.FamilyBox = React.createBackboneClass({
		componentWillMount: function() {
			this.model().get_members().fetch();
		},
		
		render: function() {
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					<components.FamilyMemberList collection={this.model().get_members()} onDelete={this.props.onDelete} official_hound={this.props.official_hound} />
				</li>
			);
		},
	});
})();