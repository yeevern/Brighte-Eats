import { useEffect, useState, type FormEvent } from 'react';
import './App.css';
import { createLead, listLeads, type Lead, type LeadPayload } from './api';

type FormState = LeadPayload;

type FieldErrors = Partial<Record<keyof LeadPayload | 'services', string>>;

const initialForm: FormState = {
  name: '',
  email: '',
  mobile: '',
  postcode: '',
  services: [],
};

const serviceOptions = ['delivery', 'pick-up', 'payment'] as const;
type ServiceFilterValue = (typeof serviceOptions)[number] | '';

function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceFilterValue>('');

  const loadLeads = async (service: ServiceFilterValue = '') => {
    setIsLoadingLeads(true);
    try {
      const data = await listLeads(service || undefined);
      setLeads(data);
    } catch {
      setStatusMessage('Could not load leads right now.');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    void loadLeads(selectedService);
  }, [selectedService]);

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile = 'Mobile is required';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      nextErrors.mobile = 'Mobile must be 10 digits';
    }

    if (!form.postcode.trim()) {
      nextErrors.postcode = 'Postcode is required';
    } else if (!/^\d{4}$/.test(form.postcode)) {
      nextErrors.postcode = 'Postcode must be 4 digits';
    }

    if (form.services.length === 0) {
      nextErrors.services = 'Select at least one service';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatusMessage('');
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createLead(form);
      setStatusMessage('Thanks! Your expression of interest was saved.');
      setForm(initialForm);
      setErrors({});
      await loadLeads(selectedService);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (service: string) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <p className="eyebrow">Brighte Eats</p>
        <h1>Register your interest</h1>
        <p>Tell us which services you want to hear about and we will keep you posted.</p>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Interest form</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Jane Smith"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="jane@example.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label>
              Mobile
              <input
                value={form.mobile}
                onChange={(event) => setForm({ ...form, mobile: event.target.value })}
                placeholder="0412345678"
              />
              {errors.mobile && <span className="field-error">{errors.mobile}</span>}
            </label>

            <label>
              Postcode
              <input
                value={form.postcode}
                onChange={(event) => setForm({ ...form, postcode: event.target.value })}
                placeholder="2000"
              />
              {errors.postcode && <span className="field-error">{errors.postcode}</span>}
            </label>

            <fieldset>
              <legend>Services</legend>
              <div className="checkbox-grid">
                {serviceOptions.map((service) => (
                  <label key={service} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={form.services.includes(service)}
                      onChange={() => toggleService(service)}
                    />
                    {service}
                  </label>
                ))}
              </div>
              {errors.services && <span className="field-error">{errors.services}</span>}
            </fieldset>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Submit interest'}
            </button>

            {statusMessage && <p className="status-message">{statusMessage}</p>}
          </form>
        </section>

        <section className="panel">
         <div className="panel-header">
           <div>
             <h2>Current leads</h2>
             <p className="panel-subtitle">
               {leads.length} lead{leads.length === 1 ? '' : 's'} visible
             </p>
           </div>
           <label className="filter-control">
             <span>Filter by service</span>
             <select
               value={selectedService}
               onChange={(event) => setSelectedService(event.target.value as ServiceFilterValue)}
             >
               <option value="">All services</option>
               {serviceOptions.map((service) => (
                 <option key={service} value={service}>
                   {service}
                 </option>
               ))}
             </select>
           </label>
         </div>

         {isLoadingLeads ? (
           <p className="empty-state">Loading leads…</p>
         ) : leads.length === 0 ? (
           <p className="empty-state">No leads match this filter yet.</p>
         ) : (
           <ul className="lead-list">
             {leads.map((lead) => (
               <li key={lead.id} className="lead-item">
                 <div className="lead-top">
                   <strong>{lead.name}</strong>
                   <span className="lead-chip">{lead.postcode}</span>
                 </div>
                 <span>{lead.email}</span>
                 <div className="service-badges">
                   {lead.services.map((service) => (
                     <span key={service} className="service-badge">
                       {service}
                     </span>
                   ))}
                 </div>
               </li>
             ))}
           </ul>
         )}
        </section>
      </main>
    </div>
  );
}

export default App;
