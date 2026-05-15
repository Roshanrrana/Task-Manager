import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IoGridOutline,
  IoFolderOutline,
  IoCheckboxOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoCloseOutline,
  IoGitNetworkOutline,
} from 'react-icons/io5';

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
          className="fixed inset-0 z-40 bg-dark-50/35 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(88vw,340px)] flex-col border-l border-dark-800 bg-dark-900 shadow-2xl shadow-dark-50/20 transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-dark-800 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-700 text-white">
              <IoGitNetworkOutline size={18} />
            </div>
            <div>
              <span className="block text-lg font-bold text-dark-50">TaskPilot</span>
              <span className="text-xs font-medium uppercase text-dark-500">Focus desk</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-dark-800 text-dark-400 transition-colors hover:border-primary-300 hover:text-primary-700"
            aria-label="Close navigation"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'text-dark-400 hover:bg-dark-950 hover:text-dark-100'
                }`
              }
            >
              <item.icon
                size={20}
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-dark-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-dark-950 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-100 text-primary-800">
              <span className="text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-dark-100">
                {user?.name}
              </p>
              <p className="text-xs capitalize text-dark-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-lg text-dark-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
