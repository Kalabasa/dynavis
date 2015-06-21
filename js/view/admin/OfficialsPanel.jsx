"use strict";
var components = components || {};
(function(){
	components.OfficialsPanel = React.createBackboneClass({
		getInitialState: function() {
			var families = new collections.Family();
			families.fetch();
			return {families: families};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Officials</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.OfficialRow key={official.id} model={official} families={that.state.families} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();