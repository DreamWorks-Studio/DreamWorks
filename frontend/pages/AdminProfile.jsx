import { Mail, Settings, LogOut, Edit } from 'lucide-react';

export default function AdminProfile({ userData }) {
  // Destructure user data from props with defaults
  const {
    name,
    email,
    role,
    joinDate,
    avatar = "/api/placeholder/150/150" // Default placeholder if no image is provided
  } = userData || {};

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header section with background accent */}
      <div className="w-full h-16 bg-amber-500" />
      
      {/* Profile content */}
      <div className="w-full px-6 py-4 -mt-12 flex flex-col items-center">
        {/* Avatar with border */}
        <div className="relative">
          <img 
            src={avatar} 
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <button className="absolute bottom-0 right-0 bg-amber-500 p-1 rounded-full shadow-md hover:bg-amber-600 transition-colors">
            <Edit size={16} className="text-white" />
          </button>
        </div>
        
        {/* User info */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <div className="flex items-center justify-center mt-1 text-gray-600">
            <Mail size={16} className="mr-1" />
            <span>{email}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{role}</p>
          <p className="text-xs text-gray-400 mt-1">Member since {joinDate}</p>
          
          {/* Action buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
              <Settings size={16} className="mr-2" />
              Settings
            </button>
            <button className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-md text-white transition-colors">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer section */}
      <div className="w-full px-6 py-3 mt-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500">
          © 2025 Your Company • <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}