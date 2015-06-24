"use strict";
var components = components || {};
(function(){
	components.FamiliesPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyBox key={official.id} model={official} official_hound={that.props.official_hound} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();