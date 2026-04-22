import { BrowserRouter } from 'react-router';
import AppRoutes from './AppRoutes.jsx';

function App() {
	return (
		<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
			<AppRoutes />
		</BrowserRouter>
	);
}

export default App;
