import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'DIRECTOR') {
      navigate('/director/dashboard');
    } else if (user?.role === 'ACCOUNTS') {
      navigate('/accounts/dashboard');
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/employee/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
          Error 404 • Not Found
        </span>

        <h1 className="text-2xl font-black text-slate-900 mt-4">Page Not Found</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          The requested page or voucher record does not exist or has been moved.
        </p>

        <button
          onClick={handleReturn}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Home</span>
        </button>
      </div>
    </div>
  );
};
