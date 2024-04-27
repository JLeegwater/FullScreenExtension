console.log("Running popup.js");

document.addEventListener("DOMContentLoaded", () => {
	const slider = document.getElementById("slider");
	const sliderValueElement = document.getElementById("sliderValue");
	const saveButton = document.getElementById("saveButton");
	const storedValue = localStorage.getItem("sliderValue") || 1;
	let savedLevels = JSON.parse(localStorage.getItem("savedLevels")) || [];

	setSliderValue(storedValue);
	displaySavedLevels();

	slider.addEventListener("input", function () {
		setSliderValue(this.value);
	});

	saveButton.addEventListener("click", () => {
		const name = document.getElementById("nameInput").value;
		const level = slider.value;

		savedLevels.push({
			name: name,
			level: level,
		});

		localStorage.setItem("savedLevels", JSON.stringify(savedLevels));

		displaySavedLevels();
	});

	function setSliderValue(value) {
		slider.value = value;
		sliderValueElement.innerText = value;
		localStorage.setItem("sliderValue", value);
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { sliderValue: value });
		});
	}

	function displaySavedLevels() {
		const savedLevelsDiv = document.getElementById("savedLevels");
		savedLevelsDiv.innerHTML = "";

		savedLevels.forEach((level) => {
			const button = document.createElement("button");
			button.textContent = `${level.name}: ${level.level}`;
			button.name = level.name;
			button.value = level.level;
			button.addEventListener("click", function () {
				setSliderValue(this.value);
			});

			const deleteBtn = document.createElement("button");
			deleteBtn.textContent = "X";
			deleteBtn.addEventListener("click", function (e) {
				e.stopPropagation();
				savedLevels = savedLevels.filter(
					(level) => level.name !== this.parentNode.name
				);

				localStorage.setItem("savedLevels", JSON.stringify(savedLevels));

				displaySavedLevels();
			});

			button.appendChild(deleteBtn);
			savedLevelsDiv.appendChild(button);
		});
	}
});
