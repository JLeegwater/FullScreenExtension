// background.js

// Listen for the extension installation or update event
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		// Perform any setup tasks if needed
		console.log("Extension installed!");
	}
});

// Listen for messages from content scripts or other parts of the extension
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// 	console.log("Got message from content script:", request);

// 	if (request.msg === "capture") {
// 		// Capture the visible tab

// 		chrome.tabs.captureVisibleTab(null, {}, function (dataUri) {
// 			// Handle the captured screenshot (dataUri) here
// 			// Assuming px, py as starting coordinates and hx, hy as width and height

// 			var img = new Image();

// 			img.onload = function () {
// 				const canvas = document.createElement("canvas");
// 				canvas.width = 1; // Set your desired width
// 				canvas.height = 1000; // Set your desired height
// 				const context = canvas.getContext("2d");
// 				context.drawImage(img, px, py, hx, hy, 0, 0, WIDTH, HEIGHT);
// 				const croppedUri = canvas.toDataURL("image/png");
// 				// You can use croppedUri as the image source or process it further
// 				sendResponse({ croppedUri });
// 			};
// 		});
// 	}
// 	return true; // Indicates that the listener will send a response asynchronously
// });

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
		console.log(dataUrl);
		chrome.tabs.create({ url: dataUrl });
	});
	return true;
});
