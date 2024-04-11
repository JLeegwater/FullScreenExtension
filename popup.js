console.log("Running popup.js");

document.addEventListener("DOMContentLoaded", function () {
	const slider = document.getElementById("slider");

	slider.addEventListener("input", function () {
		const sliderValue = this.value;
		document.getElementById("sliderValue").innerText = sliderValue;

		// Send the slider value to content.js
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { sliderValue: sliderValue });
		});
	});
});
