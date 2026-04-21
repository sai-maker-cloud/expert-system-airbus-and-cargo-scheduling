import React, { useEffect, useState } from 'react';
import { Plane, Plus, Search, Trash2, Edit3 } from 'lucide-react';
import { aircraftApi } from '../utils/api';
import toast from 'react-hot-toast';

const statusOptions = ['AVAILABLE','IN_FLIGHT','MAINTENANCE','RETIRED'];

function AircraftModal({ aircraft, onClose, onSave }) {
  const [form, setForm] = useState({
    registrationNumber: aircraft?.registrationNumber || '',
    model: aircraft?.model || '',
    maxCargoWeight: aircraft?.maxCargoWeight || '',
    maxCargoVolume: aircraft?.maxCargoVolume || '',
    passengerCapacity: aircraft?.passengerCapacity || '',
    fuelEfficiency: aircraft?.fuelEfficiency || '',
    lastMaintenanceDate: aircraft?.lastMaintenanceDate || '',
    nextMaintenanceDate: aircraft?.nextMaintenanceDate || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      const payload = {
        ...form,
        maxCargoWeight: Number(form.maxCargoWeight),
        maxCargoVolume: Number(form.maxCargoVolume),
        passengerCapacity: Number(form.passengerCapacity),
        fuelEfficiency: Number(form.fuelEfficiency),
      };
      if (aircraft) await aircraftApi.update(aircraft.id, payload);
      else await aircraftApi.create(payload);
      toast.success(aircraft ? 'Aircraft updated' : 'Aircraft created');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{aircraft ? 'Edit Aircraft' : 'New Aircraft'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Registration No.</label><input className="input" value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} placeholder="VT-AIR101" /></div>
            <div className="form-group"><label className="form-label">Model</label><input className="input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Boeing 737-800" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Max Cargo Weight (kg)</label><input className="input" type="number" value={form.maxCargoWeight} onChange={e => set('maxCargoWeight', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Max Cargo Volume (m³)</label><input className="input" type="number" value={form.maxCargoVolume} onChange={e => set('maxCargoVolume', e.target.value)} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Passenger Capacity</label><input className="input" type="number" value={form.passengerCapacity} onChange={e => set('passengerCapacity', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Fuel Efficiency (km/L)</label><input className="input" type="number" step="0.1" value={form.fuelEfficiency} onChange={e => set('fuelEfficiency', e.target.value)} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Last Maintenance</label><input className="input" type="date" value={form.lastMaintenanceDate} onChange={e => set('lastMaintenanceDate', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Next Maintenance</label><input className="input" type="date" value={form.nextMaintenanceDate} onChange={e => set('nextMaintenanceDate', e.target.value)} /></div>
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

export default function Aircraft() {
  const [aircraft, setAircraft] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await aircraftApi.getAll(); setAircraft(r.data || []); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteItem = async (id) => {
    if (!confirm('Delete aircraft?')) return;
    try { await aircraftApi.delete(id); toast.success('Aircraft deleted'); load(); } catch (e) { toast.error(e.message); }
  };

  const updateStatus = async (id, status) => {
    try { await aircraftApi.updateStatus(id, status); toast.success('Status updated'); load(); } catch (e) { toast.error(e.message); }
  };

  const filtered = aircraft.filter(a =>
    (a.registrationNumber.toLowerCase().includes(search.toLowerCase()) || a.model.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || a.status === statusFilter)
  );

  const stats = { AVAILABLE: 0, IN_FLIGHT: 0, MAINTENANCE: 0, RETIRED: 0 };
  aircraft.forEach(a => stats[a.status]++);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Plane size={22} /> Aircraft Fleet</div>
          <div className="page-subtitle">{aircraft.length} aircraft registered</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={16} /> Add Aircraft
        </button>
      </div>

      <div className="grid-4">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className={`stat-card ${status === 'AVAILABLE' ? 'green' : status === 'IN_FLIGHT' ? 'blue' : status === 'MAINTENANCE' ? 'gold' : 'red'}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(statusFilter === status ? '' : status)}>
            <div className="stat-label">{status.replace('_', ' ')}</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: status === 'AVAILABLE' ? '#10b981' : status === 'IN_FLIGHT' ? '#4f6ef7' : status === 'MAINTENANCE' ? '#f59e0b' : '#f43f5e' }}>{count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search className="search-icon" size={16} />
          <input className="input" placeholder="Search by registration or model..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Registration</th><th>Model</th><th>Cargo Cap.</th><th>Volume Cap.</th><th>Passengers</th><th>Fuel Eff.</th><th>Next Maint.</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }} className="loading">Loading...</td></tr>
            : filtered.map(a => (
              <tr key={a.id}>
                <td><span className="mono" style={{ color: '#4f6ef7', fontWeight: 700, background: '#e8edff', padding: '2px 8px', borderRadius: 6 }}>{a.registrationNumber}</span></td>
                <td style={{ fontWeight: 600 }}>{a.model}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{a.maxCargoWeight.toLocaleString()} kg</td>
                <td className="mono" style={{ fontWeight: 600 }}>{a.maxCargoVolume} m³</td>
                <td className="mono" style={{ fontWeight: 600 }}>{a.passengerCapacity}</td>
                <td><span style={{ color: a.fuelEfficiency > 9 ? '#10b981' : '#1e293b', fontWeight: 600 }}>{a.fuelEfficiency} km/L</span></td>
                <td style={{ fontSize: '0.8rem', color: a.nextMaintenanceDate ? '#475569' : '#94a3b8', fontWeight: 500 }}>{a.nextMaintenanceDate || 'N/A'}</td>
                <td>
                  <select className="select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }} value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(a); setShowModal(true); }}><Edit3 size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteItem(a.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <AircraftModal aircraft={editItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
