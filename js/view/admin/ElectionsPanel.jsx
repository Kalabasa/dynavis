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
						Upload election records (csv) <input ref="file" type="file" />
						<input type="submit" value="Upload" />
					</form>
					<components.PageControls collection={this.collection()} />
					<button onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(election) {
							return <components.ElectionRow
								key={election.id}
								model={election}
								instance_cache={that.props.instance_cache}
								official_hound={that.props.official_hound}
								area_hound={that.props.area_hound}
								party_hound={that.props.party_hound} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			this.collection().add(new models.Election(), {at: 0});
		},

		handle_upload: function(e) {
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file.getDOMNode().files[0];
			fd.append("file", file );

			$.ajax({
				url: "api.php/elections",
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					this.collection().fetch();
				},
			});
		},
	});
})();