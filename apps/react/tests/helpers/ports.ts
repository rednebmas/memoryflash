import { createHash } from 'crypto';

const checkoutOffset = () => {
	const hash = createHash('sha1').update(process.cwd()).digest();
	return (hash.readUInt16BE(0) % 10000) * 2;
};

export const API_PORT = Number(process.env.MF_API_PORT) || 20000 + checkoutOffset();
export const WEB_PORT = Number(process.env.MF_WEB_PORT) || API_PORT + 1;
export const API_URL = `http://localhost:${API_PORT}`;
export const WEB_URL = `http://localhost:${WEB_PORT}`;
