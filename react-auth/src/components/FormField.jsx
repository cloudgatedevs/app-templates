/** @param {{ id?: string; label: string; type?: string; value: string; onChange: (e: import('react').ChangeEvent<HTMLInputElement>) => void; onBlur?: (e: import('react').FocusEvent<HTMLInputElement>) => void; error?: string; placeholder?: string; autoComplete?: string; required?: boolean }} props */
export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  required,
}) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={fieldId} className="form-label">
        {label}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`form-control ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
