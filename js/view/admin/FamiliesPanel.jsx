"use strict";
var components = components || {};
(function(){
	components.FamiliesPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Families</h1>
					<components.IndexedPageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(official) {
							return <components.FamilyBox key={official.id} model={official} onDelete={that.handle_delete_official} official_hound={that.props.official_hound} />;
						})}
					</ul>
				</div>
			);
		},
		
		handle_delete_official: function() {
			this.collection().fetch();
		},
	});
})();