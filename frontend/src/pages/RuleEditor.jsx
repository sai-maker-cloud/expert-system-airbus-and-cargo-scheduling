import React, { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { rulesApi } from '../utils/api';
import toast from 'react-hot-toast';

const categories = ['CREW','AIRCRAFT','CARGO','FLIGHT','SAFETY'];

function RuleModal({ rule, onClose, onSave }) {
  const [form, setForm] = useState({
    ruleName: rule?.ruleName || '',
    ruleCategory: rule?.ruleCategory || 'CREW',
    ruleKey: rule?.ruleKey || '',
    ruleValue: rule?.ruleValue || '',
    description: rule?.description || '',
    isActive: rule?.isActive !== undefined ? rule.isActive : true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      if (rule) await rulesApi.update(rule.id, form);
      else await rulesApi.create(form);
      toast.success(rule ? 'Rule updated' : 'Rule created');
      onSave();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{rule ? 'Edit Rule' : 'New Rule'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label className="form-label">Rule Name</label><input className="input" value={form.ruleName} onChange={e => set('ruleName', e.target.value)} /></div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="select" value={form.ruleCategory} onChange={e => set('ruleCategory', e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Rule Key</label><input className="input mono" value={form.ruleKey} onChange={e => set('ruleKey', e.target.value.toUpperCase())} placeholder="MAX_HOURS" /></div>
          </div>
          <div className="form-group"><label className="form-label">Rule Value</label><input className="input mono" value={form.ruleValue} onChange={e => set('ruleValue', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="textarea" value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            <label htmlFor="isActive" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Active</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save Rule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RuleEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await rulesApi.getAll(); setRules(r.data || []); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await rulesApi.toggle(id); load(); } catch (e) { toast.error(e.message); }
  };

  const deleteRule = async (id) => {
    if (!confirm('Delete rule?')) return;
    try { await rulesApi.delete(id); toast.success('Rule deleted'); load(); } catch (e) { toast.error(e.message); }
  };

  const filtered = rules.filter(r => !filterCat || r.ruleCategory === filterCat);

  const categoryColor = { CREW: 'var(--accent-cyan)', AIRCRAFT: 'var(--accent-blue)', CARGO: 'var(--accent-gold)', FLIGHT: 'var(--accent-green)', SAFETY: 'var(--accent-red)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Settings size={22} color="var(--accent-cyan)" /> Rule Editor</div>
          <div className="page-subtitle">Configure the AI Agent's decision rules and constraints</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={16} /> New Rule
        </button>
      </div>

      <div style={{
        padding: '1rem 1.25rem', background: 'rgba(0,128,255,0.06)',
        border: '1px solid rgba(0,128,255,0.2)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--text-secondary)',
      }}>
        <strong style={{ color: 'var(--accent-blue)' }}>⚙ Rule Engine:</strong> These rules are loaded dynamically by the AI Agent at runtime. Changes take effect immediately. The rule engine evaluates constraints for crew duty limits, aircraft maintenance buffers, cargo capacity thresholds, and priority scheduling windows.
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filterCat ? 'btn-cyan' : 'btn-ghost'}`} onClick={() => setFilterCat('')}>All ({rules.length})</button>
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-cyan' : 'btn-ghost'}`} onClick={() => setFilterCat(filterCat === c ? '' : c)}>
            {c} ({rules.filter(r => r.ruleCategory === c).length})
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Rule Name</th><th>Category</th><th>Key</th><th>Value</th><th>Description</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="loading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading rules...</td></tr>
            : filtered.map(r => (
              <tr key={r.id} style={{ opacity: r.isActive ? 1 : 0.5 }}>
                <td style={{ fontWeight: 500 }}>{r.ruleName}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: categoryColor[r.ruleCategory], background: `${categoryColor[r.ruleCategory]}22`, padding: '2px 8px', borderRadius: 4 }}>
                    {r.ruleCategory}
                  </span>
                </td>
                <td><span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{r.ruleKey}</span></td>
                <td><span className="mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.ruleValue}</span></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.description}</td>
                <td>
                  <button onClick={() => toggle(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.isActive ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {r.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(r); setShowModal(true); }}><Edit3 size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteRule(r.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <RuleModal rule={editItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
