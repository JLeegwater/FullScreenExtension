const verbosity = 6;
const dev = true;
console.log("Starting wideContent.js");
initializeWhenReady(document);
// wideContent.js

function addWidescreenFunctionality(playerElement) {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const scale = message.sliderValue;
		const positionFix = message.positionFix;
		console.log(message);
		if (scale) {
			playerElement.style.transform = `scale(${scale})`;
		}
		if (positionFix) {
			console.log("positionFix is true");
			playerElement.style.position = "static";
		}
		if (isNaN(positionFix)) {
			console.log(positionFix);
			throw new Error("Invalid position fix:", positionFix);
		}

		if (isNaN(scale)) {
			throw new Error("Invalid slider value:", scale);
		}
	});
}

function log(message, level) {
	if (typeof level === "undefined") {
		level = 6;
	}
	if (verbosity >= level) {
		if (level === 2) {
			console.log("ERROR:" + message);
		} else if (level === 3) {
			console.log("WARNING:" + message);
		} else if (level === 4) {
			console.log("INFO:" + message);
		} else if (level === 5) {
			console.log("DEBUG:" + message);
		} else if (level === 6) {
			console.log("DEBUG (VERBOSE):" + message);
			console.trace();
		}
	}
}

function initializeWhenReady(document) {
	log("Begin initializeWhenReady", 5);

	window.onload = () => {
		initializeNow(window.document);
	};
	if (document) {
		if (document.readyState === "complete") {
			initializeNow(document);
		} else {
			document.onreadystatechange = () => {
				if (document.readyState === "complete") {
					initializeNow(document);
				}
			};
		}
	}
	log("End initializeWhenReady", 5);
}

function getShadow(parent) {
	let result = [];
	function getChild(parent) {
		if (parent.firstElementChild) {
			var child = parent.firstElementChild;
			do {
				result.push(child);
				getChild(child);
				if (child.shadowRoot) {
					result.push(getShadow(child.shadowRoot));
				}
				child = child.nextElementSibling;
			} while (child);
		}
	}
	getChild(parent);
	return result.flat(Infinity);
}

function initializeNow(document) {
	log("Begin initializeNow", 5);
	// enforce init-once due to redundant callers
	if (!document.body || document.body.classList.contains("ws-initialized")) {
		return;
	}
	try {
		setupListener();
	} catch {
		// no operation
	}
	document.body.classList.add("ws-initialized");
	log("initializeNow: ws-initialized added to document body", 5);

	function checkForVideoAndShadowRoot(node, parent, added) {
		// Only proceed with supposed removal if node is missing from DOM
		if (!added && document.body?.contains(node)) {
			return;
		}
		if (node.nodeName === "VIDEO") {
			if (added) {
				addWidescreenFunctionality(node);
			} else {
				if (node.vsc) {
					node.vsc.remove();
				}
			}
		} else {
			var children = [];
			if (node.shadowRoot) {
				documentAndShadowRootObserver.observe(
					node.shadowRoot,
					documentAndShadowRootObserverOptions
				);
				children = Array.from(node.shadowRoot.children);
			}
			if (node.children) {
				children = [...children, ...node.children];
			}
			for (const child of children) {
				checkForVideoAndShadowRoot(child, child.parentNode || parent, added);
			}
		}
	}

	var documentAndShadowRootObserver = new MutationObserver(function (
		mutations
	) {
		// Process the DOM nodes lazily
		requestIdleCallback(
			(_) => {
				mutations.forEach(function (mutation) {
					switch (mutation.type) {
						case "childList":
							mutation.addedNodes.forEach(function (node) {
								if (typeof node === "function") return;
								if (node === document.documentElement) {
									// This happens on sites that use document.write, e.g. watch.sling.com
									// When the document gets replaced, we lose all event handlers, so we need to reinitialize
									log("Document was replaced, reinitializing", 5);
									initializeWhenReady(document);
									return;
								}
								checkForVideoAndShadowRoot(
									node,
									node.parentNode || mutation.target,
									true
								);
							});
							mutation.removedNodes.forEach(function (node) {
								if (typeof node === "function") return;
								checkForVideoAndShadowRoot(
									node,
									node.parentNode || mutation.target,
									false
								);
							});
							break;
						case "attributes":
							if (
								(mutation.target.attributes["aria-hidden"] &&
									mutation.target.attributes["aria-hidden"].value == "false") ||
								mutation.target.nodeName === "APPLE-TV-PLUS-PLAYER"
							) {
								var flattenedNodes = getShadow(document.body);
								var nodes = flattenedNodes.filter((x) => x.tagName == "VIDEO");
								for (let node of nodes) {
									// only add vsc the first time for the apple-tv case (the attribute change is triggered every time you click the vsc)
									if (
										node.vsc &&
										mutation.target.nodeName === "APPLE-TV-PLUS-PLAYER"
									)
										continue;
									if (node.vsc) node.vsc.remove();
									checkForVideoAndShadowRoot(
										node,
										node.parentNode || mutation.target,
										true
									);
								}
							}
							break;
					}
				});
			},
			{ timeout: 1000 }
		);
	});
	documentAndShadowRootObserverOptions = {
		attributeFilter: ["aria-hidden", "data-focus-method"],
		childList: true,
		subtree: true,
	};
	documentAndShadowRootObserver.observe(
		document,
		documentAndShadowRootObserverOptions
	);

	const mediaTagSelector = "video";
	mediaTags = Array.from(document.querySelectorAll(mediaTagSelector));

	document.querySelectorAll("*").forEach((element) => {
		if (element.shadowRoot) {
			documentAndShadowRootObserver.observe(
				element.shadowRoot,
				documentAndShadowRootObserverOptions
			);
			mediaTags.push(...element.shadowRoot.querySelectorAll(mediaTagSelector));
		}
	});

	mediaTags.forEach(function (video) {
		console.log("Line 220: ");
		console.log(video);

		addWidescreenFunctionality(video);
	});

	var frameTags = document.getElementsByTagName("iframe");
	Array.prototype.forEach.call(frameTags, function (frame) {
		// Ignore frames we don't have permission to access (different origin).
		try {
			var childDocument = frame.contentDocument;
		} catch (e) {
			return;
		}
		console.log(frame);
		initializeWhenReady(childDocument);
	});
	log("End initializeNow", 5);
}
