"use strict";
var components = components || {};
(function(){
	components.FamilyMemberList = React.createBackboneClass({
		getInitialState: function() {
			return {
				input: "",
				selected: null,
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
				that.setState({selected: s});
				that.handle_select(s);
			});
			$input.bind("typeahead:autocomplete", function(e, s) {
				that.setState({input: s, selected: s});
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
			var value = this.state.input;
			if(this.state.selected) {
				value = this.state.selected.surname + ", " + this.state.selected.name;
			}
			return (
				<div>
					<h3>Officials:</h3>
					{this.collection().map(function(official) {
						return <components.FamilyMemberItem key={official.id} model={official} onDelete={that.props.onDelete} official_hound={that.props.official_hound} />;
					})}
					<form onSubmit={this.handle_submit}>
						<input ref="input" type="text" value={value} onChange={this.handle_change} />
						<button>Add</button>
					</form>
				</div>
			);
		},

		handle_change: function(e) {
			this.setState({input: e.target.value, seleced: null});
		},

		handle_submit: function(e) {
			e.preventDefault();
			if(this.state.selected) {
				this.handle_select(this.state.selected);
			}else{
				$(".tt-suggestion:first-child", e.target).trigger("click");
			}
		},

		handle_select: function(official) {
			this.collection().add_member(official);
			this.props.official_hound.clear();
			this.clear_input();
		},

		clear_input: function() {
			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead("val", "");
			this.setState({input: "", selected: null});
		},
	});
})();