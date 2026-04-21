import React, { useEffect, useState } from 'react';
import { Bot, Zap, AlertTriangle, TrendingUp, Package, Users, Plane, CheckCircle, XCircle, Clock } from 'lucide-react';
import { agentApi, flightApi } from '../utils/api';
import toast from 'react-hot-toast';

function SuggestionCard({ suggestion, index }) {
  const score = Math.round((suggestion.confidenceScore || 0) * 100);
  return (
    <div className="agent-card" style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,212,255,0.15)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{index + 1}</div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{suggestion.suggestion}</span>
        </div>
        {score > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div className="progress-bar" style={{ width: 60 }}>
              <div className="progress-fill" style={{ width: `${score}%`, background: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#f43f5e' }} />
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{score}%</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{suggestion.reason}</div>
      {suggestion.metadata && Object.keys(suggestion.metadata).length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(suggestion.metadata).filter(([k]) => !['aircraftId','crewId'].includes(k)).map(([k, v]) => (
            <span key={k} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {k}: <span className="mono" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConflictCard({ conflict }) {
  const colorMap = { CRITICAL: '#f43f5e', HIGH: '#fb923c', MEDIUM: '#f59e0b' };
  const color = colorMap[conflict.severity] || '#94a3b8';
  return (
    <div className={`conflict-${conflict.severity.toLowerCase()}`} style={{ borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={15} color={color} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color }}>{conflict.conflictType.replace(/_/g, ' ')}</span>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color, background: `${color}22`, padding: '1px 6px', borderRadius: 4 }}>{conflict.severity}</span>
      </div>
      <div style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>{conflict.description}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
        <span>→</span><span>{conflict.proposedFix}</span>
      </div>
    </div>
  );
}

export default function AgentPanel() {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState('');
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [delays, setDelays] = useState([]);
  const [cargoResult, setCargoResult] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    flightApi.getAll().then(r => {
      const fls = (r.data || []).filter(f => f.status === 'SCHEDULED' || f.status === 'BOARDING');
      setFlights(fls);
      if (fls.length > 0) setSelectedFlight(fls[0].id);
    });
    runDetectConflicts();
  }, []);

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const runSuggestAircraft = async () => {
    if (!selectedFlight) return;
    setLoad('aircraft', true);
    try {
      const r = await agentApi.suggestAircraft(selectedFlight);
      setResults(prev => ({ ...prev, aircraft: r.data }));
    } catch (e) { toast.error(e.message); }
    finally { setLoad('aircraft', false); }
  };

  const runSuggestCrew = async () => {
    if (!selectedFlight) return;
    setLoad('crew', true);
    try {
      const r = await agentApi.suggestCrew(selectedFlight);
      setResults(prev => ({ ...prev, crew: r.data }));
    } catch (e) { toast.error(e.message); }
    finally { setLoad('crew', false); }
  };

  const runOptimizeCargo = async () => {
    setLoad('cargo', true);
    try {
      const r = await agentApi.optimizeCargo();
      setCargoResult(r.data);
      toast.success(r.data.summary);
    } catch (e) { toast.error(e.message); }
    finally { setLoad('cargo', false); }
  };

  const runDetectConflicts = async () => {
    setLoad('conflicts', true);
    try {
      const r = await agentApi.detectConflicts();
      setConflicts(r.data || []);
    } catch (e) { }
    finally { setLoad('conflicts', false); }
  };

  const runPredictDelays = async () => {
    setLoad('delays', true);
    try {
      const r = await agentApi.predictDelays();
      setDelays(r.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoad('delays', false); }
  };

  const tabs = [
    { key: 'suggestions', label: 'Suggestions', icon: Bot },
    { key: 'conflicts', label: `Conflicts ${conflicts.length > 0 ? `(${conflicts.length})` : ''}`, icon: AlertTriangle },
    { key: 'delays', label: 'Delay Prediction', icon: Clock },
    { key: 'cargo', label: 'Cargo Optimizer', icon: Package },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Bot size={22} /> AI Agent</div>
          <div className="page-subtitle">Rule-based expert system with heuristic scoring for intelligent recommendations</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#d1fae5',
          border: '2px solid rgba(16,185,129,0.25)',
          borderRadius: 20, fontSize: '0.78rem', color: '#065f46', fontWeight: 700,
          boxShadow: '2px 2px 0px rgba(16,185,129,0.2)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          Agent Online
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid rgba(79,110,247,0.1)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? '#e8edff' : 'transparent',
            border: activeTab === tab.key ? '2px solid rgba(79,110,247,0.2)' : '2px solid transparent',
            cursor: 'pointer',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px 10px 0 0',
            color: activeTab === tab.key ? '#4f6ef7' : '#475569',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 500,
            display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s',
            boxShadow: activeTab === tab.key ? '3px 0 0 rgba(79,110,247,0.15)' : 'none',
          }}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'suggestions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} color="var(--accent-gold)" /> Select Flight for Analysis
            </div>
            <select className="select" value={selectedFlight} onChange={e => setSelectedFlight(e.target.value)} style={{ marginBottom: '0.75rem' }}>
              {flights.length === 0 ? <option>No scheduled flights</option> :
                flights.map(f => <option key={f.id} value={f.id}>{f.flightNumber} · {f.origin} → {f.destination} · {new Date(f.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</option>)
              }
            </select>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-cyan" onClick={runSuggestAircraft} disabled={!selectedFlight || loading.aircraft}>
                <Plane size={15} /> {loading.aircraft ? 'Analyzing...' : 'Suggest Aircraft'}
              </button>
              <button className="btn btn-cyan" onClick={runSuggestCrew} disabled={!selectedFlight || loading.crew}>
                <Users size={15} /> {loading.crew ? 'Analyzing...' : 'Suggest Crew'}
              </button>
            </div>
          </div>

          {results.aircraft && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plane size={15} color="var(--accent-cyan)" /> Aircraft Recommendation
              </div>
              <SuggestionCard suggestion={results.aircraft} index={0} />
            </div>
          )}

          {results.crew && results.crew.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} color="var(--accent-cyan)" /> Crew Recommendations
              </div>
              {results.crew.map((s, i) => <SuggestionCard key={i} suggestion={s} index={i} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'conflicts' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color={conflicts.length > 0 ? 'var(--accent-red)' : 'var(--accent-green)'} />
              {conflicts.length > 0 ? `${conflicts.length} Conflict(s) Detected` : 'No Conflicts — All Clear'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={runDetectConflicts} disabled={loading.conflicts}>
              {loading.conflicts ? 'Scanning...' : 'Refresh Scan'}
            </button>
          </div>
          {conflicts.length === 0 && !loading.conflicts ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-green)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={36} />
              <div>All systems operating within parameters</div>
            </div>
          ) : conflicts.map((c, i) => <ConflictCard key={i} conflict={c} />)}
        </div>
      )}

      {activeTab === 'delays' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--accent-gold)" /> Delay Risk Predictions
            </div>
            <button className="btn btn-cyan btn-sm" onClick={runPredictDelays} disabled={loading.delays}>
              {loading.delays ? 'Predicting...' : 'Run Prediction'}
            </button>
          </div>
          {delays.length === 0 ? (
            <div className="empty-state"><Clock size={36} /><div>Click "Run Prediction" to analyze all scheduled flights</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {delays.sort((a, b) => b.estimatedDelayMinutes - a.estimatedDelayMinutes).map(d => (
                <div key={d.flightId} style={{
                  padding: '1rem', borderRadius: 8,
                  background: d.delayLikely ? (d.riskLevel === 'HIGH' ? 'rgba(255,71,87,0.05)' : 'rgba(240,165,0,0.05)') : 'rgba(0,230,118,0.05)',
                  border: `1px solid ${d.delayLikely ? (d.riskLevel === 'HIGH' ? 'rgba(255,71,87,0.2)' : 'rgba(240,165,0,0.2)') : 'rgba(0,230,118,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{d.flightNumber}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {d.delayLikely && <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+{d.estimatedDelayMinutes} min</span>}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                        color: d.riskLevel === 'HIGH' ? 'var(--accent-red)' : d.riskLevel === 'MEDIUM' ? 'var(--accent-gold)' : 'var(--accent-green)',
                        background: d.riskLevel === 'HIGH' ? 'rgba(255,71,87,0.15)' : d.riskLevel === 'MEDIUM' ? 'rgba(240,165,0,0.15)' : 'rgba(0,230,118,0.15)',
                      }}>{d.riskLevel}</span>
                    </div>
                  </div>
                  {d.reasons.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {d.reasons.map((r, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem' }}><span style={{ color: 'var(--accent-red)' }}>•</span>{r}</div>)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={12} /> No delay risk factors detected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cargo' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Package size={16} color="var(--accent-cyan)" /> Cargo Optimization Engine
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Automatically assigns all pending cargo to available flights using priority scoring (CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1) and capacity constraints. Splits cargo when needed.
            </div>
            <button className="btn btn-cyan btn-lg" onClick={runOptimizeCargo} disabled={loading.cargo}>
              <Zap size={16} /> {loading.cargo ? 'Optimizing...' : 'Run Cargo Optimization'}
            </button>
          </div>

          {cargoResult && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-4">
                <div style={{ textAlign: 'center', padding: '0.85rem', background: '#e8edff', borderRadius: 12, border: '2px solid rgba(79,110,247,0.15)', boxShadow: '3px 3px 0px rgba(79,110,247,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f6ef7' }}>{cargoResult.totalCargoProcessed}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: 2 }}>Processed</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.85rem', background: '#d1fae5', borderRadius: 12, border: '2px solid rgba(16,185,129,0.2)', boxShadow: '3px 3px 0px rgba(16,185,129,0.12)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{cargoResult.successfulAssignments}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: 2 }}>Assigned</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.85rem', background: '#fef3c7', borderRadius: 12, border: '2px solid rgba(245,158,11,0.2)', boxShadow: '3px 3px 0px rgba(245,158,11,0.12)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{cargoResult.splitOccurred}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: 2 }}>Split</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.85rem', background: '#ffe4e6', borderRadius: 12, border: '2px solid rgba(244,63,94,0.2)', boxShadow: '3px 3px 0px rgba(244,63,94,0.12)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{cargoResult.unassigned}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: 2 }}>Unassigned</div>
                </div>
              </div>
              <div style={{ background: '#f0f4ff', borderRadius: 12, padding: '1rem', maxHeight: 300, overflow: 'auto', border: '2px solid rgba(79,110,247,0.1)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action Log</div>
                {cargoResult.actions.map((action, i) => (
                  <div key={i} className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>[{String(i+1).padStart(2,'0')}]</span> {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
