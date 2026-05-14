import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IoGridOutline,
  IoFolderOutline,
  IoCheckboxOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi2';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: IoGridOutline, label: 'Dashboard' },
    { to: '/projects', icon: IoFolderOutline, label: 'Projects' },
    { to: '/tasks', icon: IoCheckboxOutline, label: 'Tasks' },
    { to: '/profile', icon: IoPersonOutline, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-dark-900 border-r border-dark-800 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-300 shadow-sm shadow-primary-500/10'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                }`
              }
            >
              <item.icon
                size={20}
                className="shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-dark-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-800/50">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-dark-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
              title="Logout"
            >
              <IoLogOutOutline size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
