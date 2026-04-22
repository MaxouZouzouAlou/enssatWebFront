import { useState } from 'react';
import { SurfaceCard } from '../../components/layout';
import { moduleOptions, severityOptions } from './incidentsData';

const emptyForm = {
	title: '',
	description: '',
	moduleConcerne: 'Plateforme',
	severity: 'medium',
};

export default function IncidentForm({ loading, onSubmit }) {
	const [form, setForm] = useState(emptyForm);

	const update = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const submit = async (event) => {
		event.preventDefault();
		const created = await onSubmit(form);
		if (created) {
			setForm(emptyForm);
		}
	};

	return (
		<SurfaceCard as="section" className="col-span-12 p-4 xl:col-span-4">
			<h2 className="text-xl font-semibold">Nouveau ticket</h2>
			<form className="mt-4 space-y-3" onSubmit={submit}>
				<div>
					<label className="mb-1 block text-sm font-medium" htmlFor="incident-title">Titre</label>
					<input
						id="incident-title"
						minLength={3}
						onChange={update('title')}
						required
						value={form.title}
						className="w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
						placeholder="Ex: Paiement impossible"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium" htmlFor="incident-description">Description</label>
					<textarea
						id="incident-description"
						minLength={10}
						onChange={update('description')}
						required
						rows={4}
						value={form.description}
						className="w-full resize-y rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
						placeholder="Decrivez le dysfonctionnement observe"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium" htmlFor="incident-module">Module concerne</label>
					<select
						id="incident-module"
						value={form.moduleConcerne}
						onChange={update('moduleConcerne')}
						className="w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
					>
						{moduleOptions.map((module) => (
							<option key={module}>{module}</option>
						))}
					</select>
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium" htmlFor="incident-severity">Severite</label>
					<select
						id="incident-severity"
						value={form.severity}
						onChange={update('severity')}
						className="w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
					>
						{severityOptions.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-400"
				>
					{loading ? 'Creation...' : 'Creer le ticket'}
				</button>
			</form>
		</SurfaceCard>
	);
}
