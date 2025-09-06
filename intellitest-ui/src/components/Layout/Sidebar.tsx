import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileQuestion, 
  ClipboardList, 
  BarChart3, 
  Monitor,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { to: '/', icon: Home, label: 'Dashboard' }
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        { to: '/student-tests', icon: ClipboardList, label: 'Available Tests' },
        { to: '/results', icon: Award, label: 'My Results' }
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { to: '/questions', icon: FileQuestion, label: 'Question Bank' },
        { to: '/tests', icon: ClipboardList, label: 'Test Management' },
        { to: '/monitoring', icon: Monitor, label: 'Live Monitoring' },
        { to: '/analytics', icon: BarChart3, label: 'Results & Analytics' }
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { to: '/users', icon: Users, label: 'User Management' },
        { to: '/questions', icon: FileQuestion, label: 'Question Bank' },
        { to: '/tests', icon: ClipboardList, label: 'Test Management' },
        { to: '/monitoring', icon: Monitor, label: 'Live Monitoring' },
        { to: '/analytics', icon: BarChart3, label: 'Results & Analytics' }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}