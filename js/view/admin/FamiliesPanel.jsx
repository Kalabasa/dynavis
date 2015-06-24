"use strict";
var components = components || {};
(function(){
	components.FamiliesPanel = React.createBackboneClass({
		getInitialState: function() {
			var officials = new collections.Official();
			officials.fetch(); // FIXME: This should fetch all, but is paginated by server
			return {officials: officials};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyBox key={official.id} model={official} officials={that.state.officials} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();