export const moduleOptions = [
	'Plateforme',
	'Paiement',
	'Catalogue',
	'Panier',
	'Infrastructure',
];

export const severityOptions = [
	{ value: 'low', label: 'Faible' },
	{ value: 'medium', label: 'Moyenne' },
	{ value: 'high', label: 'Elevee' },
	{ value: 'critical', label: 'Critique' },
];

export const statusOptions = [
	{ value: 'open', label: 'Ouvert' },
	{ value: 'in_progress', label: 'En cours' },
	{ value: 'resolved', label: 'Resolue' },
	{ value: 'closed', label: 'Cloturee' },
];

export const severityLabel = Object.fromEntries(severityOptions.map((option) => [option.value, option.label]));
export const statusLabel = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));

export const severityStyles = {
	critical: 'bg-red-100 text-red-800 border-red-200',
	high: 'bg-tertiary-50 text-tertiary-600 border-tertiary-200',
	medium: 'bg-amber-100 text-amber-800 border-amber-200',
	low: 'bg-primary-100 text-primary-700 border-primary-200',
};

export const alertLevelClasses = {
	critical: 'border-red-200 bg-red-50 text-red-900',
	warning: 'border-amber-200 bg-amber-50 text-amber-900',
	ok: 'border-primary-200 bg-primary-50 text-primary-800',
};
