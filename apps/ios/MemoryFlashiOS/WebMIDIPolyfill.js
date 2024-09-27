(function () {
	// Check if the Web MIDI API is already available
	if (navigator.requestMIDIAccess) return;

	class MIDIPort extends EventTarget {
		constructor() {
			super();
			this.id = '';
			this.manufacturer = 'Riker Tech';
			this.name = '';
			this.type = '';
			this.version = '1.0';
			this.state = 'connected';
			this.connection = 'closed'; // or 'open', 'pending'
		}

		open() {
			return new Promise((resolve) => {
				this.connection = 'open';
				resolve(this);
			});
		}

		close() {
			return new Promise((resolve) => {
				this.connection = 'closed';
				resolve(this);
			});
		}
	}

	class MIDIInput extends MIDIPort {
		constructor() {
			super();
			this.onmidimessage = null;
			this.type = 'input';
			this.name = 'MemoryFlash MIDI Input';
		}

		_receiveMIDIMessage(data) {
			if (this.onmidimessage) {
				const midiEvent = new MIDIMessageEvent('midimessage', { data });
				this.onmidimessage(midiEvent);
			}
		}
	}

	class MIDIOutput extends MIDIPort {
		constructor() {
			super();
			this.type = 'output';
		}

		send(data, timestamp) {
			// Send data to Swift or handle as needed
			if (
				window.webkit &&
				window.webkit.messageHandlers &&
				window.webkit.messageHandlers.sendMIDIMessage
			) {
				window.webkit.messageHandlers.sendMIDIMessage.postMessage(Array.from(data));
			}
		}
	}

	class MIDIAccess {
		constructor() {
			this.inputs = new Map();
			this.outputs = new Map();
			this.sysexEnabled = false;

			// Create a MIDIInput instance
			const input = new MIDIInput();
			input.id = 'input-0';
			input.manufacturer = 'Unknown';
			input.name = 'Virtual MIDI Input';
			input.version = '1.0';
			this.inputs.set(input.id, input);

			// If you have outputs
			const output = new MIDIOutput();
			output.id = 'output-0';
			output.manufacturer = 'Unknown';
			output.name = 'Virtual MIDI Output';
			output.version = '1.0';
			this.outputs.set(output.id, output);

			window.__midiAccessInstance = this;

			// Notify Swift that MIDIAccess is ready
			if (
				window.webkit &&
				window.webkit.messageHandlers &&
				window.webkit.messageHandlers.midiAccessCreated
			) {
				window.webkit.messageHandlers.midiAccessCreated.postMessage('MIDIAccessCreated');
			}
		}

		onstatechange(event) {
			// Handle port connection/disconnection events
		}
	}

	function requestMIDIAccess(options = {}) {
		return new Promise((resolve, reject) => {
			const midiAccess = new MIDIAccess();
			resolve(midiAccess);
		});
	}

	// Attach the polyfill to the navigator object
	navigator.requestMIDIAccess = requestMIDIAccess;

	// Define MIDIMessageEvent if not available
	if (typeof MIDIMessageEvent === 'undefined') {
		class MIDIMessageEvent extends Event {
			constructor(type, { data }) {
				super(type);
				this.data = data;
			}
		}
		window.MIDIMessageEvent = MIDIMessageEvent;
	}

	// Function to receive MIDI messages from Swift
	window._receiveMIDIMessage = function (dataArray) {
		console.log('Received MIDI message from Swift:', dataArray);

		const data = new Uint8Array(dataArray);
		const midiAccess = window.__midiAccessInstance;
		if (midiAccess) {
			const input = midiAccess.inputs.get('input-0');
			if (input) {
				input._receiveMIDIMessage(data);
			} else {
				console.log('MIDIInput instance to recieve message not found');
			}
		} else {
			console.log('MIDIAccess instance not found');
		}
	};
})();
