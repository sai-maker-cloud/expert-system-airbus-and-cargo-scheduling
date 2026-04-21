import React, { useEffect, useState } from 'react';
import { PlaneTakeoff, Plus, Search, Trash2, Plane, Users, Edit3, X } from 'lucide-react';
import { flightApi, aircraftApi, crewApi } from '../utils/api';
import toast from 'react-hot-toast';

const statusOptions = ['SCHEDULED','BOARDING','IN_FLIGHT','LANDED','DELAYED','CANCELLED'];

function FlightModal({ flight, aircraft, crew, onClose, onSave }) {
  const [form, setForm] = useState({
    flightNumber: flight?.flightNumber || '',
    origin: flight?.origin || '',
    destination: flight?.destination || '',
    departureTime: flight?.departureTime ? flight.departureTime.slice(0,16) : '',
    arrivalTime: flight?.arrivalTime ? flight.arrivalTime.slice(0,16) : '',
    distanceKm: flight?.distanceKm || '',
    aircraftId: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      const payload = { ...form, distanceKm: Number(form.distanceKm), aircraftId: form.aircraftId ? Number(form.aircraftId) : null };
      if (flight) await flightApi.update(flight.id, payload);
      else await flightApi.create(payload);
      toast.success(flight ? 'Flight updated' : 'Flight created');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{flight ? 'Edit Flight' : 'New Flight'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Flight Number</label><input className="input" value={form.flightNumber} onChange={e => set('flightNumber', e.target.value)} placeholder="AI-101" /></div>
            <div className="form-group"><label className="form-label">Distance (km)</label><input className="input" type="number" value={form.distanceKm} onChange={e => set('distanceKm', e.target.value)} placeholder="1148" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Origin</label><input className="input" value={form.origin} onChange={e => set('origin', e.target.value.toUpperCase())} placeholder="BOM" maxLength={10} /></div>
            <div className="form-group"><label className="form-label">Destination</label><input className="input" value={form.destination} onChange={e => set('destination', e.target.value.toUpperCase())} placeholder="DEL" maxLength={10} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Departure</label><input className="input" type="datetime-local" value={form.departureTime} onChange={e => set('departureTime', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Arrival</label><input className="input" type="datetime-local" value={form.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} /></div>
          </div>
          {!flight && (
            <div className="form-group">
              <label className="form-label">Aircraft (optional)</label>
              <select className="select" value={form.aircraftId} onChange={e => set('aircraftId', e.target.value)}>
                <option value="">— Select aircraft —</option>
                {aircraft.filter(a => a.status === 'AVAILABLE').map(a => (
                  <option key={a.id} value={a.id}>{a.registrationNumber} — {a.model}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save Flight</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignModal({ flight, aircraft, crew, onClose, onSave }) {
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [selectedCrew, setSelectedCrew] = useState('');

  const assignAircraft = async () => {
    if (!selectedAircraft) return;
    try {
      await flightApi.assignAircraft(flight.id, selectedAircraft);
      toast.success('Aircraft assigned');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  const assignCrew = async () => {
    if (!selectedCrew) return;
    try {
      await flightApi.assignCrew(flight.id, selectedCrew);
      toast.success('Crew assigned');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  const removeCrew = async (crewId) => {
    try {
      await flightApi.removeCrew(flight.id, crewId);
      toast.success('Crew removed');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  const availableCrew = crew.filter(c => c.status === 'AVAILABLE' && !flight.crewMembers?.find(fc => fc.id === c.id));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-title">Manage Assignments — <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{flight.flightNumber}</span></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plane size={15} color="var(--accent-cyan)" /> Aircraft Assignment
            </div>
            {flight.aircraft ? (
              <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', borderRadius: 10, border: '2px solid rgba(16,185,129,0.25)', fontSize: '0.875rem', fontWeight: 600 }}>
                ✓ {flight.aircraft.registrationNumber} — {flight.aircraft.model}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="select" value={selectedAircraft} onChange={e => setSelectedAircraft(e.target.value)}>
                  <option value="">— Select aircraft —</option>
                  {aircraft.filter(a => a.status === 'AVAILABLE').map(a => (
                    <option key={a.id} value={a.id}>{a.registrationNumber} — {a.model} ({a.maxCargoWeight}kg cap)</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={assignAircraft}>Assign</button>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={15} color="var(--accent-cyan)" /> Crew Members ({flight.crewMembers?.length || 0} assigned)
            </div>
            {flight.crewMembers?.length > 0 && (
              <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {flight.crewMembers.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 6 }}>
                    <span style={{ fontSize: '0.875rem' }}>{c.fullName} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({c.role})</span></span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeCrew(c.id)}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="select" value={selectedCrew} onChange={e => setSelectedCrew(e.target.value)}>
                <option value="">— Add crew member —</option>
                {availableCrew.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} — {c.role} ({c.hoursFlownToday}h today)</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={assignCrew}>Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [crew, setCrew] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFlight, setEditFlight] = useState(null);
  const [assignFlight, setAssignFlight] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [f, a, c] = await Promise.all([flightApi.getAll(), aircraftApi.getAll(), crewApi.getAll()]);
      setFlights(f.data || []);
      setAircraft(a.data || []);
      setCrew(c.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteFlight = async (id) => {
    if (!confirm('Delete this flight?')) return;
    try { await flightApi.delete(id); toast.success('Flight deleted'); load(); } catch (e) { toast.error(e.message); }
  };

  const updateStatus = async (id, status) => {
    try { await flightApi.updateStatus(id, status); toast.success('Status updated'); load(); } catch (e) { toast.error(e.message); }
  };

  const filtered = flights.filter(f =>
    (f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
     f.origin.toLowerCase().includes(search.toLowerCase()) ||
     f.destination.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || f.status === statusFilter)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><PlaneTakeoff size={22} /> Flights</div>
          <div className="page-subtitle">{flights.length} flights · {flights.filter(f => f.status === 'SCHEDULED').length} scheduled</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditFlight(null); setShowModal(true); }}>
          <Plus size={16} /> New Flight
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search className="search-icon" size={16} />
          <input className="input" placeholder="Search flights..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state loading">Loading flights...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Flight</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Aircraft</th>
                <th>Crew</th><th>Cargo (kg)</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No flights found</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} style={{ opacity: f.status === 'CANCELLED' ? 0.5 : 1 }}>
                  <td><span className="mono" style={{ color: '#4f6ef7', fontWeight: 700, background: '#e8edff', padding: '2px 8px', borderRadius: 6 }}>{f.flightNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <span style={{ color: '#1e293b', fontSize: '0.85rem' }}>{f.origin}</span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                      <span style={{ color: '#1e293b', fontSize: '0.85rem' }}>{f.destination}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{f.distanceKm} km</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(f.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(f.arrivalTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>
                    {f.aircraft ? (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{f.aircraft.registrationNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{f.aircraft.model}</div>
                      </div>
                    ) : <span style={{ color: '#f43f5e', fontSize: '0.8rem', fontWeight: 700 }}>⚠ Unassigned</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{f.crewCount || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>members</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{Math.round(f.totalCargoWeight || 0)}</div>
                    {f.aircraft && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(f.availableCargoCapacity)} avail.</div>}
                  </td>
                  <td><span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAssignFlight(f)} title="Manage assignments">
                        <Users size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditFlight(f); setShowModal(true); }} title="Edit">
                        <Edit3 size={13} />
                      </button>
                      <select
                        className="select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                        value={f.status}
                        onChange={e => updateStatus(f.id, e.target.value)}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteFlight(f.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <FlightModal flight={editFlight} aircraft={aircraft} crew={crew} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
      {assignFlight && (
        <AssignModal
          flight={assignFlight}
          aircraft={aircraft}
          crew={crew}
          onClose={() => setAssignFlight(null)}
          onSave={async () => {
            const updated = await flightApi.getById(assignFlight.id);
            setAssignFlight(updated.data);
            load();
          }}
        />
      )}
    </div>
  );
}
