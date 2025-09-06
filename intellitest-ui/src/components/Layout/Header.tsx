import React from 'react';
import { LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">IntelliTest</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user?.role || '')}`}>
                  {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                </span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}