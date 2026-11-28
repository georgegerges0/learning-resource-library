import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
  }`;

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow-sm">
      <nav
        aria-label="Primary navigation"
        className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            to={user ? '/catalogue' : '/login'}
            className="text-xl font-semibold tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white rounded px-1"
          >
            Kadidjiny Library
          </Link>
          {user && (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                  : 'bg-sky-500/20 text-sky-200 border-sky-400/40'
              }`}
            >
              {isAdmin ? 'Educator' : 'Student'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/catalogue" className={navLinkClass}>
                Catalogue
              </NavLink>
              <NavLink to="/my-library" className={navLinkClass}>
                My Library
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Manage Catalogue
                </NavLink>
              )}
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-3.5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
