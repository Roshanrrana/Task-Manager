import { useAuth } from '../../context/useAuth';
import { IoMenuOutline, IoNotificationsOutline } from 'react-icons/io5';

const Navbar = ({ onMenuToggle, pageTitle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <IoMenuOutline size={22} />
        </button>
        <h1 className="text-lg font-semibold text-dark-100">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors">
          <IoNotificationsOutline size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-lg">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-dark-200 leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-dark-500 capitalize leading-tight">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
