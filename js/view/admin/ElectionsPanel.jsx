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
						Official <input ref="official" type="text" valueLink={this.linkState("official")} required />
						Position <input ref="position" type="text" valueLink={this.linkState("position")} />
						Year <input ref="year" type="number" valueLink={this.linkState("year")} required />
						Year End <input ref="year_end" type="number" valueLink={this.linkState("year_end")} required />
						Votes <input ref="votes" type="number" valueLink={this.linkState("votes")} />
						Area <input ref="area" type="text" valueLink={this.linkState("area")} required />
						Party <input ref="party" type="text" valueLink={this.linkState("party")} />
						<input type="submit" value="Add" />
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
			var that = this;
			e.preventDefault();

			var year = parseInt(this.state.year);
			var year_end = parseInt(this.state.year_end);
			if(isNaN(year) || isNaN(year_end)) {
				console.error("Invalid year format.")
				return;
			}
			if(year > year_end) {
				console.error("Invalid year range. " + year + "-" + year_end);
				return;
			}

			if(this.state.selected_area == null) {
				console.error("No selected area.");
				return;
			}
			var area_code = this.state.selected_area.code;

			var position = this.state.position;
			var votes = parseInt(this.state.votes);
			if(this.state.votes && isNaN(votes)) {
				console.error("Invalid votes format.");
				return
			}
			var party_id = this.state.selected_party ? this.state.selected_party.id : null;

			var official = null;
			if(this.state.selected_official) {
				official = this.state.selected_official;
				this.create(official.id, year, year_end, position, votes, area_code, party_id);
			}else{
				if(this.state.official) {
					var tokens = this.state.official.match(/^\s*(.+?)\s*,\s*(.+?)\s*(".+?")?\s*$/);
					if(!tokens || tokens.length <= 2) {
						console.error("Invalid official name format.");
						return;
					}
					var surname = tokens[1];
					var name = tokens[2];
					var nickname = tokens.length > 3 ? tokens[3] : null;
					official = new models.OfficialSingle({surname: surname, name: name, nickname: nickname});
					official.save(null, {
						wait: true,
						success: function(model) {
							that.create(model.id, year, year_end, position, votes, area_code, party_id);
						},
						error: function() {
							console.error("Error official.save");
						},
					});
				}else{
					console.error("No official.");
					return;
				}
			}

			this.clear_inputs();
		},

		create: function(official_id, year, year_end, position, votes, area_code, party_id) {
			this.collection().create({
				official_id: official_id,
				year: year,
				year_end: year_end,
				position: position,
				votes: votes,
				area_code: area_code,
				party_id: party_id,
			}, {wait: true});
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