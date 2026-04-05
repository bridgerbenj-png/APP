import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, Pencil, Trophy, Settings, MessageSquare, Headphones, Mic, PenLine, Bot } from 'lucide-react';

const links = [
  { to: '/',            icon: LayoutDashboard, label: 'Home' },
  { to: '/chat',        icon: Bot,             label: 'Chat' },
  { to: '/flashcards',  icon: Layers,          label: 'Flashcards' },
  { to: '/grammar',     icon: BookOpen,        label: 'Grammar' },
  { to: '/conjugation', icon: Pencil,          label: 'Conjugate' },
  { to: '/quiz',        icon: Trophy,          label: 'Quiz' },
  { to: '/sentences',   icon: MessageSquare,   label: 'Sentences' },
  { to: '/listening',   icon: Headphones,      label: 'Listening' },
  { to: '/speaking',    icon: Mic,             label: 'Speaking' },
  { to: '/writing',     icon: PenLine,         label: 'Writing' },
  { to: '/settings',    icon: Settings,        label: 'Settings' },
];

export default function NavBar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top row: logo + icon-only links */}
        <div className="flex items-center justify-between h-12">
          <span className="text-lg font-bold text-indigo-600 font-jp tracking-wide flex-shrink-0 mr-2">日本語</span>
          <div className="flex items-center gap-0.5 flex-wrap">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={15} />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
