import axios from 'axios';
import { API_BASE_URL } from './env';

const defaultRequestHeaders = {
	'Content-Type': 'application/json',
	'Device-Type': 'desktop',
	'User-Time-Zone': Intl.DateTimeFormat().resolvedOptions().timeZone,
	'User-Locale': navigator.language,
};

export { defaultRequestHeaders };

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: defaultRequestHeaders,
	withCredentials: true,
});

export default api;
