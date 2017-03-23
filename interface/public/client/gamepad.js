var GamepadHandler = {
	_main_gamepad: null,

	loop: function() {
		window.requestAnimationFrame(this.loop.bind(this));

		var pads = navigator.getGamepads();

		for (i in pads) {
			if (!(pads[i] instanceof Gamepad))
				continue;

			if (pads[i].id != this._main_gamepad)
				continue;

			this.update_speed(pads[i]);
			this.update_head(pads[i]);
			this.update_eyes(pads[i]);
		}
	},

	prev_speeds: [0, 0],

	update_speed: function(pad) {
		var speedL, speedR, turn;
		var turn_fact = 0.6;

		if (pad.buttons[0].pressed && !pad.buttons[1].pressed) {
			// Forward
			turn = pad.axes[0] * turn_fact * robairros.speed;
			speedL = robairros.speed - Math.abs(turn) - turn;
			speedR = robairros.speed - Math.abs(turn) + turn;
		} else if (!pad.buttons[0].pressed && pad.buttons[1].pressed) {
			// Backward
			turn = pad.axes[0] * turn_fact * robairros.speed;
			speedL = -robairros.speed + Math.abs(turn) - turn;
			speedR = -robairros.speed + Math.abs(turn) + turn;
		} else {
			// Turn only
			speedL = -pad.axes[0] * robairros.speed;
			speedR = pad.axes[0] * robairros.speed;
		}

		if (Math.abs(speedL) <= 2 && Math.abs(speedR) <= 2
				&& this.prev_speeds[0] == 0 && this.prev_speeds[1] == 0)
			return;

		this.prev_speeds = [speedL, speedR];

		topic_cmd.publish(new ROSLIB.Message({
			speedL: Math.round(speedL),
			speedR: Math.round(speedR)
		}));
	},

	head_target: 0,
	head_cmd_sent: false,

	on_head_change: function(deg) {
		if (deg == this.head_target)
			head_cmd_sent = false;
	},

	update_head: function(pad) {
		var new_target;
		var turn_fact = 0.3;

		if (!this.head_cmd_sent)
			this.head_target = headcur;

		new_target = this.head_target + pad.axes[2] * turn_fact;

		if (new_target > 90)
			new_target = 90;
		else if (new_target < -90)
			new_target = -90;

		if (new_target != this.head_target) {
			this.head_cmd_sent = true;

			if (Math.floor(new_target) != Math.floor(this.head_target))
				robairros.setHead(Math.floor(new_target));

			this.head_target = new_target;
		}
	},

	eyes_target: Eyes.EYESSTRAIGHT,

	eyes_btn_map: {
		12: Eyes.EYESTOP,
		13: Eyes.EYESBOTTOM,
		14: Eyes.EYESLEFT,
		15: Eyes.EYESRIGHT,
	},

	update_eyes: function(pad) {
		var new_target = Eyes.EYESSTRAIGHT;

		for (btn in this.eyes_btn_map) {
			if (pad.buttons[btn].pressed) {
				new_target = this.eyes_btn_map[btn];
				break;
			}
		}

		if (new_target != this.eyes_target) {
			robairros.setEyes(new_target);
			this.eyes_target = new_target;
		}
	},

	on_connect: function(evt) {
		if (this._main_gamepad == null)
			this._main_gamepad = evt.gamepad.id;
	},

	on_disconnect: function(evt) {
		if (this._main_gamepad._pad.id == evt.gamepad.id) {
			this._main_gamepad = null;

			var pads = navigator.getGamepads();
			for (i in pads) {
				if (pads[i] instanceof Gamepad)
					this._main_gamepad = pads[i].id;
			}
		}
	},

	init: function() {
		var pads = navigator.getGamepads();
		for (i in pads) {
			if (pads[i] instanceof Gamepad)
				this.on_connect({gamepad: pads[i]});
		}

		var _this = this;
		var prev_headChange = robairros.headChange;
		robairros.headChange = function(deg) {
			prev_headChange(deg);
			_this.on_head_change(deg);
		};

		window.addEventListener('gamepadconnected',
				this.on_connect.bind(this), false);
		window.addEventListener('gamepaddisconnected',
				this.on_disconnect.bind(this), false);
		window.requestAnimationFrame(this.loop.bind(this));
	}
};

GamepadHandler.init();
