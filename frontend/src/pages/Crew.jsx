import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Trash2, Edit3 } from 'lucide-react';
import { crewApi } from '../utils/api';
import toast from 'react-hot-toast';

const roles = ['PILOT','CO_PILOT','FLIGHT_ENGINEER','FLIGHT_ATTENDANT','PURSER'];
const statuses = ['AVAILABLE','ON_DUTY','OFF_DUTY','ON_LEAVE'];

function CrewModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    employeeId: member?.employeeId || '',
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    role: member?.role || 'PILOT',
    licenseNumber: member?.licenseNumber || '',
    licenseExpiry: member?.licenseExpiry || '',
    baseStation: member?.baseStation || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      if (member) await crewApi.update(member.id, form);
      else await crewApi.create(form);
      toast.success(member ? 'Crew updated' : 'Crew member created');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  const needsLicense = form.role === 'PILOT' || form.role === 'CO_PILOT' || form.role === 'FLIGHT_ENGINEER';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{member ? 'Edit Crew Member' : 'New Crew Member'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Employee ID</label><input className="input" value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="EMP001" /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="select" value={form.role} onChange={e => set('role', e.target.value)}>
                {roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">First Name</label><input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Base Station (IATA code)</label><input className="input" value={form.baseStation} onChange={e => set('baseStation', e.target.value.toUpperCase())} placeholder="BOM" maxLength={10} /></div>
          {needsLicense && (
            <div className="grid-2">
              <div className="form-group"><label className="form-label">License Number</label><input className="input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">License Expiry</label><input className="input" type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} /></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Crew() {
  const [crew, setCrew] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await crewApi.getAll(); setCrew(r.data || []); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteItem = async (id) => {
    if (!confirm('Delete crew member?')) return;
    try { await crewApi.delete(id); toast.success('Crew member deleted'); load(); } catch (e) { toast.error(e.message); }
  };

  const updateStatus = async (id, status) => {
    try { await crewApi.updateStatus(id, status); toast.success('Status updated'); load(); } catch (e) { toast.error(e.message); }
  };

  const filtered = crew.filter(c =>
    (c.fullName.toLowerCase().includes(search.toLowerCase()) || c.employeeId.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || c.role === roleFilter) &&
    (!statusFilter || c.status === statusFilter)
  );

  const available = crew.filter(c => c.status === 'AVAILABLE').length;
  const onDuty = crew.filter(c => c.status === 'ON_DUTY').length;
  const pilots = crew.filter(c => c.role === 'PILOT').length;
  const totalHours = crew.reduce((sum, c) => sum + (c.totalHoursFlown || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Users size={22} color="var(--accent-cyan)" /> Crew Management</div>
          <div className="page-subtitle">{crew.length} total crew members</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={16} /> Add Crew
        </button>
      </div>

      <div className="grid-4">
        <div className="stat-card green"><div className="stat-label">Available</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>{available}</div></div>
        <div className="stat-card blue"><div className="stat-label">On Duty</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }}>{onDuty}</div></div>
        <div className="stat-card cyan"><div className="stat-label">Pilots</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>{pilots}</div></div>
        <div className="stat-card gold"><div className="stat-label">Total Flight Hours</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>{Math.round(totalHours).toLocaleString()}</div></div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search className="search-icon" size={16} />
          <input className="input" placeholder="Search crew..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Employee ID</th><th>Name</th><th>Role</th><th>Base</th><th>Hours Today</th><th>Total Hours</th><th>License Expiry</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="loading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            : filtered.map(c => {
              const licenseExpired = c.licenseExpiry && new Date(c.licenseExpiry) < new Date();
              const licenseExpiringSoon = c.licenseExpiry && !licenseExpired && (new Date(c.licenseExpiry) - new Date()) < 30 * 86400000;
              return (
                <tr key={c.id}>
                  <td><span className="mono" style={{ color: 'var(--accent-cyan)' }}>{c.employeeId}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.fullName}</td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.role.replace(/_/g,' ')}</span></td>
                  <td><span className="mono" style={{ color: 'var(--text-secondary)' }}>{c.baseStation}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span className="mono" style={{ fontSize: '0.85rem' }}>{c.hoursFlownToday?.toFixed(1)}h</span>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${Math.min((c.hoursFlownToday/8)*100, 100)}%`, background: c.hoursFlownToday >= 7 ? 'var(--accent-red)' : c.hoursFlownToday >= 5 ? 'var(--accent-gold)' : 'var(--accent-green)' }} />
                      </div>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.totalHoursFlown?.toFixed(0)}h</span></td>
                  <td>
                    {c.licenseExpiry ? (
                      <span style={{ fontSize: '0.8rem', color: licenseExpired ? 'var(--accent-red)' : licenseExpiringSoon ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                        {licenseExpired ? '⚠ EXPIRED' : c.licenseExpiry}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>}
                  </td>
                  <td>
                    <select className="select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }} value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
                      {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(c); setShowModal(true); }}><Edit3 size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteItem(c.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <CrewModal member={editItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
