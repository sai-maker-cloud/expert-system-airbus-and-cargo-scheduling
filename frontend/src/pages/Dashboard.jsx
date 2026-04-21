import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, PlaneTakeoff, Users, Package, AlertTriangle, TrendingUp, Bot, Sparkles } from 'lucide-react';
import { flightApi, aircraftApi, crewApi, cargoApi, agentApi } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = {
  AVAILABLE: '#10b981', IN_FLIGHT: '#4f6ef7', MAINTENANCE: '#f59e0b',
  RETIRED: '#f43f5e', SCHEDULED: '#10b981', BOARDING: '#4f6ef7',
  DELAYED: '#f59e0b', CANCELLED: '#f43f5e', LANDED: '#94a3b8',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white', border: '2px solid rgba(79,110,247,0.15)',
        borderRadius: 12, padding: '0.6rem 0.9rem',
        boxShadow: '4px 4px 0px rgba(79,110,247,0.12)',
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600,
      }}>
        <div style={{ color: '#475569' }}>{label || payload[0]?.name}</div>
        <div style={{ color: '#4f6ef7', fontSize: '1rem', fontWeight: 800 }}>{payload[0]?.value}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ flights: [], aircraft: [], crew: [], cargo: [], conflicts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      flightApi.getAll(), aircraftApi.getAll(), crewApi.getAll(), cargoApi.getAll(), agentApi.detectConflicts()
    ]).then(([flights, aircraft, crew, cargo, conflicts]) => {
      setData({
        flights: flights.data || [],
        aircraft: aircraft.data || [],
        crew: crew.data || [],
        cargo: cargo.data || [],
        conflicts: conflicts.data || [],
      });
    }).finally(() => setLoading(false));
  }, []);

  const countBy = (arr, key) => arr.reduce((acc, item) => {
    const val = item[key];
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  const flightStatusData = Object.entries(countBy(data.flights, 'status')).map(([name, value]) => ({ name, value }));
  const aircraftStatusData = Object.entries(countBy(data.aircraft, 'status')).map(([name, value]) => ({ name, value }));
  const cargoByPriority = Object.entries(countBy(data.cargo, 'priority')).map(([name, value]) => ({ name, value }));

  const criticalConflicts = data.conflicts.filter(c => c.severity === 'CRITICAL').length;
  const highConflicts = data.conflicts.filter(c => c.severity === 'HIGH').length;

  const availableAircraft = data.aircraft.filter(a => a.status === 'AVAILABLE').length;
  const availableCrew = data.crew.filter(c => c.status === 'AVAILABLE').length;
  const pendingCargo = data.cargo.filter(c => c.status === 'PENDING').length;
  const scheduledFlights = data.flights.filter(f => f.status === 'SCHEDULED' || f.status === 'BOARDING').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '4px 4px 0px rgba(79,110,247,0.3)',
        animation: 'float 1.5s ease-in-out infinite',
      }}>
        <Plane size={28} color="white" />
      </div>
      <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }} className="loading">Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><TrendingUp size={24} /> Operations Dashboard</div>
          <div className="page-subtitle">Real-time overview of all airline operations</div>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/agent')}
          style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          <Sparkles size={16} /> Open AI Agent
        </button>
      </div>

      {/* Conflict Alert */}
      {data.conflicts.length > 0 && (
        <div style={{
          background: criticalConflicts > 0
            ? 'linear-gradient(135deg, #fff5f6, #fff0fb)'
            : 'linear-gradient(135deg, #fffce8, #fff8f0)',
          border: `2px solid ${criticalConflicts > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius: 20,
          padding: '1.1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: criticalConflicts > 0
            ? '4px 4px 0px rgba(244,63,94,0.15)'
            : '4px 4px 0px rgba(245,158,11,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: criticalConflicts > 0 ? '#ffe4e6' : '#fef3c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${criticalConflicts > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              <AlertTriangle size={18} color={criticalConflicts > 0 ? '#f43f5e' : '#f59e0b'} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>
                {data.conflicts.length} Active Conflict{data.conflicts.length !== 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 2 }}>
                {criticalConflicts > 0 && `${criticalConflicts} CRITICAL · `}{highConflicts} HIGH priority issues
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agent')}>
            View & Resolve →
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4">
        <div className="stat-card blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Active Flights</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(79,110,247,0.2)' }}>
              <PlaneTakeoff size={16} color="#4f6ef7" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#4f6ef7' }}>{scheduledFlights}</div>
          <div className="stat-sub">{data.flights.length} total · {data.flights.filter(f => f.status === 'IN_FLIGHT').length} in-flight</div>
        </div>
        <div className="stat-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Available Aircraft</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(16,185,129,0.2)' }}>
              <Plane size={16} color="#10b981" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>{availableAircraft}</div>
          <div className="stat-sub">{data.aircraft.length} total · {data.aircraft.filter(a => a.status === 'MAINTENANCE').length} in maintenance</div>
        </div>
        <div className="stat-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Available Crew</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(14,165,233,0.2)' }}>
              <Users size={16} color="#0ea5e9" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>{availableCrew}</div>
          <div className="stat-sub">{data.crew.length} total · {data.crew.filter(c => c.status === 'ON_DUTY').length} on duty</div>
        </div>
        <div className="stat-card gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Pending Cargo</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(245,158,11,0.2)' }}>
              <Package size={16} color="#f59e0b" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingCargo}</div>
          <div className="stat-sub">{data.cargo.length} total · {data.cargo.filter(c => c.status === 'ASSIGNED').length} assigned</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>✈ Flight Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={flightStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {flightStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🛩 Aircraft Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={aircraftStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {aircraftStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>📦 Cargo by Priority</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cargoByPriority} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f6ef7" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Flights Table */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e8edff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(79,110,247,0.15)' }}>
            <PlaneTakeoff size={15} color="#4f6ef7" />
          </div>
          <span style={{ background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Recent Flights
          </span>
        </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Flight</th><th>Route</th><th>Departure</th><th>Aircraft</th><th>Crew</th><th>Cargo (kg)</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.flights.slice(0, 8).map(f => (
                <tr key={f.id}>
                  <td><span className="mono" style={{ color: '#4f6ef7', fontWeight: 700, background: '#e8edff', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem' }}>{f.flightNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <span style={{ color: '#1e293b' }}>{f.origin}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>→</span>
                      <span style={{ color: '#1e293b' }}>{f.destination}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{new Date(f.departureTime).toLocaleString()}</td>
                  <td>{f.aircraft ? <span style={{ fontWeight: 600 }}>{f.aircraft.registrationNumber}</span> : <span style={{ color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600 }}>⚠ Unassigned</span>}</td>
                  <td><span style={{ fontWeight: 700 }}>{f.crewCount || 0}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{Math.round(f.totalCargoWeight || 0)}</span></td>
                  <td><span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
