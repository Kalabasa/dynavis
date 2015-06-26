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

			$input.typeahead({highlight: true}, {
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
			$input.bind("typeahead:change typeahead:autocomplete", that.handle_change);
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
						<input ref="input" type="text" value={value} onChange={this.handle_change} required />
						<input type="submit" value="Add" />
					</form>
				</div>
			);
		},

		handle_change: function(e, s) {
			s = s || null;
			this.setState({input: e.target.value, selected: s});
		},

		handle_select: function(official) {
			this.collection().add_member(official);
			this.props.official_hound.clear();
			this.clear_input();
		},

		handle_submit: function(e) {
			e.preventDefault();
			if(this.state.selected) {
				this.handle_select(this.state.selected);
			}else{
				$(".tt-suggestion:first-child", e.target).trigger("click");
			}
		},

		clear_input: function() {
			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead("val", "");
			this.setState(this.getInitialState());
		},
	});
})();