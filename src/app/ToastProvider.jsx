import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
	success: {
		accent: 'bg-emerald-500',
		body: 'border-emerald-200 bg-white text-secondary-900',
		icon: 'check_circle'
	},
	error: {
		accent: 'bg-red-500',
		body: 'border-red-200 bg-white text-secondary-900',
		icon: 'error'
	},
	info: {
		accent: 'bg-sky-500',
		body: 'border-sky-200 bg-white text-secondary-900',
		icon: 'info'
	}
};

function ToastViewport({ toasts, onDismiss }) {
	return (
		<div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-3">
			{toasts.map((toast) => {
				const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
				return (
					<div
						key={toast.id}
						className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-[0_18px_42px_rgba(29,52,34,.18)] ${style.body}`}
						role="status"
						aria-live="polite"
					>
						<div className={`h-1.5 w-full ${style.accent}`} />
						<div className="flex items-start gap-3 px-4 py-4">
							<div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${style.accent}`}>
								<span className="material-symbols-rounded text-xl">{style.icon}</span>
							</div>
							<div className="min-w-0 flex-1">
								{toast.title ? <p className="font-semibold text-secondary-900">{toast.title}</p> : null}
								<p className={`text-sm ${toast.title ? 'mt-1 text-secondary-700' : 'text-secondary-800'}`}>{toast.message}</p>
							</div>
							<button
								type="button"
								onClick={() => onDismiss(toast.id)}
								className="rounded-full p-1 text-secondary-400 transition hover:bg-neutral-100 hover:text-secondary-700"
								aria-label="Fermer la notification"
							>
								<span className="material-symbols-rounded text-lg">close</span>
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const dismissToast = useCallback((id) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(({ duration = 3600, message, title = '', type = 'info' }) => {
		if (!message) return null;
		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		setToasts((current) => [...current, { id, type, title, message }]);

		window.setTimeout(() => {
			setToasts((current) => current.filter((toast) => toast.id !== id));
		}, duration);

		return id;
	}, []);

	const value = useMemo(() => ({
		dismissToast,
		showToast,
		showSuccess(message, options = {}) {
			return showToast({ ...options, message, type: 'success' });
		},
		showError(message, options = {}) {
			return showToast({ ...options, message, type: 'error' });
		},
		showInfo(message, options = {}) {
			return showToast({ ...options, message, type: 'info' });
		}
	}), [dismissToast, showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastViewport toasts={toasts} onDismiss={dismissToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider.');
	}
	return context;
}
