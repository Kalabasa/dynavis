"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/admin/OfficialRow", "react.backbone"], function(React, SearchControls, OfficialRow) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Officials</h1>
					<SearchControls ref="searcher" collection={this.collection()} />
					<button className="btn btn-default" onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(official) {
							return <OfficialRow key={official.cid} model={official} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				that.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
						that.collection().add({}, {at: 0});
					},
				});
			}
		},
	});
});