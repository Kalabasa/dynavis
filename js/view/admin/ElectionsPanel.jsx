"use strict";
var components = components || {};
(function(){
	components.ElectionsPanel = React.createBackboneClass({
		getInitialState: function() {
			var officials = new collections.Official();
			// var areas = new collections.Area();
			// var parties = new collections.Party();
			officials.fetch(); // FIXME: These should fetch all, but is paginated by server
			// areas.fetch();
			// parties.fetch();
			return {
				officials: officials,
				areas: null,
				parties: null,
			};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Elections</h1>
					<ul>
						{this.collection().map(function(election) {
							return <components.ElectionRow key={election.id} model={election} officials={that.state.officials} areas={that.state.areas} parties={that.state.parties}/>;
						})}
					</ul>
				</div>
			);
		},
	});
})();