import { render, screen, waitFor } from '@testing-library/react';
import InteractiveMapPage from './InteractiveMapPage.jsx';
import { fetchMapLocations, fetchOffersByLocation } from '../services/map-client.js';

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
    setView: jest.fn(),
  }),
}));

describe('InteractiveMapPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses marker horaires from the listed location and filters invalid coordinates', async () => {
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
        typeLieu: 'Depot',
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
      offres: [],
    });

    render(<InteractiveMapPage />);

    await waitFor(() => expect(fetchMapLocations).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchOffersByLocation).toHaveBeenCalledWith(1));

    expect(screen.getByText(/Horaires:\s*Mardi 8h-12h/)).toBeInTheDocument();
    expect(screen.queryByText(/Horaires:\s*Jeudi 16h-19h/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('map-marker')).toHaveLength(1);
    expect(screen.getByText('1 lieu(x)')).toBeInTheDocument();
  });

  test('shows a contextual message when offers fail to load for the selected location', async () => {
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

    render(<InteractiveMapPage />);

    await waitFor(() => expect(fetchOffersByLocation).toHaveBeenCalledWith(4));

    expect(screen.getByText('Impossible de charger les offres de ce lieu.')).toBeInTheDocument();
    expect(screen.getByText('Impossible de charger les offres pour Magasin.')).toBeInTheDocument();
  });
});
