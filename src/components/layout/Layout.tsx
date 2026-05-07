import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Megaphone,
  BarChart3,
  Settings,
  Banknote } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Chatbot } from '../shared/Chatbot';
interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}
const studentNav: NavItem[] = [
{
  label: 'Dashboard',
  path: '/student/dashboard',
  icon: LayoutDashboard
},
{
  label: 'Scholarships',
  path: '/student/scholarships',
  icon: GraduationCap
},
{
  label: 'My Applications',
  path: '/student/applications',
  icon: FileText
},
{
  label: 'Announcements',
  path: '/student/announcements',
  icon: Megaphone
},
{
  label: 'Profile',
  path: '/student/profile',
  icon: UserIcon
}];

const adminNav: NavItem[] = [
{
  label: 'Dashboard',
  path: '/admin/dashboard',
  icon: LayoutDashboard
},
{
  label: 'Manage Scholarships',
  path: '/admin/scholarships',
  icon: GraduationCap
},
{
  label: 'Applications',
  path: '/admin/applications',
  icon: FileText
},
{
  label: 'Grant Disbursement',
  path: '/admin/grants',
  icon: Banknote
},
{
  label: 'Announcements',
  path: '/admin/announcements',
  icon: Megaphone
},
{
  label: 'Reports',
  path: '/admin/reports',
  icon: BarChart3
}];

export function Layout({ children }: {children: React.ReactNode;}) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  if (!user) return <>{children}</>;
  const navItems = user.role === 'student' ? studentNav : adminNav;
  const unreadNotifs = notifications.filter(
    (n) => n.userId === user.id && !n.read
  );
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) — deep navy with sky accents */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed inset-y-0 z-20">
        <Link
          to="/"
          className="p-6 flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
          
          <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">IskolarLink</span>
        </Link>
        <div className="px-4 pb-6">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-sky-400 capitalize">
              {user.role} Portal
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                
                <item.icon
                  className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                
                {item.label}
              </Link>);

          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-sky-600">
          <GraduationCap className="w-6 h-6" />
          <span className="text-lg font-bold">IskolarLink</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600">
          
          {isMobileMenuOpen ?
          <X className="w-6 h-6" /> :

          <Menu className="w-6 h-6" />
          }
        </button>
      </div>

      {isMobileMenuOpen &&
      <div className="md:hidden fixed inset-0 z-20 bg-white pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) =>
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${location.pathname.startsWith(item.path) ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
          )}
            <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-base font-medium text-red-600 hover:bg-red-50">
            
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      }

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
        {/* Topbar (Desktop) */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
                
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 &&
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                }
              </button>

              {isNotifOpen &&
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">
                      {unreadNotifs.length} New
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.filter((n) => n.userId === user.id).
                  length === 0 ?
                  <div className="p-8 text-center text-gray-500 text-sm">
                        No notifications yet
                      </div> :

                  notifications.
                  filter((n) => n.userId === user.id).
                  map((notif) =>
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-sky-50/30' : ''}`}
                    onClick={() => {
                      void markNotificationRead(notif.id);
                      if (notif.link) {
                        navigate(notif.link);
                        setIsNotifOpen(false);
                      }
                    }}>
                    
                            <div className="flex justify-between items-start mb-1">
                              <h4
                        className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        
                                {notif.title}
                              </h4>
                              {!notif.read &&
                      <span className="w-2 h-2 bg-sky-500 rounded-full mt-1.5"></span>
                      }
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-2 block">
                              {new Date(notif.date).toLocaleDateString()}
                            </span>
                          </div>
                  )
                  }
                  </div>
                </div>
              }
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 w-full">{children}</div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/54669d56-2b5e-43fd-be9a-3d65a5d0c9b4.png"
                alt="NEMSU Seal"
                className="w-12 h-12 object-contain" />
              
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  North Eastern Mindanao State University
                </p>
                <p className="text-xs text-gray-500">
                  Surigao del Sur, Philippines
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center sm:text-right">
              <p className="font-medium text-gray-700">IskolarLink</p>
              <p>
                © {new Date().getFullYear()} NEMSU Scholarship Office. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Global Chatbot for Students */}
      {user.role === 'student' && <Chatbot />}
    </div>);

}