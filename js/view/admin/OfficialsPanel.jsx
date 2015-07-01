"use strict";
var components = components || {};
(function(){
	components.OfficialsPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Officials</h1>
					<components.IndexedPageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(official) {
							return <components.OfficialRow key={official.id} model={official} instance_cache={that.props.instance_cache} />;
						})}
					</ul>
				</div>
			);
		},
	});
})();