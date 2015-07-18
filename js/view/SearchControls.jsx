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
			if(this.state.query) {
				var cancel_button = <input className="group-component button" type="button" onClick={this.handle_cancel} value="&times;" />;
			}
			return(
				<div className="clearfix form-inline">
					<form className="pull-left group pure-g" onSubmit={this.handle_search}>
						<input className="group-component input pure-u-9-10" type="text" placeholder={this.state.query} valueLink={this.linkState("input")} />
						{cancel_button}
						<input className="group-component button pure-u-1-10" type="submit" value="Search" />
					</form>
					<PageControls className="pull-right"
						collection={this.collection()}
						onPrev={this.handle_prev}
						onNext={this.handle_next} />
				</div>
			);
		},

		set_query: function(query, options) {
			this.collection().setParams(this.get_data(query));
			this.collection().page(0);
			this.setState({query: query});
		},

		handle_cancel: function() {
			this.setState({input: ""});
			this.set_query(null);
		},

		handle_search: function(e) {
			e.preventDefault();
			this.set_query(this.state.input);
		},

		handle_prev: function() {
			this.collection().prev();
		},
		handle_next: function() {
			this.collection().next();
		},

		get_data: function(query) {
			if(query === undefined) query = this.state.query;
			return query ? {q: query} : null;
		},
	});
});