import { useEffect, useState } from 'react';
import { SurfaceCard } from '../../components/layout';
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
				Selectionnez un ticket pour consulter son historique et les reponses.
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
			<div className="flex flex-col gap-3 rounded-2xl bg-neutral-100 p-4 md:flex-row md:items-start md:justify-between">
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
			</div>

			<div className="mt-4 grid gap-4 lg:grid-cols-2">
				<div>
					<h3 className="text-lg font-semibold">Reponses super admin</h3>
					<div className="mt-3 space-y-3">
						{detail.responses.length ? detail.responses.map((response) => (
							<article key={response.id} className="rounded-xl bg-neutral-100 p-3">
								<p className="text-xs font-semibold text-primary-600">{formatUser(response.author)}</p>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary-800">{response.message}</p>
							</article>
						)) : (
							<p className="text-sm text-neutral-600">Aucune reponse pour le moment.</p>
						)}
					</div>

					{permissions.canReply ? (
						<form className="mt-4 space-y-3" onSubmit={submitReply}>
							<label className="block text-sm font-medium" htmlFor="incident-reply">Repondre</label>
							<textarea
								id="incident-reply"
								minLength={1}
								onChange={(event) => setMessage(event.target.value)}
								required
								rows={4}
								value={message}
								className="w-full resize-y rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
							/>
							<button
								type="submit"
								disabled={mutationLoading}
								className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-400"
							>
								{mutationLoading ? 'Envoi...' : 'Envoyer la reponse'}
							</button>
						</form>
					) : null}
				</div>

				<div>
					<h3 className="text-lg font-semibold">Historique</h3>
					<div className="mt-3 space-y-3">
						{detail.history.map((event) => (
							<article key={event.id} className="rounded-xl bg-neutral-100 p-3 text-sm">
								<p className="font-semibold text-secondary-800">
									{event.previousStatus ? `${statusLabel[event.previousStatus]} -> ` : ''}
									{statusLabel[event.nextStatus] || event.nextStatus}
								</p>
								<p className="mt-1 text-neutral-600">{formatUser(event.actor)}</p>
								{event.commentaire ? <p className="mt-2 text-neutral-600">{event.commentaire}</p> : null}
							</article>
						))}
					</div>

					{permissions.canChangeStatus ? (
						<form className="mt-4 space-y-3" onSubmit={submitStatus}>
							<label className="block text-sm font-medium" htmlFor="incident-status">Changer le statut</label>
							<select
								id="incident-status"
								onChange={(event) => setStatus(event.target.value)}
								value={status}
								className="w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
							<textarea
								onChange={(event) => setCommentaire(event.target.value)}
								placeholder="Commentaire interne visible dans l'historique"
								rows={3}
								value={commentaire}
								className="w-full resize-y rounded-xl bg-neutral-100 px-3 py-2 outline-none ring-primary-500/20 focus:ring"
							/>
							<button
								type="submit"
								disabled={mutationLoading || status === ticket.status}
								className="rounded-xl border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{mutationLoading ? 'Mise a jour...' : 'Mettre a jour'}
							</button>
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
