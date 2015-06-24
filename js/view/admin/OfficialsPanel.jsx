"use strict";
var components = components || {};
(function(){
	components.OfficialsPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Officials</h1>
					<ul>
						{this.collection().map(function(official) {
							return <components.OfficialRow key={official.id} model={official} family_hound={that.props.family_hound} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();