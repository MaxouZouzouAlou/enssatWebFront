import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InteractiveMapPage from './InteractiveMapPage.jsx';
import { fetchMapLocations, fetchOffersByLocation } from '../services/map-client.js';

const mockSetView = jest.fn();

jest.mock('../services/map-client.js', () => ({
  fetchMapLocations: jest.fn(),
  fetchOffersByLocation: jest.fn(),
}));

jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      mergeOptions: jest.fn(),
    },
  },
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  Marker: ({ children, eventHandlers }) => (
    <button type="button" data-testid="map-marker" onClick={eventHandlers?.click}>
      {children}
    </button>
  ),
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => null,
  useMap: () => ({
    setView: mockSetView,
  }),
}));

function renderWithQueryClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('InteractiveMapPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('starts with the sales points list and opens offers only after selecting a location', async () => {
    fetchMapLocations.mockResolvedValue([
      {
        idLieu: 1,
        typeLieu: 'Marche',
        horaires: 'Mardi 8h-12h',
        adresse: {
          ligne: '1 rue A',
          codePostal: '35000',
          ville: 'Rennes',
        },
        coordinates: {
          latitude: 48.12,
          longitude: -1.68,
        },
        offresCount: 2,
      },
      {
        idLieu: 2,
        typeLieu: 'Ferme',
        horaires: 'Jeudi 16h-19h',
        adresse: {
          ligne: '2 rue B',
          codePostal: '35000',
          ville: 'Rennes',
        },
        coordinates: {
          latitude: null,
          longitude: -1.65,
        },
        offresCount: 1,
      },
    ]);

    fetchOffersByLocation.mockResolvedValue({
      lieu: {
        idLieu: 1,
        typeLieu: 'Marche',
        horaires: 'Detail charge',
        adresse: {
          ligne: '1 rue A',
          codePostal: '35000',
          ville: 'Rennes',
        },
      },
      offres: [
        {
          idProduit: 7,
          idProfessionnel: 2,
          nom: 'Pommes',
          prix: 2.5,
          unitaireOuKilo: false,
          nature: 'Fruit',
          bio: true,
          stock: 15,
          producteur: { prenom: 'Anna', nom: 'Le Goff' },
          entreprise: { nom: 'Les Vergers' },
        },
      ],
    });

    renderWithQueryClient(<InteractiveMapPage />);

    await waitFor(() => expect(fetchMapLocations).toHaveBeenCalledTimes(1));
    expect(fetchOffersByLocation).not.toHaveBeenCalled();

    expect(screen.getByText('Liste des points de vente')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /ouvrir marche/i })).toBeInTheDocument();
    expect(screen.getByText('1 lieu(x)')).toBeInTheDocument();
    expect(screen.getAllByText(/Horaires:\s*Mardi 8h-12h/)).toHaveLength(2);
    expect(screen.queryByText(/Horaires:\s*Jeudi 16h-19h/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('map-marker')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /ouvrir marche/i }));

    await waitFor(() => expect(fetchOffersByLocation).toHaveBeenCalledWith(1));
    expect(screen.getByText('Offres du lieu selectionne')).toBeInTheDocument();
    expect(await screen.findByText('Pommes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retour a la liste/i })).toBeInTheDocument();
    expect(mockSetView).toHaveBeenLastCalledWith([48.12, -1.68], 14);
  });

  test('opens a location from the map and allows returning to the list', async () => {
    fetchMapLocations.mockResolvedValue([
      {
        idLieu: 4,
        typeLieu: 'Magasin',
        horaires: 'Vendredi 10h-18h',
        adresse: {
          ligne: '4 rue C',
          codePostal: '35400',
          ville: 'Saint-Malo',
        },
        coordinates: {
          latitude: 48.65,
          longitude: -2.02,
        },
        offresCount: 0,
      },
    ]);

    fetchOffersByLocation.mockRejectedValue(new Error('Impossible de charger les offres de ce lieu.'));

    renderWithQueryClient(<InteractiveMapPage />);

    await waitFor(() => expect(fetchMapLocations).toHaveBeenCalledTimes(1));
    await screen.findByTestId('map-marker');

    fireEvent.click(await screen.findByTestId('map-marker'));

    await waitFor(() => expect(fetchOffersByLocation).toHaveBeenCalledWith(4));
    expect(await screen.findByText('Impossible de charger les offres de ce lieu.')).toBeInTheDocument();
    expect(await screen.findByText('Impossible de charger les offres pour Magasin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retour a la liste/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retour a la liste/i }));

    expect(screen.getByText('Liste des points de vente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ouvrir magasin/i })).toBeInTheDocument();
    expect(mockSetView).toHaveBeenLastCalledWith([48.65, -2.02], 11);
  });
});
