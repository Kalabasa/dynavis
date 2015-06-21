"use strict";
var components = components || {};
(function(){
	components.FamilyBox = React.createBackboneClass({
		render: function() {
			var family_members = this.model().members();
			family_members.fetch();
			return (
				<li>
					<h2>{this.model().get("name")}</h2>
					<components.FamilyMemberList collection={family_members} officials={this.props.officials}/>
				</li>
			);
		},
	});
})();