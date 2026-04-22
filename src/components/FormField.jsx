import { useId, useState } from 'react';

export default function FormField({
  autoComplete,
  error,
  help,
  inputMode,
  label,
  maxLength,
  minLength,
  name,
  onBlur,
  onChange,
  pattern,
  required = false,
  toggleVisibility = false,
  type = 'text',
  value,
}) {
  const generatedId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const inputId = name || generatedId;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  const isPassword = type === 'password';
  const inputType = isPassword && toggleVisibility && isVisible ? 'text' : type;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-medium text-secondary-700">{label}</span>
      <span className="relative block">
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          autoComplete={autoComplete}
          className={`h-11 w-full rounded-xl bg-neutral-100 px-3 text-sm text-secondary-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-200 ${
            toggleVisibility ? 'pr-11' : ''
          } ${
            error
              ? 'ring-1 ring-red-300 focus:ring-red-100'
              : 'focus:bg-neutral-50 focus:ring-primary-100'
          }`}
          id={inputId}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          pattern={pattern}
          required={required}
          type={inputType}
          value={value}
        />
        {isPassword && toggleVisibility ? (
          <button
            aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 transition hover:text-secondary-800"
            onClick={() => setIsVisible((current) => !current)}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-rounded text-xl">
              {isVisible ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        ) : null}
      </span>
      {help ? <span className="mt-1 block text-xs text-neutral-500" id={helpId}>{help}</span> : null}
      {error ? <span className="mt-1 block text-sm text-red-700" id={errorId}>{error}</span> : null}
    </label>
  );
}
