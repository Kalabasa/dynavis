"use strict";
var components = components || {};
(function(){
	components.ElectionsPanel = React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],
		getInitialState: function() {
			return {
				official: "", position: "", years: "", votes: "", area: "", party: "",
				selected_official: null, selected_area: null, selected_party: null,
			};
		},

		componentDidMount: function() {
			var that = this;
			var $official = $(React.findDOMNode(this.refs.official));
			var $area = $(React.findDOMNode(this.refs.area));
			var $party = $(React.findDOMNode(this.refs.party));

			$official.typeahead({highlight: true}, {
				source: that.props.official_hound,
				display: function(item) {
					return item.surname + ", " + item.name;
				},
			});

			$area.typeahead({highlight: true}, {
				source: that.props.area_hound,
				display: function(item) {
					return item.name;
				},
			});

			$party.typeahead({highlight: true}, {
				source: that.props.party_hound,
				display: function(item) {
					return item.name;
				},
			});

			$official.bind("typeahead:select typeahead:autocomplete", this.handle_select_official);
			$area.bind("typeahead:select typeahead:autocomplete", this.handle_select_area);
			$party.bind("typeahead:select typeahead:autocomplete", this.handle_select_party);
		},

		render: function() {
			var that = this;
			return (
				<div>
					<h1>Elections</h1>
					<form onSubmit={this.handle_submit}>
						Official <input ref="official" type="text" valueLink={this.linkState("official")} />
						Position <input ref="position" type="text" valueLink={this.linkState("position")} />
						Year <input ref="year" type="number" valueLink={this.linkState("year")} />
						Year End <input ref="year_end" type="number" valueLink={this.linkState("year_end")} />
						Votes <input ref="votes" type="number" valueLink={this.linkState("votes")} />
						Area <input ref="area" type="text" valueLink={this.linkState("area")} />
						Party <input ref="party" type="text" valueLink={this.linkState("party")} />
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

		handle_select_official: function(e, s) {
			s = s || null;
			this.setState({official: e.target.value, selected_official: s});
		},

		handle_select_area: function(e, s) {
			s = s || null;
			this.setState({area: e.target.value, selected_area: s});
		},

		handle_select_party: function(e, s) {
			s = s || null;
			this.setState({party: e.target.value, selected_party: s});
		},

		handle_submit: function(e) {
			e.preventDefault();
			// TODO: Error checking
			this.collection().create({
				official_id: this.state.selected_official.id,
				year: this.state.year,
				year_end: this.state.year_end,
				position: this.state.position,
				votes: this.state.votes,
				area_code: this.state.selected_area.code,
				party_id: this.state.selected_party
					? this.state.selected_party.id
					: null
			}, {wait: true});
			this.clear_inputs();
		},

		clear_inputs: function(e) {
			var $official = $(React.findDOMNode(this.refs.official));
			var $area = $(React.findDOMNode(this.refs.area));
			var $party = $(React.findDOMNode(this.refs.party));
			$official.typeahead("val", "");
			$area.typeahead("val", "");
			$party.typeahead("val", "");
			this.setState(this.getInitialState());
		},
	});
})();