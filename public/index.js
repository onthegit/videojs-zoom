import 'video.js/dist/video-js.css';

import videojs from "video.js";

import '../src/plugin.css';
import '../src/plugin';

window.onload = () => {
	const video = videojs('my-video');
	const zoomPlugin = video.zoomPlugin();
	zoomPlugin.listen('click', () => {
		console.log('onclick');
	});
	zoomPlugin.listen('change', data => {
		console.log('onchange', data);
	});
	const button = document.getElementById('my-button');
	button.onclick = () => {
		zoomPlugin.toggle();
	};
}
