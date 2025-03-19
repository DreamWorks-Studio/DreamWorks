import React, { useState } from "react";
import {
  Home,
  Images,
  UsersRound,
  WalletCards,
  SquareLibrary,
  X,
  Menu,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Settings,
} from "lucide-react";
import AdminFinance from "../components/AdminFinance";
import AdminUser from "../components/AdminUser";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // Sample data for the dashboard
  const revenueData = [
    { month: "Jan", amount: 12000 },
    { month: "Feb", amount: 19000 },
    { month: "Mar", amount: 15000 },
    { month: "Apr", amount: 25000 },
    { month: "May", amount: 22000 },
    { month: "Jun", amount: 30000 },
  ];

  // Logout function placeholder (you can replace it with actual logic)
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    window.location.href = "/sign-in"; // Redirect to login page
  };

  // Render content based on active page
  const renderContent = () => {
    switch (activePage) {
      case "payments":
        return <AdminFinance activePage={activePage} />;
      case "user":
        return <AdminUser  activePage={activePage}/>;
      case "images":
      case "packages":
        return <div className="text-center text-gray-500">Coming Soon...</div>;
      default:
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening today.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <DashboardCard
                title="Total Revenue"
                value="$124,563"
                icon={<DollarSign size={24} className="text-indigo-600" />}
                percentage="+12.5%"
                color="indigo"
              />
              <DashboardCard
                title="New Orders"
                value="243"
                icon={<ShoppingCart size={24} className="text-blue-600" />}
                percentage="+5.2%"
                color="blue"
              />
              <DashboardCard
                title="Active Users"
                value="1,254"
                icon={<UsersRound size={24} className="text-green-600" />}
                percentage="+8.1%"
                color="green"
              />
              <DashboardCard
                title="Pending Tasks"
                value="28"
                icon={<Settings size={24} className="text-yellow-600" />}
                percentage="-2.4%"
                color="yellow"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-950 shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Sidebar Toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <div className="text-xl font-bold text-white">AdminPanel</div>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 border-2 rounded-lg text-gray-100 border-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <NavItem icon={Home} title="Dashboard" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} sidebarOpen={sidebarOpen} />
          <NavItem icon={Images} title="Gallery" active={activePage === "images"} onClick={() => setActivePage("images")} sidebarOpen={sidebarOpen} />
          <NavItem icon={UsersRound} title="Users" active={activePage === "user"} onClick={() => setActivePage("user")} sidebarOpen={sidebarOpen} />
          <NavItem icon={WalletCards} title="Finance" active={activePage === "payments"} onClick={() => setActivePage("payments")} sidebarOpen={sidebarOpen} />
          <NavItem icon={SquareLibrary} title="Packages" active={activePage === "packages"} onClick={() => setActivePage("packages")} sidebarOpen={sidebarOpen} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md w-64">
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
            <button onClick={handleLogout} className="ml-4 px-4 py-2 border rounded-full">
              Logout
            </button>
            
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">{renderContent()}</main>
      </div>
    </div>
  );
};

/* Sidebar Navigation Item Component */
const NavItem = ({ icon: Icon, title, active, onClick, sidebarOpen }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 ${
      active ? "bg-white text-gray-950" : "text-white"
    }`}
  >
    <Icon size={20} className="flex-shrink-0" />
    {sidebarOpen && <span className="ml-3">{title}</span>}
  </button>
);

/* Dashboard Card Component */
const DashboardCard = ({ title, value, icon, percentage, color }) => (
  <div className={`bg-white rounded-lg shadow p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className={`text-${color}-500 text-sm flex items-center mt-1`}>
          <TrendingUp size={14} className="mr-1" /> {percentage}
        </p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;
