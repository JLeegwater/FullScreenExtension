console.log("Running popup.js");

document.addEventListener("DOMContentLoaded", function () {
	const slider = document.getElementById("slider");

	// Check if slider value is stored in local storage
	const storedValue = localStorage.getItem("sliderValue");
	if (storedValue) {
		slider.value = storedValue;
		document.getElementById("sliderValue").innerText = storedValue;
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				sliderValue: storedValue,
			});
		});
	}

	slider.addEventListener("input", function () {
		const sliderValue = this.value;
		document.getElementById("sliderValue").innerText = sliderValue;

		// Store the slider value in local storage
		localStorage.setItem("sliderValue", sliderValue);

		// Send the slider value to content.js
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { sliderValue: sliderValue });
		});
	});
});
