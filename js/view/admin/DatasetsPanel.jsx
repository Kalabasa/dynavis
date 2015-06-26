"use strict";
var components = components || {};
(function(){
	components.DatasetsPanel = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Datasets</h1>
					<ul>
						{this.collection().map(function(dataset) {
							return <components.DatasetBox key={dataset.id} model={dataset} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();