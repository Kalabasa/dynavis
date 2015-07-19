"use strict";
define(["react", "model/Family", "jsx!view/TypeaheadInput", "jsx!view/admin/OfficialFamilyToken", "react.backbone"], function(React, Family, TypeaheadInput, OfficialFamilyToken) {
	return React.createBackboneClass({
		filterSearch: function(data) {
			var that = this;
			return _.filter(data, function(item) {
				return that.collection().get(item.id) == null;
			});
		},

		render: function() {
			var that = this;

			var display =  function(item) {
				return item.name;
			};

			return (
				<div className="pure-g">
					<form className="pure-u-1 clearfix" onSubmit={this.handle_submit}>
						<div className="label">Families</div>
						<div className="input token-list-input">
							<div className="token-list">
								{this.collection().map(function(family) {
									return <OfficialFamilyToken key={family.cid} model={family} />;
								})}
							</div>
							<label className="token-input" onKeyDown={this.handle_key}>
								<TypeaheadInput className="token-input-typeahead typeahead-nostyle"
									for="Family"
									ref="input"
									display={display}
									collection={this.collection()}
									required />
							</label>
						</div>
						<div className="token-submit">
							<input className="button" type="submit" value="Add" />
						</div>
					</form>
				</div>
			);
		},

		handle_key: function(e) {
			var size = this.collection().size();
			if(!e.target.value.length && e.keyCode == 8 && size) {
				this.collection().at(-1).destroy({wait: true});
			}
		},

		handle_submit: function(e) {
			e.preventDefault();
			var that = this;
			this.refs.input.get_or_create({
				model: Family.extend({urlRoot: this.collection().url()}),
				attributes: function(str) {
					return {name: that.refs.input.state.value};
				},
				callback: function(item, created) {
					if(created) {
						that.collection().add(item);
					}else{
						that.collection().post_family(item);
					}
					that.refs.input.clear();
				},
			});
		},
	});
});