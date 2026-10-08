import { useState, type FormEvent } from 'react';
import { ApiError } from '../services/apiClient';
import { createTicket } from '../services/ticketService';
import { PRIORITY_LABELS, TICKET_PRIORITIES, type CreateTicketInput } from '../types/ticket';
import { validateTicket, type TicketFormErrors } from '../utils/validateTicket';

const EMPTY_FORM: CreateTicketInput = { title: '', description: '', priority: 'medium' };

interface NewTicketFormProps {
  onCreated: () => void;
}

export function NewTicketForm({ onCreated }: NewTicketFormProps) {
  const [form, setForm] = useState<CreateTicketInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CreateTicketInput>(key: K, value: CreateTicketInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateTicket(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await createTicket({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        priority: form.priority,
      });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
        if (err.details) {
          setErrors({
            title: err.details.title?.[0],
            description: err.details.description?.[0],
            priority: err.details.priority?.[0],
          });
        }
      } else {
        setServerError('Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card ticket-form" onSubmit={handleSubmit} noValidate>
      <h2>New ticket</h2>

      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={!!errors.title}
          maxLength={100}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <label>
        <span>
          Description <span className="optional">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          aria-invalid={!!errors.description}
          maxLength={1000}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <label>
        Priority
        <select
          value={form.priority}
          onChange={(e) => update('priority', e.target.value as CreateTicketInput['priority'])}
          aria-invalid={!!errors.priority}
        >
          {TICKET_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
        {errors.priority && <span className="field-error">{errors.priority}</span>}
      </label>

      {serverError && (
        <p className="form-error" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create ticket'}
      </button>
    </form>
  );
}
