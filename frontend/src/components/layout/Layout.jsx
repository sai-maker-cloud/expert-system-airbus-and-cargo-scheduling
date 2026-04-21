import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Plane, PlaneTakeoff, Users, Package,
  Bot, Settings, ChevronLeft, ChevronRight, Sparkles, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',    color: '#4f6ef7', bg: '#e8edff' },
  { to: '/flights',   icon: PlaneTakeoff,   label: 'Flights',       color: '#0ea5e9', bg: '#e0f7ff' },
  { to: '/aircraft',  icon: Plane,          label: 'Aircraft',      color: '#8b5cf6', bg: '#f0e8ff' },
  { to: '/crew',      icon: Users,          label: 'Crew',          color: '#10b981', bg: '#e0fff4' },
  { to: '/cargo',     icon: Package,        label: 'Cargo',         color: '#f59e0b', bg: '#fff8e0' },
  { to: '/agent',     icon: Bot,            label: 'AI Agent',      color: '#ec4899', bg: '#ffe8f5' },
  { to: '/rules',     icon: Settings,       label: 'Rule Editor',   color: '#fb923c', bg: '#fff0e8' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const activePage = navItems.find(n => location.pathname.startsWith(n.to));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0f4ff' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,50,0.3)', backdropFilter: 'blur(4px)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: collapsed ? 74 : 228,
        minWidth: collapsed ? 74 : 228,
        background: 'white',
        borderRight: '2px solid rgba(79,110,247,0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), min-width 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50,
        boxShadow: '4px 0 20px rgba(79,110,247,0.08)',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.2rem 0' : '1.2rem 1.1rem',
          borderBottom: '2px solid rgba(79,110,247,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '0.5rem',
          minHeight: 68,
          background: 'linear-gradient(135deg, #f0f4ff, #ede9fe)',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 12,
                background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '3px 3px 0px rgba(79,110,247,0.3)',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <Plane size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#1e293b' }}>AirlineOS</div>
                <div style={{ fontSize: '0.62rem', color: '#8b5cf6', fontWeight: 600, marginTop: '-1px' }}>Expert System v1.0</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '3px 3px 0px rgba(79,110,247,0.3)',
            }}>
              <Plane size={16} color="white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'white', border: '2px solid rgba(79,110,247,0.15)',
              borderRadius: 10, color: '#4f6ef7', cursor: 'pointer',
              padding: '0.3rem', display: 'flex', alignItems: 'center',
              boxShadow: '2px 2px 0px rgba(79,110,247,0.15)',
              transition: 'all 0.2s',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.6rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label, color, bg }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.7rem' : '0.7rem 0.85rem',
                borderRadius: 14,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? color : '#475569',
                background: isActive ? bg : 'transparent',
                border: isActive ? `2px solid ${color}28` : '2px solid transparent',
                boxShadow: isActive ? `3px 3px 0px ${color}20` : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: isActive ? color : 'rgba(79,110,247,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `2px 2px 0px ${color}35` : 'none',
                  }}>
                    <Icon size={15} color={isActive ? 'white' : '#94a3b8'} />
                  </div>
                  {!collapsed && label}
                  {label === 'AI Agent' && !collapsed && (
                    <span style={{
                      marginLeft: 'auto',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      color: 'white',
                      fontSize: '0.58rem', fontWeight: 800,
                      padding: '2px 7px', borderRadius: 10,
                      boxShadow: '1px 1px 0px rgba(236,72,153,0.3)',
                    }}>AI</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status footer */}
        {!collapsed && (
          <div style={{
            padding: '0.85rem 1rem',
            borderTop: '2px solid rgba(79,110,247,0.08)',
            background: 'linear-gradient(135deg, #f0fff4, #f0f4ff)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              background: 'white',
              borderRadius: 10,
              border: '2px solid rgba(16,185,129,0.2)',
              boxShadow: '2px 2px 0px rgba(16,185,129,0.12)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                animation: 'pulse 2s ease infinite',
              }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46' }}>System Online</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.4rem', textAlign: 'center', fontWeight: 500 }}>
              Spring Boot + MySQL
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          height: 68,
          background: 'white',
          borderBottom: '2px solid rgba(79,110,247,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.75rem',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(79,110,247,0.06)',
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activePage && (
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: activePage.bg,
                border: `2px solid ${activePage.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `3px 3px 0px ${activePage.color}20`,
              }}>
                <activePage.icon size={18} color={activePage.color} />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                {activePage?.label || 'AirlineOS'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                AI-Based Airline Scheduling & Cargo Management
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/agent" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white', border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '0.85rem', fontWeight: 700,
                boxShadow: '3px 3px 0px rgba(139,92,246,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '4px 5px 0px rgba(139,92,246,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0px rgba(139,92,246,0.3)'; }}
              >
                <Sparkles size={14} />
                AI Agent
              </button>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.75rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
