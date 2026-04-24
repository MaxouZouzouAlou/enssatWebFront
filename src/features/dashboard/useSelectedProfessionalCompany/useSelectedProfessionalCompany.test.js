import { act, renderHook, waitFor } from '@testing-library/react';
import useSelectedProfessionalCompany, { getProfessionalCompanies } from './useSelectedProfessionalCompany';

const companies = [
	{ id: 12, nom: 'Ferme Keravel' },
	{ id: 19, nom: 'Maraichers du Tregor' }
];

test('derives the professional companies list from entreprises first', () => {
	expect(
		getProfessionalCompanies({
			professionnel: {
				entreprises: companies,
				entreprise: { id: 99, nom: 'Ignored fallback' }
			}
		})
	).toEqual(companies);
});

test('falls back to a single entreprise when needed', () => {
	expect(
		getProfessionalCompanies({
			professionnel: {
				entreprise: companies[0]
			}
		})
	).toEqual([companies[0]]);
});

test('selects the first available company by default and preserves manual selection', async () => {
	const profile = { professionnel: { entreprises: companies } };
	const { result, rerender } = renderHook(
		({ isProfessional, currentProfile }) => useSelectedProfessionalCompany({ isProfessional, profile: currentProfile }),
		{
			initialProps: {
				isProfessional: true,
				currentProfile: profile
			}
		}
	);

	await waitFor(() => expect(result.current.selectedProfessionalCompanyId).toBe('12'));
	expect(result.current.selectedProfessionalCompany).toEqual(companies[0]);

	act(() => {
		result.current.setSelectedProfessionalCompanyId('19');
	});

	expect(result.current.selectedProfessionalCompanyId).toBe('19');
	expect(result.current.selectedProfessionalCompany).toEqual(companies[1]);

	rerender({
		isProfessional: true,
		currentProfile: {
			professionnel: {
				entreprises: [companies[1]]
			}
		}
	});

	await waitFor(() => expect(result.current.selectedProfessionalCompanyId).toBe('19'));
	expect(result.current.selectedProfessionalCompany).toEqual(companies[1]);
});

test('clears the selection when the professional context disappears', async () => {
	const { result, rerender } = renderHook(
		({ isProfessional, currentProfile }) => useSelectedProfessionalCompany({ isProfessional, profile: currentProfile }),
		{
			initialProps: {
				isProfessional: true,
				currentProfile: {
					professionnel: {
						entreprises: companies
					}
				}
			}
		}
	);

	await waitFor(() => expect(result.current.selectedProfessionalCompanyId).toBe('12'));

	rerender({
		isProfessional: false,
		currentProfile: null
	});

	await waitFor(() => expect(result.current.selectedProfessionalCompanyId).toBeNull());
	expect(result.current.selectedProfessionalCompany).toBeNull();
	expect(result.current.professionalCompanies).toEqual([]);
});
