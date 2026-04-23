const ADDRESS_API_BASE_URL = 'https://data.geopf.fr/geocodage/completion/';

function extractAddressLine(result) {
	const fulltext = String(result?.fulltext || '').trim();
	if (fulltext.includes(',')) {
		const [line] = fulltext.split(',');
		if (line?.trim()) return line.trim();
	}

	const houseNumber = String(result?.housenumber || result?.number || '').trim();
	const street = String(result?.street || '').trim();
	if (houseNumber && street) return `${houseNumber} ${street}`.trim();
	if (street) return street;

	return fulltext;
}

function normalizeSuggestion(result) {
	if (!result || typeof result !== 'object') return null;

	const adresseLigne = extractAddressLine(result);
	const codePostal = String(result.zipcode || '').trim();
	const ville = String(result.city || result.oldcity || '').trim();
	const latitude = Number(result.y);
	const longitude = Number(result.x);

	if (!adresseLigne || !codePostal || !ville) return null;

	return {
		label: String(result.fulltext || `${adresseLigne}, ${codePostal} ${ville}`).trim(),
		adresse_ligne: adresseLigne,
		code_postal: codePostal,
		ville,
		coordinates: Number.isFinite(latitude) && Number.isFinite(longitude)
			? { latitude, longitude }
			: null
	};
}

export async function fetchAddressSuggestions(query, { limit = 5, signal } = {}) {
	const normalizedQuery = String(query || '').trim();
	if (normalizedQuery.length < 3) return [];

	const params = new URLSearchParams({
		text: normalizedQuery,
		type: 'StreetAddress',
		maximumResponses: String(limit)
	});

	const response = await fetch(`${ADDRESS_API_BASE_URL}?${params.toString()}`, { signal });
	const data = await response.json().catch(() => ({}));

	if (!response.ok || data?.status !== 'OK') {
		throw new Error("Impossible de charger les suggestions d'adresse.");
	}

	return (Array.isArray(data.results) ? data.results : [])
		.map(normalizeSuggestion)
		.filter(Boolean);
}
