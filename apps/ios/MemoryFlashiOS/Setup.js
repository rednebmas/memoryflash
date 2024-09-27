(function () {
	var oldLog = console.log;
	console.log = function (...args) {
		oldLog.apply(console, args); // Pass all arguments to the original console.log
		if (
			window.webkit &&
			window.webkit.messageHandlers &&
			window.webkit.messageHandlers.consoleHandler
		) {
			window.webkit.messageHandlers.consoleHandler.postMessage(args.join(' ')); // Send all arguments as a string
		}
	};

	document.addEventListener('DOMContentLoaded', function () {
		var viewportMeta = document.querySelector('meta[name="viewport"]');
		if (viewportMeta) {
			viewportMeta.setAttribute(
				'content',
				'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
			);
		}
	});
})();
