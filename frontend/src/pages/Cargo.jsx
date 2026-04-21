import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Trash2, Edit3, Link } from 'lucide-react';
import { cargoApi, flightApi } from '../utils/api';
import toast from 'react-hot-toast';

const priorities = ['LOW','MEDIUM','HIGH','CRITICAL'];
const statuses = ['PENDING','ASSIGNED','IN_TRANSIT','DELIVERED','SPLIT'];

function CargoModal({ cargo, onClose, onSave }) {
  const [form, setForm] = useState({
    description: cargo?.description || '',
    weight: cargo?.weight || '',
    volume: cargo?.volume || '',
    origin: cargo?.origin || '',
    destination: cargo?.destination || '',
    priority: cargo?.priority || 'MEDIUM',
    customerName: cargo?.customerName || '',
    customerContact: cargo?.customerContact || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      const payload = { ...form, weight: Number(form.weight), volume: Number(form.volume) };
      if (cargo) await cargoApi.update(cargo.id, payload);
      else await cargoApi.create(payload);
      toast.success(cargo ? 'Cargo updated' : 'Cargo created');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{cargo ? 'Edit Cargo' : 'New Cargo'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label className="form-label">Description</label><input className="input" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Weight (kg)</label><input className="input" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Volume (m³)</label><input className="input" type="number" step="0.1" value={form.volume} onChange={e => set('volume', e.target.value)} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Origin</label><input className="input" value={form.origin} onChange={e => set('origin', e.target.value.toUpperCase())} placeholder="BOM" /></div>
            <div className="form-group"><label className="form-label">Destination</label><input className="input" value={form.destination} onChange={e => set('destination', e.target.value.toUpperCase())} placeholder="DEL" /></div>
          </div>
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Customer Name</label><input className="input" value={form.customerName} onChange={e => set('customerName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Customer Contact</label><input className="input" value={form.customerContact} onChange={e => set('customerContact', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignCargoModal({ cargo, flights, onClose, onSave }) {
  const [selectedFlight, setSelectedFlight] = useState('');
  const matchingFlights = flights.filter(f => f.destination === cargo.destination && f.status === 'SCHEDULED' && f.aircraft);

  const assign = async () => {
    if (!selectedFlight) return;
    try {
      await cargoApi.assignToFlight(cargo.id, selectedFlight);
      toast.success('Cargo assigned to flight');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Assign Cargo to Flight</div>
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f0f4ff', borderRadius: 12, border: '2px solid rgba(79,110,247,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cargo</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cargo.trackingNumber}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{cargo.weight}kg · {cargo.volume}m³ · To: {cargo.destination}</div>
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Select Flight to {cargo.destination}</label>
          {matchingFlights.length === 0 ? (
            <div style={{ color: '#f43f5e', fontSize: '0.875rem', padding: '0.5rem', fontWeight: 600 }}>
              No available flights to {cargo.destination} with aircraft assigned
            </div>
          ) : (
            <select className="select" value={selectedFlight} onChange={e => setSelectedFlight(e.target.value)}>
              <option value="">— Select flight —</option>
              {matchingFlights.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} · Dep: {new Date(f.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} · Cap: {Math.round(f.availableCargoCapacity)}kg avail
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={assign} disabled={!selectedFlight}>Assign</button>
        </div>
      </div>
    </div>
  );
}

export default function Cargo() {
  const [cargo, setCargo] = useState([]);
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [assignItem, setAssignItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([cargoApi.getAll(), flightApi.getAll()]);
      setCargo(c.data || []);
      setFlights(f.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteItem = async (id) => {
    if (!confirm('Delete cargo?')) return;
    try { await cargoApi.delete(id); toast.success('Cargo deleted'); load(); } catch (e) { toast.error(e.message); }
  };

  const unassign = async (id) => {
    try { await cargoApi.unassign(id); toast.success('Cargo unassigned'); load(); } catch (e) { toast.error(e.message); }
  };

  const filtered = cargo.filter(c =>
    (c.trackingNumber.toLowerCase().includes(search.toLowerCase()) || (c.customerName || '').toLowerCase().includes(search.toLowerCase()) || c.destination.toLowerCase().includes(search.toLowerCase())) &&
    (!priorityFilter || c.priority === priorityFilter) &&
    (!statusFilter || c.status === statusFilter)
  );

  const totalWeight = cargo.reduce((sum, c) => sum + c.weight, 0);
  const pending = cargo.filter(c => c.status === 'PENDING').length;
  const highPriority = cargo.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Package size={22} /> Cargo Management</div>
          <div className="page-subtitle">{cargo.length} shipments · {totalWeight.toFixed(0)}kg total</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={16} /> Add Cargo
        </button>
      </div>

      <div className="grid-4">
        <div className="stat-card cyan"><div className="stat-label">Total Shipments</div><div className="stat-value" style={{ fontSize: '1.5rem', color: '#0ea5e9' }}>{cargo.length}</div></div>
        <div className="stat-card gold"><div className="stat-label">Pending</div><div className="stat-value" style={{ fontSize: '1.5rem', color: '#f59e0b' }}>{pending}</div></div>
        <div className="stat-card red"><div className="stat-label">High Priority</div><div className="stat-value" style={{ fontSize: '1.5rem', color: '#f43f5e' }}>{highPriority}</div></div>
        <div className="stat-card blue"><div className="stat-label">Total Weight</div><div className="stat-value" style={{ fontSize: '1.5rem', color: '#4f6ef7' }}>{(totalWeight/1000).toFixed(1)}t</div></div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search className="search-icon" size={16} />
          <input className="input" placeholder="Search by tracking, customer, destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Tracking #</th><th>Description</th><th>Route</th><th>Weight</th><th>Priority</th><th>Flight</th><th>Customer</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="loading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            : filtered.map(c => (
              <tr key={c.id}>
                <td><span className="mono" style={{ color: '#4f6ef7', fontWeight: 700, background: '#e8edff', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem' }}>{c.trackingNumber}</span></td>
                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 600 }}>{c.description || '—'}</td>
                <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>{c.origin} → {c.destination}</td>
                <td><span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.weight.toLocaleString()}kg</span></td>
                <td><span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                <td>
                  {c.flightNumber ? (
                    <span className="mono" style={{ color: '#4f6ef7', fontSize: '0.8rem', fontWeight: 700, background: '#e8edff', padding: '2px 8px', borderRadius: 6 }}>{c.flightNumber}</span>
                  ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>Unassigned</span>}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.customerName || '—'}</td>
                <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {c.status === 'PENDING' && (
                      <button className="btn btn-cyan btn-sm" onClick={() => setAssignItem(c)} title="Assign to flight">
                        <Link size={13} />
                      </button>
                    )}
                    {c.status === 'ASSIGNED' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => unassign(c.id)} title="Unassign">
                        <Link size={13} style={{ opacity: 0.5 }} />
                      </button>
                    )}
                    {c.status === 'PENDING' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(c); setShowModal(true); }}><Edit3 size={13} /></button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteItem(c.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <CargoModal cargo={editItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
      {assignItem && <AssignCargoModal cargo={assignItem} flights={flights} onClose={() => setAssignItem(null)} onSave={() => { setAssignItem(null); load(); }} />}
    </div>
  );
}
