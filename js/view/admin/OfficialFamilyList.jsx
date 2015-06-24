"use strict";
var components = components || {};
(function(){
	components.OfficialFamilyList = React.createBackboneClass({
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
					that.props.family_hound.search(q,
						function(d) { sync(that.filterSearch(d)); },
						function(d) { async(that.filterSearch(d)); });
				},
				display: "name",
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
			var tokens = this.collection().map(function(family) {
				return <components.OfficialFamilyToken key={family.id} model={family} />;
			});
			return (
				<div>
					<h3>Families:</h3>
					{tokens}
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

		handle_select: function(family) {
			var $input = $(React.findDOMNode(this.refs.input));

			this.collection().add_family(family.id);
			$input.typeahead("val", "");
			this.setState({input: ""});
		},
	});
})();