/// <reference types="vite/client" />

interface AudioSession {
	type: 'auto' | 'playback' | 'transient' | 'transient-solo' | 'ambient' | 'play-and-record';
}

interface Navigator {
	readonly audioSession?: AudioSession;
}
