"use strict";
define(["react", "InstanceCache", "model/OfficialSingle", "model/Party", "jsx!view/TypeaheadInput", "jsx!view/OfficialName", "jsx!view/Name", "react.backbone"], function(React, InstanceCache, OfficialSingle, Party, TypeaheadInput, OfficialName, Name) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],
 		
		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				position: this.model().get("position"),
				year: this.model().get("year"),
				year_end: this.model().get("year_end"),
				votes: this.model().get("votes"),
			};
		},

		render: function() {
			// Merge with ElectionForm
			// * add election record (ElectionsPanel: just add new model to collection, no POST)
			// * edit election record (this)
			// * save election record (this)
			var display = function(item) {
				return item.name;
			};
			var display_official = function(item) {
				return item.surname + ", " + item.name;
			};

			var official_id = parseInt(this.model().get("official_id"));
			var area_code = parseInt(this.model().get("area_code"));
			var party_id = parseInt(this.model().get("party_id"));

			var official = InstanceCache.get("Official", official_id);
			var area = InstanceCache.get("Area", area_code);
			var party = isNaN(party_id) ? null : InstanceCache.get("Party", party_id);

			official.fetch();
			area.fetch();
			if(party) party.fetch();

			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<li>
						Official <TypeaheadInput
							for="Official"
							ref="official"
							display={display_official}
							model={official}
							required />
						Position <input ref="position" type="text" valueLink={this.linkState("position")} />
						Year <input ref="year" type="number" valueLink={this.linkState("year")} required />
						Year end <input ref="year_end" type="number" valueLink={this.linkState("year_end")} required />
						Votes <input ref="votes" type="number" valueLink={this.linkState("votes")} />
						Area <TypeaheadInput
							for="Area"
							ref="area"
							display={display}
							model={area}
							required />
						Party <TypeaheadInput
							for="Party"
							ref="party"
							display={display}
							model={party} />
						<button onClick={this.handle_save}>Save</button>
						{cancel_button}
						<button onClick={this.handle_delete}>Delete</button>
					</li>
				);
			}else{
				return (
					<li>
						<OfficialName model={official} />
						<div>{this.model().get("position")}</div>
						<div>{this.model().get("year")} - {this.model().get("year_end")}</div>
						<div>{this.model().get("votes")}</div>
						<Name model={area} />
						<Name model={party} />
						<button onClick={this.handle_edit}>Edit</button>
					</li>
				);
			}
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.setState({edit: false});
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},

		handle_save: function() {
			var that = this;

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

			if(this.refs.area.state.selected == null) {
				console.error("No selected area.");
				return;
			}
			var area_code = this.refs.area.state.selected.code;

			var position = this.state.position || null;
			var votes = parseInt(this.state.votes);
			if(this.state.votes && isNaN(votes)) {
				console.error("Invalid votes format.");
				return
			}

			var dummy = {};
			var party = dummy;
			var official = dummy;

			// Callback hell!!

			var callback = function() {
				if(official !== dummy && party !== dummy) {
					var party_id = party ? party.id : null;
					that.save(official.id, year, year_end, position, votes, area_code, party_id);
				}
			};

			this.refs.party.get_or_create({
				model: Party,
				attributes: function(str) {
					return {name: that.refs.party.state.value};
				},
				callback: function(item) {
					party = item;
					callback();
				},
			});

			this.refs.official.get_or_create({
				model: OfficialSingle,
				attributes: function(str) {
					var tokens = that.refs.official.state.value.match(/^\s*(.+?)\s*,\s*(.+?)\s*(?:"(.+?)")?\s*$/);
					if(!tokens || tokens.length <= 2) {
						console.error("Invalid official name format.");
						return null;
					}
					return {
						surname: tokens[1],
						name: tokens[2],
						nickname: tokens.length > 3 ? tokens[3] : null,
					};
				},
				search: ["surname", "name"],
				callback: function(item) {
					if(!item) {
						console.error("No official.");
						return;
					}
					official = item;
					callback();
				},
			});
		},

		save: function(official_id, year, year_end, position, votes, area_code, party_id) {
			var that = this;

			var new_attributes = {
				official_id: official_id,
				year: year,
				year_end: year_end,
				position: position,
				votes: votes,
				area_code: area_code,
				party_id: party_id,
			};

			var patch = this.model().isNew()
				? new_attributes
				: _.omit(new_attributes, function(value, key, object) {
				return that.model().get(key) === value;
			});
			
			if(_.isEmpty(patch)) {
				this.setState({edit: false});
			}else{
				this.model().save(patch, {
					patch: !this.model().isNew(),
					wait: true,
					success: function() {
						that.setState({edit: false});
					},
				});
			}
		},
	});
});