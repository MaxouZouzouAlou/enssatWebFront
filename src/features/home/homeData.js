export const homeImages = {
	hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMIIurfsLfLFFCtC9Ey4HOyjYB9AjePWuLOnqtCqkxg0LLVTX66EqsfJSyLdu-AQ05pyRBkL9zB3c6QV8etwX5ycrZu8o7wUyxKjd4ZdSyAbGpY36e7cspfS5Of6zZRJA5B5gLnr_CHP5aIP11HzAu0IkGJRlaQxBjl15l3ttepyJNfS1faWWY9oltwsug5OyHsyrhGl1GnqQKH7qNG_m3SRIqn8Q7g73ogfXJkoQSCb0mMn_kdM73_TxVMoUAQCp0fZvtdw1iwYAC',
	fruits: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBajotJesE_f86j-Oh16-uBZNTJxlfgk5zGs3JoOm5zRwgIAtTSRgDrqTBjwgVAbQEeKvaKze0yji7fNZVjZT17sp_jFCcuvOSbUkyu4d5gAs_cESOJfuNFJS9z1jGZbBxUpTFgc0-nsNFKVaUh0XiSHRp8UuPG5fDetZ1zuaUvSbeQxRmCK1aFUhmTJeRVThLozWFHmSdzwoCYXo1POAZQVG2PXYM-wIb-2qqnf-0Ya1mGuDA0P3PBEYvTrQV5pm5UZUkeXl_gKg1o',
	dairy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkN2hv-8uiz1DPP4HEVbWpQYThDmkTzi5pjeUL_pHktrdb0mGZK5sG4uP9SMhqpml_zzEdUbcS67S0XmCHi2FwHMEfXNBcQg6SZtLnM72XG9-SB4Rj62w9Vho9aoCSdgTm7woqOKCdobww0zQvJcSsR7SH4UrCqq1or_qA6KDVhS_mTLgkyXzZ4Y_tZBob9xQA9LcWqgvBlyc1FiIzHxXKAJU_kvrh-jAzczPH7nekY5AbOV_POEahkv8iuQBaZbSe3rGmD3_rTouY',
	producer: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5zSerQr8GC7AOl2s-7ZHs50wfaKZZHd3Lohts14Q6nT2Of7Kc2MNP0eg5WUO74XIFegiDw_8mhklp43ebvPQYtVsgy6i6kbWPaG6lmxpKTiMR9cl9Ei_33nGKzSVO1tfeuW0dDzPaB5jHCyKWd2zVLxMOGl-5xg4WK2kCSRJnLY5oAim5refuSLU2ae0eNfi6JhBjKe6Jr7r2tvzdZe08eB8Zw-e4txYvko6X0aLBkip5B7EBp3NNoR025d66kTczs_KYeKhgcAc-',
};

export const collections = [
	{
		label: '01',
		title: 'Fruits et légumes',
		text: 'Des produits de saison, visibles selon les stocks et le moment de récolte.',
		className: 'md:col-span-4',
		tone: 'warm'
	},
	{
		label: '02',
		title: 'Paniers du marché',
		text: 'Composez une liste de courses et préparez un retrait simple sur vos lieux favoris.',
		className: 'md:col-span-8',
		image: homeImages.fruits
	},
	{
		label: '03',
		title: 'Crémerie locale',
		text: 'Fromages, beurre et produits fermiers proposés directement par les producteurs.',
		className: 'md:col-span-7',
		image: homeImages.dairy
	},
	{
		label: '04',
		title: 'Points de vente',
		text: 'Retrait à la ferme, point relais ou livraison à domicile selon les possibilités.',
		className: 'md:col-span-5',
		tone: 'light'
	}
];

export const promises = [
	{
		icon: 'map',
		title: 'Carte et proximité',
		text: 'Repérez les lieux de vente autour de vous et choisissez le mode de récupération adapté.'
	},
	{
		icon: 'route',
		title: 'Parcours optimisé',
		text: 'Préparez vos courses en limitant les détours grâce aux points de retrait et aux favoris.'
	},
	{
		icon: 'inventory_2',
		title: 'Stock et saison',
		text: 'Les producteurs gardent la main sur la visibilité des produits, les quantités et la saisonnalité.'
	}
];

export const customerSteps = [
	['01', 'Je découvre', 'Je consulte les produits, les producteurs et les lieux de vente proches.'],
	['02', 'Je compose', 'Je crée ma liste de courses ou mon panier avec les quantités souhaitées.'],
	['03', 'Je récupère', 'Je choisis retrait, point relais ou livraison lorsque le service est disponible.']
];
