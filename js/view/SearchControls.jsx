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
			var action_button = null;
			if(this.state.query) {
				action_button = <button type="reset" onClick={this.handle_cancel}><i className="fa fa-close"/></button>;
			}else{
				action_button = <button type="submit"><i className="fa fa-search"/></button>;
			}
			return(
				<div className={this.props.className}>
					<div className="clearfix">
						<form className="search-bar pure-g pull-left" onSubmit={this.handle_search}>
							<input type="text" placeholder={this.state.query} valueLink={this.linkState("input")} />
							{action_button}
						</form>
						<PageControls className="pull-right" collection={this.collection()} />
					</div>
				</div>
			);
		},

		set_query: function(query, options) {
			this.collection().setParams(this.get_data(query));
			this.collection().page(0, options);
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

		get_data: function(query) {
			if(query === undefined) query = this.state.query;
			return query ? {q: query} : null;
		},
	});
});