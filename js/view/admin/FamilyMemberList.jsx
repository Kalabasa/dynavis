"use strict";
var components = components || {};
(function(){
	components.FamilyMemberList = React.createBackboneClass({
		getInitialState: function() {
			return {
				input: "",
			};
		},

		componentDidMount: function() {
			var that = this;
			var $input = $(React.findDOMNode(this.refs.input));

			$input.typeahead({
				highlight: true,
			},{
				source: function(q, sync, async) {
					that.props.official_hound.search(q,
						function(d) { sync(that.filterSearch(d)); },
						function(d) { async(that.filterSearch(d)); });
				},
				display: function(item) {
					return item.surname + ", " + item.name;
				},
			});
			$input.bind("typeahead:select", function(e, s) {
				that.handle_select(s);
			});
		},

		filterSearch: function(data) {
			var that = this;
			return _.filter(data, function(item) {
				return that.collection().get(item.id) == null;
			});
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h3>Officials:</h3>
					{this.collection().map(function(official) {
						return <components.FamilyMemberItem key={official.id} model={official} official_hound={that.props.official_hound} />;
					})}
					<form onSubmit={this.handle_submit}>
						<input ref="input" type="text" value={this.state.input} onChange={this.handle_change} />
						<button>Add</button>
					</form>
				</div>
			);
		},

		handle_change: function(e) {
			this.setState({input: e.target.value});
		},

		handle_submit: function(e) {
			e.preventDefault();
			$(".tt-suggestion:first-child", e.target).trigger("click");
		},

		handle_select: function(official) {
			this.collection().add_member(official);
			this.props.official_hound.clear();
			this.clear_input();
		},

		clear_input: function() {
			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead("val", "");
			this.setState({input: ""});
		},
	});
})();