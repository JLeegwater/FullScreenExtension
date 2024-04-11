// const tag = document.createElement("script");
// document.head.appendChild(tag);
const dev = false;

function findPlayer() {
	let player = document.querySelector("video");

	if (!player) {
		dev && console.log("Could not find non Shadow Host player");
		player = findShadowPlayer();
	}

	return player ? player : null;
}

function findShadowPlayer() {
	const allElements = document.querySelectorAll("*");

	for (let element of allElements) {
		if (element.shadowRoot !== null) {
			const videoElement = element.shadowRoot.querySelector("video");
			if (videoElement) {
				dev &&
					console.log(
						"Found video element within an open Shadow Host:",
						videoElement
					);

				return videoElement;
				// You can perform further actions with the video element here
			}
		}
	}
}

//function waitForPlayer() to call findPlayer(). if find player is not found, wait for 3 seconds and try again up to 3 times
function waitForPlayer(timeout = 3000, retryCount = 3) {
	return new Promise((resolve, reject) => {
		let attempts = 0;

		const tryToResolve = () => {
			const element = findPlayer();

			if (element) {
				resolve(element);
			} else {
				const handleTimeout = () => {
					if (attempts < retryCount) {
						attempts++;
						tryToResolve();
					} else {
						reject(
							new Error(`Failed to find player after ${retryCount} attempts`)
						);
					}
				};

				setTimeout(handleTimeout, timeout);
			}
		};

		tryToResolve();
	});
}

async function runExtension() {
	console.log("Running Widescreen extension");
	try {
		let player = await waitForPlayer();

		if (player === null || player === undefined) {
			throw new Error("Null pointer exception: player is null");
		}

		player.addEventListener("loadeddata", () => {
			if (player.readyState >= 3) {
				dev &&
					console.log("Video player is fully loaded and ready for interaction");

				chrome.runtime.onMessage.addListener(function (
					message,
					sender,
					sendResponse
				) {
					if (message.sliderValue === undefined) {
						throw new Error(
							"Invalid message from onMessage listener:",
							message
						);
					}

					const sliderValue = message.sliderValue;

					if (isNaN(sliderValue)) {
						throw new Error("Invalid slider value:", sliderValue);
					}

					dev && console.log("Received slider value:", sliderValue);

					// Perform actions with the slider value in content.js
					player.style.transform = "scale(" + sliderValue + ")";
				});
			}
		});
	} catch (error) {
		console.error("Error in runExtension:", error);
	}
}

window.addEventListener("DOMContentLoaded", runExtension);
