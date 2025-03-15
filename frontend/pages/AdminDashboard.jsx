import React, { useState } from 'react';
import { 
  Images, 
  UsersRound, 
  ShoppingCart, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Home, 
  Settings, 
  TrendingUp,
  DollarSign,
  WalletCards,
  SquareLibrary
} from 'lucide-react';

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
        <nav className="flex-1 overflow-y-auto py-4">
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
                className={`flex items-center w-full p-3 ${activePage === 'user' ? 'bg-white text-gray-950' : 'text-white'}`}
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
            </div>
          </div>
        </header>

        {/* Revenue Chart */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
            <select className="text-sm border rounded-md px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {revenueData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-600"
                  style={{ height: `${(item.amount / 30000) * 100}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-2">{item.month}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
