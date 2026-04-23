import { useEffect, useId, useRef, useState } from 'react';
import { fetchAddressSuggestions } from '../../services/address-client.js';

export default function AddressAutocompleteInput({
	className = '',
	disabled = false,
	error = '',
	id,
	name,
	onAddressChange,
	onSuggestionSelect,
	placeholder = '',
	value = ''
}) {
	const generatedId = useId();
	const inputId = id || name || generatedId;
	const containerRef = useRef(null);
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if (disabled || !focused) {
			setSuggestions([]);
			setOpen(false);
			return undefined;
		}

		const normalizedValue = String(value || '').trim();
		if (normalizedValue.length < 3) {
			setSuggestions([]);
			setOpen(false);
			return undefined;
		}

		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setLoading(true);
			try {
				const results = await fetchAddressSuggestions(normalizedValue, {
					limit: 5,
					signal: controller.signal
				});
				setSuggestions(results);
				setOpen(true);
			} catch (errorCaught) {
				if (errorCaught?.name !== 'AbortError') {
					setSuggestions([]);
					setOpen(false);
				}
			} finally {
				setLoading(false);
			}
		}, 180);

		return () => {
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [disabled, focused, value]);

	useEffect(() => {
		function handlePointerDown(event) {
			if (!containerRef.current?.contains(event.target)) {
				setOpen(false);
			}
		}

		document.addEventListener('mousedown', handlePointerDown);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
		};
	}, []);

	return (
		<div className="relative" ref={containerRef}>
			<input
				id={inputId}
				name={name}
				type="text"
				value={value}
				disabled={disabled}
				onChange={(event) => {
					onAddressChange?.(event.target.value);
				}}
				onFocus={() => {
					setFocused(true);
					if (suggestions.length) setOpen(true);
				}}
				onBlur={() => {
					setFocused(false);
				}}
				placeholder={placeholder}
				autoComplete="street-address"
				aria-invalid={error ? 'true' : 'false'}
				className={className}
			/>

			{loading ? (
				<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-secondary-500">
					Recherche...
				</div>
			) : null}

			{open && suggestions.length ? (
				<div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-2 shadow-[0_18px_32px_rgba(29,52,34,.12)]">
					{suggestions.map((suggestion) => (
						<button
							key={`${suggestion.label}-${suggestion.code_postal}`}
							type="button"
							className="block w-full px-4 py-3 text-left transition hover:bg-neutral-50"
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => {
								onSuggestionSelect?.(suggestion);
								setOpen(false);
							}}
						>
							<p className="text-sm font-semibold text-secondary-900">{suggestion.adresse_ligne}</p>
							<p className="mt-1 text-sm text-secondary-600">{suggestion.code_postal} {suggestion.ville}</p>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
