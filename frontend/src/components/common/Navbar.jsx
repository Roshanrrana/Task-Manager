import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IoCheckboxOutline,
  IoFolderOutline,
  IoGitNetworkOutline,
  IoGridOutline,
  IoMenuOutline,
  IoNotificationsOutline,
  IoPersonOutline,
} from 'react-icons/io5';

const navItems = [
  { to: '/dashboard', icon: IoGridOutline, label: 'Dashboard' },
  { to: '/projects', icon: IoFolderOutline, label: 'Projects' },
  { to: '/tasks', icon: IoCheckboxOutline, label: 'Tasks' },
  { to: '/profile', icon: IoPersonOutline, label: 'Profile' },
];

const Navbar = ({ onMenuToggle, pageTitle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-dark-800 bg-dark-900/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 lg:px-8">
        <button
          onClick={onMenuToggle}
          className="grid h-10 w-10 place-items-center rounded-lg border border-dark-800 bg-dark-950 text-dark-400 transition-colors hover:border-primary-300 hover:text-primary-700 lg:hidden"
          aria-label="Open navigation"
        >
          <IoMenuOutline size={22} />
        </button>

        <div className="hidden min-w-[210px] items-center gap-3 lg:flex">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-700 text-white shadow-sm">
            <IoGitNetworkOutline size={20} />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-dark-50">TaskPilot</p>
            <p className="text-xs font-medium uppercase text-dark-500">Focus desk</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center lg:justify-center">
          <div className="min-w-0 lg:hidden">
            <p className="text-xs font-medium uppercase text-primary-700">TaskPilot</p>
            <h1 className="truncate text-lg font-semibold text-dark-50">{pageTitle}</h1>
          </div>

          <nav className="hidden items-center gap-1 rounded-lg border border-dark-800 bg-dark-950/80 p-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white shadow-sm'
                      : 'text-dark-400 hover:bg-dark-900 hover:text-dark-100'
                  }`
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden rounded-lg border border-dark-800 bg-dark-950 px-3 py-2 text-sm font-semibold text-dark-300 xl:block">
          {pageTitle}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-dark-800 bg-dark-950 text-dark-400 transition-colors hover:border-primary-300 hover:text-primary-700">
          <span className="sr-only">Notifications</span>
          <IoNotificationsOutline size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500"></span>
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-dark-800 bg-dark-950 px-2.5 py-1.5 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-100 text-primary-800">
            <span className="text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="max-w-28 truncate text-sm font-medium leading-tight text-dark-100">
              {user?.name}
            </p>
            <p className="text-[10px] capitalize leading-tight text-dark-500">
              {user?.role}
            </p>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
