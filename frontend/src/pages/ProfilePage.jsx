import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { IoPersonOutline, IoMailOutline, IoLockClosedOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;
      await API.put('/users/profile', payload);
      toast.success('Profile updated! Please re-login to see changes.');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
        <div className="flex items-center gap-4 lg:block">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary-100 text-primary-800 lg:h-20 lg:w-20">
            <span className="text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="mt-0 lg:mt-5">
            <h2 className="text-xl font-bold text-dark-50">{user?.name}</h2>
            <div className="mt-2 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="text-primary-700" size={14} />
              <span className="text-sm font-medium capitalize text-primary-700">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
              <div className="relative">
                <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-dark-800 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <div className="relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-dark-800 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">New Password <span className="text-dark-600">(leave blank to keep current)</span></label>
            <div className="relative">
              <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password"
                className="w-full rounded-lg border border-dark-800 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Role</label>
            <div className="relative">
              <IoShieldCheckmarkOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              <input type="text" value={user?.role} disabled
                className="w-full cursor-not-allowed rounded-lg border border-dark-800 bg-dark-950/70 py-2.5 pl-10 pr-4 capitalize text-dark-500" />
            </div>
            <p className="mt-1 text-xs text-dark-600">Role cannot be changed</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={logout}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
              Sign Out
            </button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary-700 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
