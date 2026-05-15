import { Outlet } from 'react-router-dom';
import { IoGitNetworkOutline } from 'react-icons/io5';
import hero from '../assets/hero.png';

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen bg-dark-950 text-dark-100 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-dark-800 bg-dark-50 lg:flex">
        <img
          src={hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-50 via-dark-50/90 to-primary-900/80"></div>
        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-400 text-dark-50">
              <IoGitNetworkOutline size={22} />
            </div>
            <div>
              <p className="text-xl font-bold">TaskPilot</p>
              <p className="text-xs font-medium uppercase text-white/60">Focus desk</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase text-primary-200">
              Plan. Assign. Finish.
            </p>
            <h1 className="text-5xl font-bold leading-tight">
              Work stays clear from first task to final handoff.
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-white/70">Projects</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">02</p>
              <p className="mt-1 text-white/70">Tasks</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">03</p>
              <p className="mt-1 text-white/70">Progress</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-700 text-white">
              <IoGitNetworkOutline size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-50">TaskPilot</h1>
              <p className="text-xs font-medium uppercase text-dark-500">Focus desk</p>
            </div>
          </div>

          <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-xl shadow-dark-50/10 sm:p-8">
            <Outlet />
          </div>

          <p className="mt-6 text-center text-sm text-dark-500">
            2026 TaskPilot. Built for focused teams.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
