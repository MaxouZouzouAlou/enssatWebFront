import { API_BASE_URL } from './api-config.js';

function isAbsoluteUrl(value) {
	return /^https?:\/\//i.test(String(value || ''));
}

export function buildApiUrl(path) {
	if (isAbsoluteUrl(path)) return path;
	const normalizedPath = String(path || '');
	if (!normalizedPath) return API_BASE_URL;
	return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

export async function request(path, options = {}) {
	const { headers, credentials = 'include', ...rest } = options;
	return fetch(buildApiUrl(path), {
		credentials,
		headers,
		...rest
	});
}

export async function readResponse(response) {
	const text = await response.text().catch(() => '');
	let data = {};
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = {};
	}

	return { data, text };
}

export async function requestJson(path, { defaultMessage, ...options } = {}) {
	const response = await request(path, options);
	const { data, text } = await readResponse(response);

	if (!response.ok) {
		throw new Error(data.error || data.message || text || defaultMessage);
	}

	return data;
}

export async function requestJsonOrNull(path, { nullStatuses = [], defaultMessage, ...options } = {}) {
	const response = await request(path, options);
	if (nullStatuses.includes(response.status)) {
		return null;
	}

	const { data, text } = await readResponse(response);
	if (!response.ok) {
		throw new Error(data.error || data.message || text || defaultMessage);
	}

	return data;
}

export async function requestOptionalJson(path, { fallbackMessage, onParseFailure = 'null', invalidJsonMessage = 'Invalid JSON response from server', ...options } = {}) {
	const response = await request(path, options);
	const text = await response.text().catch(() => '');

	if (!response.ok) {
		let details = text;
		try {
			const data = text ? JSON.parse(text) : {};
			details = data.error || data.message || text;
		} catch {
			details = text;
		}
		throw new Error(fallbackMessage + (details ? `: ${details}` : ''));
	}

	if (!text) return null;

	try {
		return JSON.parse(text);
	} catch {
		if (onParseFailure === 'throw') {
			throw new Error(invalidJsonMessage);
		}
		return null;
	}
}
