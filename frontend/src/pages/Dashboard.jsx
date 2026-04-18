import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, PlaneTakeoff, Users, Package, AlertTriangle, TrendingUp, Bot } from 'lucide-react';
import { flightApi, aircraftApi, crewApi, cargoApi, agentApi } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = {
  AVAILABLE: '#00e676', IN_FLIGHT: '#0080ff', MAINTENANCE: '#f0a500',
  RETIRED: '#ff4757', SCHEDULED: '#00e676', BOARDING: '#0080ff',
  DELAYED: '#f0a500', CANCELLED: '#ff4757', LANDED: '#94a3b8',
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
      <div className="loading">Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><TrendingUp size={22} color="var(--accent-cyan)" /> Operations Dashboard</div>
          <div className="page-subtitle">Real-time overview of all airline operations</div>
        </div>
        <button className="btn btn-cyan" onClick={() => navigate('/agent')}>
          <Bot size={16} /> Open AI Agent
        </button>
      </div>

      {data.conflicts.length > 0 && (
        <div style={{
          background: criticalConflicts > 0 ? 'rgba(255,71,87,0.08)' : 'rgba(240,165,0,0.08)',
          border: `1px solid ${criticalConflicts > 0 ? 'rgba(255,71,87,0.4)' : 'rgba(240,165,0,0.4)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color={criticalConflicts > 0 ? 'var(--accent-red)' : 'var(--accent-gold)'} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {data.conflicts.length} Active Conflict{data.conflicts.length !== 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {criticalConflicts > 0 && `${criticalConflicts} CRITICAL · `}{highConflicts} HIGH priority issues
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agent')}>
            View & Resolve →
          </button>
        </div>
      )}

      <div className="grid-4">
        <div className="stat-card blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Active Flights</div>
            <PlaneTakeoff size={18} color="var(--accent-blue)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{scheduledFlights}</div>
          <div className="stat-sub">{data.flights.length} total · {data.flights.filter(f => f.status === 'IN_FLIGHT').length} in-flight</div>
        </div>
        <div className="stat-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Available Aircraft</div>
            <Plane size={18} color="var(--accent-green)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{availableAircraft}</div>
          <div className="stat-sub">{data.aircraft.length} total · {data.aircraft.filter(a => a.status === 'MAINTENANCE').length} in maintenance</div>
        </div>
        <div className="stat-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Available Crew</div>
            <Users size={18} color="var(--accent-cyan)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{availableCrew}</div>
          <div className="stat-sub">{data.crew.length} total · {data.crew.filter(c => c.status === 'ON_DUTY').length} on duty</div>
        </div>
        <div className="stat-card gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-label">Pending Cargo</div>
            <Package size={18} color="var(--accent-gold)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{pendingCargo}</div>
          <div className="stat-sub">{data.cargo.length} total · {data.cargo.filter(c => c.status === 'ASSIGNED').length} assigned</div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>FLIGHT STATUS</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={flightStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {flightStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#666'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AIRCRAFT STATUS</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={aircraftStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {aircraftStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#666'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CARGO BY PRIORITY</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cargoByPriority} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey="value" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlaneTakeoff size={16} color="var(--accent-cyan)" /> Recent Flights
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Flight</th><th>Route</th><th>Departure</th><th>Aircraft</th><th>Crew</th><th>Cargo (kg)</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.flights.slice(0, 8).map(f => (
                <tr key={f.id}>
                  <td><span className="mono" style={{ color: 'var(--accent-cyan)' }}>{f.flightNumber}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{f.origin} → {f.destination}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(f.departureTime).toLocaleString()}</td>
                  <td>{f.aircraft ? f.aircraft.registrationNumber : <span style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>Unassigned</span>}</td>
                  <td>{f.crewCount || 0}</td>
                  <td>{Math.round(f.totalCargoWeight || 0)}</td>
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
