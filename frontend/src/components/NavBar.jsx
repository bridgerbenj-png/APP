import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, Pencil, Trophy, Settings } from 'lucide-react';

const links = [
  { to: '/',            icon: LayoutDashboard, label: 'Home' },
  { to: '/flashcards',  icon: Layers,          label: 'Flashcards' },
  { to: '/grammar',     icon: BookOpen,        label: 'Grammar' },
  { to: '/conjugation', icon: Pencil,          label: 'Conjugate' },
  { to: '/quiz',        icon: Trophy,          label: 'Quiz' },
  { to: '/settings',    icon: Settings,        label: 'Settings' },
];

export default function NavBar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="text-xl font-bold text-indigo-600 font-jp tracking-wide">日本語</span>
        <div className="flex gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
