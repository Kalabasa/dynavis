"use strict";
var components = components || {};
(function(){
	components.OfficialName = React.createBackboneClass({
		render: function() {
			var nickname = this.model().get("nickname");
			if(nickname) nickname = '"' + nickname + '"';
			return (
				<span>{this.model().get("surname")}, {this.model().get("name")} {nickname}</span>
			);
		},
	});
})();