import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="mb-8">
          <ShoppingBag className="mx-auto h-16 w-16 text-pink-500 mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Oops! The beauty products you're looking for seem to have vanished into thin air.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors duration-200 gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-pink-600 text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50 transition-colors duration-200 gap-2 ml-0 sm:ml-4"
          >
            <Home className="h-5 w-5" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;