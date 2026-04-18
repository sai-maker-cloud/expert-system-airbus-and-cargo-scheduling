import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Plane, PlaneTakeoff, Users, Package,
  Bot, Settings, ChevronLeft, ChevronRight, AlertTriangle, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/flights', icon: PlaneTakeoff, label: 'Flights' },
  { to: '/aircraft', icon: Plane, label: 'Aircraft' },
  { to: '/crew', icon: Users, label: 'Crew' },
  { to: '/cargo', icon: Package, label: 'Cargo' },
  { to: '/agent', icon: Bot, label: 'AI Agent' },
  { to: '/rules', icon: Settings, label: 'Rule Editor' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside style={{
        width: collapsed ? 68 : 220,
        minWidth: collapsed ? 68 : 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s, min-width 0.25s',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50,
      }}>
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '0.5rem',
          minHeight: 64,
        }}>
          {!collapsed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plane size={14} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>AirlineOS</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, paddingLeft: 36 }}>Expert System v1.0</div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plane size={14} color="white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem',
              display: 'flex', alignItems: 'center',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.65rem' : '0.65rem 0.75rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={18} />
              {!collapsed && label}
              {label === 'AI Agent' && !collapsed && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent-cyan)', color: 'var(--bg-primary)',
                  fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 10,
                }}>AI</span>
              )}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div style={{
            padding: '1rem', borderTop: '1px solid var(--border)',
            fontSize: '0.7rem', color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
              System Online
            </div>
            <div>Spring Boot + MySQL</div>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 64, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'AirlineOS'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI-Based Airline Scheduling & Cargo Management
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/agent" style={{ textDecoration: 'none' }}>
              <button className="btn btn-cyan btn-sm">
                <Bot size={14} />
                AI Agent
              </button>
            </NavLink>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
