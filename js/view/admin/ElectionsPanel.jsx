"use strict";
var components = components || {};
(function(){
	components.ElectionsPanel = React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Elections</h1>
					<form onSubmit={this.handle_submit}>
						Official <input type="text" />
						Position <input type="text" />
						Years <input type="number" />
						Votes <input type="number" />
						Area <input type="text" />
						Party <input type="text" />
						<button>Add</button>
					</form>
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

		handle_submit: function(e) {
			e.preventDefault();
		},
	});
})();