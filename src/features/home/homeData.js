import heroImage from '../../assets/images/home/hero.webp';
import fruitsImage from '../../assets/images/home/fruits.webp';
import dairyImage from '../../assets/images/home/dairy.webp';
import customerImage from '../../assets/images/home/marche.webp';

export const homeImages = {
	hero: heroImage,
	fruits: fruitsImage,
	dairy: dairyImage,
	customer: customerImage,
	producer: customerImage,
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
