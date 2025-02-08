import videojs from "video.js";
import packageJson from "../package.json";

import { ZoomModal } from "./ZoomModal";
import { ZoomGesture } from "./ZoomGesture";
import { ZoomButton } from "./ZoomButton";
import { Observer } from "./helpers/Observer";

const { version: VERSION } = packageJson;
const Plugin = videojs.getPlugin("plugin");

const DEFAULT_OPTIONS = {
	zoom: 1,
	moveX: 0,
	moveY: 0,
	flip: "+",
	rotate: 0,
	showZoom: true,
	showMove: true,
	showRotate: true,
	gestureHandler: false
};

class ZoomPlugin extends Plugin {

	constructor(player, options = {}) {
		super(player);
		videojs.log("[~Zoom Plugin] start ", options);
		this._enabled = true;
		this.player = player;
		this.playerEl = player.el();
		this.listeners = {
			click: () => { },
			change: () => { },
		};
		this.playerEl.style.overflow = "hidden";
		this.state = Object.assign(DEFAULT_OPTIONS, options);
		this.state.flip = "+";
		if (this.state.showZoom || this.state.showMove || this.state.showRotate) {
			const controlBar = this.player.getChild("ControlBar")
			if (controlBar) {
				if (options.addZoomButtonBeforeLastButton) {
					controlBar.addChild("ZoomButton", {}, controlBar.children().length - 1);
				}
				if (!options.addZoomButtonBeforeLastButton) {
					controlBar.addChild("ZoomButton");
				}
			}
			this.player.addChild("ZoomModal", { plugin: this, state: this.state });
		}
		if (this.state.gestureHandler) {
			this.player.addChild("ZoomGesture", { plugin: this, state: this.state });
		}
		this._observer = Observer.getInstance();
		this._observer.notify("plugin", { enabled: this._enabled });
		this._setTransform();
	}

	gestureAdded = false

	zoom(value) {
		if (value <= 0) {
			throw new Error("Zoom value invalid");
		}
		if (this.player && this.state && !this.gestureAdded) {
  		this.gestureAdded = true
			this.state.gestureHandler = true
			this.player.addChild("ZoomGesture", { plugin: this, state: this.state });
		}
		this.state.zoom = value;
		this._setTransform();
	}

	rotate(value) {
		this.state.rotate = value;
		this._setTransform();
	}

	move(x, y) {
		this.state.moveX = x;
		this.state.moveY = y;
		this._setTransform();
	}

	flip(signal) {
		this.state.flip = signal;
		this._setTransform();
	}

	toggle() {
		const [modal] = this.playerEl.getElementsByClassName(
			"vjs-zoom-duck__container"
		);
		modal.classList.toggle("open");
	}

	listen(listener, callback) {
		this.listeners[listener] = callback;
	}

	_setTransform() {
		const [video] = this.playerEl.getElementsByTagName("video");
		video.style.transform = `
			translate(${this.state.moveX}px, ${this.state.moveY}px) 
			scale(${this.state.flip}${this.state.zoom}, ${this.state.zoom}) 
			rotate(${this.state.rotate}deg)
		`;
		this._notify();
	}

	_notify() {
		this._observer.notify("change", this.state);
	}

	enablePlugin() {
		if (this._enabled) return;
		this._enabled = !this._enabled;
		this.player.getChild("ControlBar").addChild("ZoomButton");
		const observer = Observer.getInstance();
		observer.notify("plugin", { enabled: this._enabled });
	}

	disablePlugin() {
		if (!this._enabled) return;
		this._enabled = !this._enabled;
		this.player.getChild("ControlBar").removeChild("ZoomButton");
		const [modal] = this.playerEl.getElementsByClassName(
			"vjs-zoom-duck__container"
		);
		modal.classList.remove("open");
		const observer = Observer.getInstance();
		observer.notify("plugin", { enabled: this._enabled });
	}

	handleStateChanged(event) { }

}

ZoomPlugin.defaultState = {};

ZoomPlugin.VERSION = VERSION;

videojs.registerComponent("ZoomModal", ZoomModal);
videojs.registerComponent("ZoomGesture", ZoomGesture);
videojs.registerComponent("ZoomButton", ZoomButton);
videojs.registerPlugin("zoomPlugin", ZoomPlugin);

export default ZoomPlugin;
