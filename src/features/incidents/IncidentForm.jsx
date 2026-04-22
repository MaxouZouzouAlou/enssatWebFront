import { useState } from 'react';
import { ActionButton } from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
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
				<FormField
					label="Titre"
					minLength={3}
					name="incident-title"
					onChange={update('title')}
					required
					value={form.title}
				/>
				<FormField
					as="textarea"
					label="Description"
					minLength={10}
					name="incident-description"
					onChange={update('description')}
					required
					rows={4}
					value={form.description}
				/>
				<FormField
					as="select"
					label="Module concerne"
					name="incident-module"
					value={form.moduleConcerne}
					onChange={update('moduleConcerne')}
				>
					{moduleOptions.map((module) => (
						<option key={module}>{module}</option>
					))}
				</FormField>
				<FormField
					as="select"
					label="Severite"
					name="incident-severity"
					value={form.severity}
					onChange={update('severity')}
				>
					{severityOptions.map((option) => (
						<option key={option.value} value={option.value}>{option.label}</option>
					))}
				</FormField>
				<ActionButton
					type="submit"
					disabled={loading}
					className="w-full"
				>
					{loading ? 'Creation...' : 'Creer le ticket'}
				</ActionButton>
			</form>
		</SurfaceCard>
	);
}
