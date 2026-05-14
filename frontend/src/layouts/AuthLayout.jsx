import { Outlet } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi2';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-600/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-800/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-2xl animate-bounce delay-500" style={{ animationDuration: '6s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <HiOutlineSparkles className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
            TaskFlow
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-2xl shadow-black/20 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-dark-600 text-sm mt-6">
          © 2024 TaskFlow. Built for productive teams.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
