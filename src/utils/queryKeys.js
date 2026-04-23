export const queryKeys = {
	auth: {
		profile: ['auth', 'profile'],
	},
	products: {
		all: ['products'],
		list: (params) => ['products', 'list', params],
		detail: (idProduit) => ['products', 'detail', String(idProduit)],
		professionalList: (professionalId, companyId) => [
			'products',
			'professional',
			String(professionalId),
			companyId == null ? 'all-companies' : String(companyId)
		],
	},
	reviews: {
		product: (idProduit) => ['reviews', 'product', String(idProduit)],
		professional: (idProfessionnel) => ['reviews', 'professional', String(idProfessionnel)],
	},
	orders: {
		history: ['orders', 'history'],
		recurring: ['orders', 'recurring'],
		detail: (idCommande) => ['orders', 'detail', String(idCommande)],
	},
	loyalty: {
		me: ['loyalty', 'me'],
	},
	superadmin: {
		all: ['superadmin'],
		overview: ['superadmin', 'overview'],
		accounts: ['superadmin', 'accounts'],
		companies: ['superadmin', 'companies'],
		products: ['superadmin', 'products'],
	},
	map: {
		locations: ['map', 'locations'],
		offers: (idLieu) => ['map', 'offers', String(idLieu)],
	},
	notifications: {
		all: ['notifications'],
		list: ['notifications', 'list'],
	},
	cart: {
		current: ['cart', 'current'],
	},
	incidents: {
		all: ['incidents'],
		list: ['incidents', 'list'],
		detail: (ticketId) => ['incidents', 'detail', String(ticketId)],
	},
	dashboard: {
		professional: (professionalId, companyId) => [
			'dashboard',
			'professional',
			String(professionalId),
			companyId == null ? 'all-companies' : String(companyId)
		],
	},
	salesPoints: {
		company: (professionalId, companyId) => [
			'sales-points',
			'company',
			String(professionalId),
			String(companyId)
		],
	},
};
