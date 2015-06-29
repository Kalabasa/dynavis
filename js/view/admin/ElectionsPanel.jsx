"use strict";
var components = components || {};
(function(){
	components.ElectionsPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Elections</h1>
					<form onSubmit={this.handle_upload}>
						<input type="submit" value="Upload" />
					</form>
					<components.ElectionForm
						collection={this.collection()}
						official_hound={this.props.official_hound}
						area_hound={this.props.area_hound}
						party_hound={this.props.party_hound} />
					<components.IndexedPageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(election) {
							return <components.ElectionRow
								key={election.id}
								model={election}
								instance_cache={that.props.instance_cache}
								official_hound={that.props.official_hound} />;
						})}
					</ul>
				</div>
			);
		},

		handle_upload: function(e) {
			e.preventDefault();
		},
	});
})();