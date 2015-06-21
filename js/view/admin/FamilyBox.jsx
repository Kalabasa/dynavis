"use strict";
var components = components || {};
(function(){
	components.FamilyBox = React.createBackboneClass({
		render: function() {
			var family_members = this.model().members();
			family_members.fetch();
			return (
				<li>
					{this.model().get("name")}
					<components.FamilyMemberList collection={family_members} officials={this.props.officials}/>
				</li>
			);
		},
	});
})();