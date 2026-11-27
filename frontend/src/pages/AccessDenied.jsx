import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <main className="max-w-xl mx-auto mt-16 px-4" role="main">
      <div
        role="alert"
        className="bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center"
      >
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-red-100 text-red-800 rounded-full mb-4">
          403 · Access Denied
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Administrator permissions required
        </h1>
        <p className="text-slate-600 mb-6">
          You are signed in as <strong>{user?.name || 'a Student'}</strong> ({user?.role || 'student'}).
          Catalogue editing and publication tools are restricted to authorised library staff.
        </p>
        <Link
          to="/catalogue"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
        >
          Return to Student Catalogue
        </Link>
      </div>
    </main>
  );
};

export default AccessDenied;
