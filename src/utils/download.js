export function triggerDownload(blob, fileName) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

export function extractFileNameFromDisposition(contentDisposition, fallbackName) {
	if (!contentDisposition) return fallbackName;

	const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match?.[1]) {
		try {
			return decodeURIComponent(utf8Match[1]);
		} catch {
			return utf8Match[1];
		}
	}

	const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
	if (asciiMatch?.[1]) {
		return asciiMatch[1];
	}

	return fallbackName;
}
