"use strict";
define(["react", "jsx!view/PageControls", "react.backbone"], function(React, PageControls) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				input: null,
				query: null,
			};
		},

		render: function() {
			return(
				<div className="clearfix form-inline">
					<form className="pull-left input-group" onSubmit={this.handle_search}>
						<input className="form-control" type="text" valueLink={this.linkState("input")} />
						<div className="input-group-btn">
							<input className="btn btn-default" type="submit" value="Search" />
						</div>
					</form>
					<PageControls className="pull-right"
						collection={this.collection()}
						onPrev={this.handle_prev}
						onNext={this.handle_next} />
				</div>
			);
		},

		set_query: function(query, options) {
			options = options || {};
			var data = this.get_data(query) || {};
			this.collection().page(0, _.extend(data, options));
			this.setState({query: query});
		},

		handle_search: function(e) {
			e.preventDefault();
			this.set_query(this.state.input);
		},

		handle_prev: function() {
			this.collection().prev(this.get_data());
		},
		handle_next: function() {
			this.collection().next(this.get_data());
		},

		get_data: function(query) {
			if(query === undefined) query = this.state.query;
			return query ? {data: {q: query}} : null;
		},
	});
});