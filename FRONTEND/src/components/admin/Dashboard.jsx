import React from 'react';



const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-pink-100">
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

