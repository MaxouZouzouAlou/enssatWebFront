import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import AppRoutes from '../AppRoutes.jsx';
import { ToastProvider } from '../ToastProvider.jsx';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 3 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
				<ToastProvider>
					<AppRoutes />
				</ToastProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
