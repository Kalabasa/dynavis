"use strict";
define(["underscore", "jquery", "react"], function(_, $, React) {
	var NotificationsContainer = React.createClass({
		render: function() {
			return (
				<div className="notifications-container">
					{this.props.notifications.map(function(notif) {
						return (
							<div key={notif.key} className={"notification notification-" + notif.type} onClick={notif.close.bind(notif)}>
								{notif.contents}
							</div>
						);
					})}
				</div>
			);
		},
	});

	var NotificationManager = {
		counter: 0,
		notifications: [],
	};

	var Notification = function(key, contents, type) {
		this.key = key;
		this.contents = contents;
		this.type = type;
		this.timer = null;
		this.active = false;
	};
	Notification.prototype.close = function() {
		NotificationManager.close(this);
	};
	Notification.prototype.set = function(contents, type) {
		this.contents = contents;
		if(type) this.type = type;
		NotificationManager.update();
	};

	NotificationManager.open = function(contents, timeout, type) {
		var notif = new Notification("n" + (this.counter++), contents, type);
		notif.active = true;

		this.notifications.push(notif);
		this.update();

		if(timeout !== 0) {
			notif.timer = setTimeout(function() {
				if(notif.active) this.close(notif);
			}.bind(this), timeout || 9000);
		}

		return notif;
	};
	NotificationManager.replace = function(notif, contents, timeout, type) {
		if(notif.active) {
			if(contents) notif.contents = contents;
			if(type) notif.type = type;
			if(notif.timer) clearTimeout(notif.timer);
			if(timeout !== 0) {
				notif.timer = setTimeout(function() {
					if(notif.active) this.close(notif);
				}.bind(this), timeout || 9000);
			}
			this.update();
			return notif;
		}else{
			return this.open(contents, timeout, type);
		}
	};
	NotificationManager.close = function(notif) {
		notif.active = false;
		this.notifications = _.reject(this.notifications, function(n) { return n.key == notif.key; });
		this.update();
	};
	NotificationManager.update = function() {
		var node = document.getElementById("notifications-container");
		if(!node){
			node = document.createElement("div");
			node.id = "notifications-container";
			document.body.appendChild(node);
		}
		React.render(<NotificationsContainer notifications={this.notifications}/>, node);
	};

	return NotificationManager;
});