import { useId, useState } from 'react';

export default function FormField({
  as = 'input',
  autoComplete,
  children,
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
  placeholder,
  required = false,
  rows,
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
  const FieldComponent = as;
  const inputType = isPassword && toggleVisibility && isVisible ? 'text' : type;
  const fieldClassName = `w-full rounded-xl bg-neutral-100 px-3 text-sm text-secondary-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-200 ${
    as === 'textarea' ? 'min-h-28 resize-y py-2' : 'h-11'
  } ${
    toggleVisibility ? 'pr-11' : ''
  } ${
    error
      ? 'ring-1 ring-red-300 focus:ring-red-100'
      : 'focus:bg-neutral-50 focus:ring-primary-100'
  }`;

  const fieldProps = {
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : 'false',
    autoComplete,
    className: fieldClassName,
    id: inputId,
    inputMode,
    maxLength,
    minLength,
    name,
    onBlur,
    onChange,
    pattern,
    placeholder,
    required,
    value,
  };

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-medium text-secondary-700">{label}</span>
      <span className="relative block">
        {as === 'input' ? (
          <input {...fieldProps} type={inputType} />
        ) : (
          <FieldComponent {...fieldProps} {...(as === 'textarea' ? { rows } : {})}>
            {children}
          </FieldComponent>
        )}
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
