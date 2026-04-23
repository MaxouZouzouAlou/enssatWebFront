import { useEffect, useState } from 'react';
import { ActionButton } from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { statusLabel, statusOptions } from './incidentsData';

export default function IncidentDetail({
	detail,
	loading,
	mutationLoading,
	onReply,
	onStatusChange,
	permissions,
}) {
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState('');
	const [commentaire, setCommentaire] = useState('');

	useEffect(() => {
		setStatus(detail?.ticket?.status || '');
		setMessage('');
		setCommentaire('');
	}, [detail?.ticket?.id, detail?.ticket?.status]);

	if (loading) {
		return (
			<SurfaceCard as="section" className="col-span-12 p-4 text-sm text-neutral-600">
				Chargement du ticket...
			</SurfaceCard>
		);
	}

	if (!detail?.ticket) {
		return (
			<SurfaceCard as="section" className="col-span-12 p-4 text-sm text-neutral-600">
				Sélectionnez un ticket pour consulter son historique et les réponses.
			</SurfaceCard>
		);
	}

	const submitReply = async (event) => {
		event.preventDefault();
		const sent = await onReply(message);
		if (sent) setMessage('');
	};

	const submitStatus = async (event) => {
		event.preventDefault();
		const updated = await onStatusChange(status, commentaire);
		if (updated) setCommentaire('');
	};

	const { ticket } = detail;

	return (
		<SurfaceCard as="section" className="col-span-12 p-4">
			<SoftPanel className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-600">Ticket #{ticket.id}</p>
					<h2 className="mt-1 text-2xl font-bold">{ticket.title}</h2>
					<p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-neutral-600">{ticket.description}</p>
				</div>
				<div className="text-sm text-neutral-600">
					<p><span className="font-semibold text-secondary-800">Statut :</span> {statusLabel[ticket.status] || ticket.status}</p>
					<p><span className="font-semibold text-secondary-800">Module :</span> {ticket.moduleConcerne}</p>
					<p><span className="font-semibold text-secondary-800">Createur :</span> {formatUser(ticket.creator)}</p>
				</div>
			</SoftPanel>

			<div className="mt-4 grid gap-4 lg:grid-cols-2">
				<div>
					<h3 className="text-lg font-semibold">Reponses super admin</h3>
					<div className="mt-3 space-y-3">
						{detail.responses.length ? detail.responses.map((response) => (
							<SoftPanel as="article" key={response.id} className="rounded-xl p-3">
								<p className="text-xs font-semibold text-primary-600">{formatUser(response.author)}</p>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary-800">{response.message}</p>
							</SoftPanel>
						)) : (
							<p className="text-sm text-neutral-600">Aucune réponse pour le moment.</p>
						)}
					</div>

					{permissions.canReply ? (
						<form className="mt-4 space-y-3" onSubmit={submitReply}>
							<FormField
								as="textarea"
								label="Repondre"
								minLength={1}
								name="incident-reply"
								onChange={(event) => setMessage(event.target.value)}
								required
								rows={4}
								value={message}
							/>
							<ActionButton
								type="submit"
								disabled={mutationLoading}
							>
								{mutationLoading ? 'Envoi...' : 'Envoyer la réponse'}
							</ActionButton>
						</form>
					) : null}
				</div>

				<div>
					<h3 className="text-lg font-semibold">Historique</h3>
					<div className="mt-3 space-y-3">
						{detail.history.map((event) => (
							<SoftPanel as="article" key={event.id} className="rounded-xl p-3 text-sm">
								<p className="font-semibold text-secondary-800">
									{event.previousStatus ? `${statusLabel[event.previousStatus]} -> ` : ''}
									{statusLabel[event.nextStatus] || event.nextStatus}
								</p>
								<p className="mt-1 text-neutral-600">{formatUser(event.actor)}</p>
								{event.commentaire ? <p className="mt-2 text-neutral-600">{event.commentaire}</p> : null}
							</SoftPanel>
						))}
					</div>

					{permissions.canChangeStatus ? (
						<form className="mt-4 space-y-3" onSubmit={submitStatus}>
							<FormField
								as="select"
								label="Changer le statut"
								name="incident-status"
								onChange={(event) => setStatus(event.target.value)}
								value={status}
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</FormField>
							<FormField
								as="textarea"
								label="Commentaire"
								name="incident-commentaire"
								onChange={(event) => setCommentaire(event.target.value)}
								rows={3}
								value={commentaire}
							/>
							<ActionButton
								type="submit"
								disabled={mutationLoading || status === ticket.status}
								variant="secondary"
							>
								{mutationLoading ? 'Mise à jour...' : 'Mettre à jour'}
							</ActionButton>
						</form>
					) : null}
				</div>
			</div>
		</SurfaceCard>
	);
}

function formatUser(user) {
	return [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || 'Utilisateur';
}
