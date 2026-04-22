import CollectionGrid from '../features/home/CollectionGrid.jsx';
import CustomerJourney from '../features/home/CustomerJourney.jsx';
import FeatureHighlights from '../features/home/FeatureHighlights.jsx';
import HomeHero from '../features/home/HomeHero.jsx';
import ProducerCta from '../features/home/ProducerCta.jsx';

function HomePage({ isAuthenticated = false, isProfessional = false }) {
	return (
		<div className="min-h-screen bg-neutral-100 text-secondary-900">
			<main>
				<HomeHero isAuthenticated={isAuthenticated} />
				<CollectionGrid />
				<FeatureHighlights />
				<CustomerJourney />
				<ProducerCta isAuthenticated={isAuthenticated} isProfessional={isProfessional} />
			</main>
		</div>
	);
}

export default HomePage;
