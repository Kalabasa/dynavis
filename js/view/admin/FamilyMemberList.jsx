"use strict";
define(["react", "jsx!view/TypeaheadInput", "jsx!view/admin/FamilyMemberItem", "react.backbone"], function(React, TypeaheadInput, FamilyMemberItem) {
	return React.createBackboneClass({
		render: function() {
			var that = this;

			var display =  function(item) {
				return item.surname + ", " + item.name;
			};

			return (
				<div className="pure-g">
					<div className="pure-u-1">
						<div className="label">Members</div>
						{this.collection().map(function(official) {
							return <FamilyMemberItem key={official.cid} model={official} onDelete={that.props.onDeleteMember} />;
						})}
						<form onSubmit={this.handle_submit}>
							<div className="group pure-g">
								<TypeaheadInput className="group-component pure-u-9-10 input"
									for="Official"
									ref="input"
									display={display}
									collection={this.collection()}
									required />
								<input className="group-component pure-u-1-10 button" type="submit" value="Add" />
							</div>
						</form>
					</div>
				</div>
			);
		},

		handle_submit: function(e) {
			e.preventDefault();
			if(this.refs.input.state.selected) {
				this.collection().post_member(this.refs.input.state.selected);
				this.refs.input.clear();
			}else{
				console.error("None selected.");
			}
		},
	});
});