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
			$input.bind("typeahead:change typeahead:autocomplete", function(e) {
				that.setState({input: e.target.value});
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
					<h3>Families:</h3>
					{this.collection().map(function(family) {
						return <components.OfficialFamilyToken key={family.id} model={family} family_hound={that.props.family_hound} />;
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
			var that = this;
			e.preventDefault();
			var name = this.state.input;

			var callback = function(data) {
				var name_upp = name.toUpperCase();
				var family = _.find(data, function(f) {
					return name_upp === f.name.toUpperCase();
				});

				if(family) {
					that.collection().add_family(family);
				}else{
					that.collection().create({name: name}, {wait: true});
				}
				that.props.family_hound.clear();
			};

			this.props.family_hound.search(name, function(){}, callback);
			this.clear_input();
		},

		handle_select: function(family) {
			this.collection().add_family(family);
			this.props.family_hound.clear();
			this.clear_input();
		},

		clear_input: function() {
			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead("val", "");
			this.setState({input: ""});
		},
	});
})();