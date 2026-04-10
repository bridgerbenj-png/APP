import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bot, History,
  MessageSquare, BookOpen, Layers, Pencil,
  Trophy, PenLine, Mic, Headphones,
  Settings, ChevronDown, Menu, X, FileText,
} from 'lucide-react';

const GROUPS = [
  {
    id: 'home',
    label: 'Home',
    items: [
      { to: '/',        icon: LayoutDashboard, label: 'Dashboard',    end: true },
      { to: '/chat',    icon: Bot,             label: 'Chat' },
      { to: '/history', icon: History,         label: 'Work History' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    items: [
      { to: '/sentences',   icon: MessageSquare, label: 'Sentences' },
      { to: '/grammar',     icon: BookOpen,      label: 'Grammar' },
      { to: '/flashcards',  icon: Layers,        label: 'Flashcards' },
      { to: '/conjugation', icon: Pencil,        label: 'Conjugations' },
      { to: '/notes-to-flashcards', icon: FileText, label: 'Notes to Flashcards' },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    items: [
      { to: '/quiz',      icon: Trophy,     label: 'Quiz' },
      { to: '/writing',   icon: PenLine,    label: 'Writing' },
      { to: '/speaking',  icon: Mic,        label: 'Speaking' },
      { to: '/listening', icon: Headphones, label: 'Listening' },
    ],
  },
];

export default function NavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const isGroupActive = (group) =>
    group.items.some(item =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );

  const triggerCls = (active) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
    }`;

  const itemCls = (isActive) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mx-1 transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 font-medium'
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center h-14 gap-1">

          {/* Logo */}
          <Link to="/" className="text-lg font-bold text-indigo-600 font-jp tracking-wide mr-3 flex-shrink-0">
            日本語
          </Link>

          {/* Desktop dropdowns */}
          <div className="hidden md:flex items-center gap-1">
            {GROUPS.map(group => (
              <div key={group.id} className="relative group">
                {/* Trigger button */}
                <button className={triggerCls(isGroupActive(group))}>
                  {group.label}
                  <ChevronDown size={13} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Dropdown panel — sits flush against the button with a transparent bridge */}
                <div className="absolute top-full left-0 pt-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 z-50">
                  <div className="w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5">
                    {group.items.map(({ to, icon: Icon, label, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={!!end}
                        className={({ isActive }) => itemCls(isActive)}
                      >
                        <Icon size={14} />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings — desktop */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Settings size={15} />
            Settings
          </NavLink>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
            onClick={() => { setMobileOpen(o => !o); setMobileExpanded(null); }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4">
          {GROUPS.map(group => (
            <div key={group.id}>
              <button
                onClick={() => setMobileExpanded(e => e === group.id ? null : group.id)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-slate-700"
              >
                <span>{group.label}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${mobileExpanded === group.id ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileExpanded === group.id && (
                <div className="pl-3 space-y-0.5 pb-2">
                  {group.items.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={!!end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon size={14} /> {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-3 text-sm font-medium border-t border-slate-100 mt-1 ${
                isActive ? 'text-indigo-600' : 'text-slate-700'
              }`
            }
          >
            <Settings size={15} /> Settings
          </NavLink>
        </div>
      )}
    </nav>
  );
}
