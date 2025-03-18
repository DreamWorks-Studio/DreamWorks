import React, { useState } from 'react';
import { Home, Images, UsersRound, WalletCards, SquareLibrary, X, Menu, Search, Bell,TrendingUp, DollarSign, ShoppingCart, Settings } from 'lucide-react';
import AdminFinance from '../components/AdminFinance';
import AdminUser from '../components/AdminUser';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  // Sample data for the dashboard
  const revenueData = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 22000 },
    { month: 'Jun', amount: 30000 }
  ];

  // Render content based on active page
  const renderContent = () => {
    if (activePage === 'payments') {
      return (
        <div>
          <AdminFinance activePage={activePage} />
        </div>
      );

    } else if (activePage === 'images') {
      return (
        <div>

        </div>
      );

    } else if (activePage === 'packages') {
      return (
        <div>

        </div>
      );

    } else if (activePage === 'user') {
      return (
        <div>
           <AdminUser />
        </div>
      );

    } else {
      return (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-800">$124,563</h3>
                  <p className="text-green-500 text-sm flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +12.5%
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <DollarSign size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">New Orders</p>
                  <h3 className="text-2xl font-bold text-gray-800">243</h3>
                  <p className="text-green-500 text-sm flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +5.2%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Users</p>
                  <h3 className="text-2xl font-bold text-gray-800">1,254</h3>
                  <p className="text-green-500 text-sm flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +8.1%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UsersRound size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Tasks</p>
                  <h3 className="text-2xl font-bold text-gray-800">28</h3>
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1 transform rotate-180" /> -2.4%
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Settings size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } 
  };

  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-950 shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <div className="text-xl font-bold text-white">AdminPanel</div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 border-2 rounded-lg text-gray-100 border-gray-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 ml-">
          <ul>
            <li>
              <button 
                onClick={() => setActivePage('dashboard')} 
                className={`flex items-center w-full p-3 ${activePage === 'dashboard' ? 'bg-white text-gray-950' : 'text-white'}`}
              >
                <Home size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Profile</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage('images')} 
                className={`flex items-center w-full p-3 ${activePage === 'images' ? 'bg-white text-gray-950' : 'text-white'}`}
              >
                <Images size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Gallery</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage('user')} 
                className={`flex items-center w-full p-3 ${activePage === 'user' && <AdminUser/> ? 'bg-white text-gray-950' : 'text-white'}`}
              >
                <UsersRound size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage('payments')} 
                className={`flex items-center w-full p-3 ${activePage === 'payments' ? 'bg-white text-gray-950' : 'text-white'}`}
              >
                <WalletCards size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Finance</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage('packages')} 
                className={`flex items-center w-full p-3 ${activePage === 'packages' ? 'bg-white text-gray-950' : 'text-white'}`}
              >
                <SquareLibrary size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Packages</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center rounded-md bg-gray-100 px-3 py-2 w-64">
              <Search size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
              />
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="ml-4 px-4 py-2 border rounded-full">Logout</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;