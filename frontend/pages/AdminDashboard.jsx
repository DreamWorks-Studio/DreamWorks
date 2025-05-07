import React, { useState, useEffect } from 'react';
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
  Calendar,
  MessageSquare,
  LogOut,
  Image,
  Aperture,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPackages from '../components/AdminPackages';
import Adminbooking from '../components/Adminbooking';
import AdminPortfolio from '../components/AdminPortfolio';
import AdminUser from '../components/AdminUser';
import AdminFinance from '../components/AdminFinance';
import AdminContact from '../components/AdminContact';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [userChange, setUserChange] = useState(0);
  const [bookingChange, setBookingChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revenueChange, setRevenueChange] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [totalBookingsThisMonth, setTotalBookingsThisMonth] = useState(0);
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [packageBookingCounts, setPackageBookingCounts] = useState({});
  const [topPackages, setTopPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Try to fetch revenue data
        try {
          const revenueResponse = await fetch('http://localhost:5003/api/payments/getAllPayments');
          if (revenueResponse.ok) {
            const revenueData = await revenueResponse.json();
            const totalRev = revenueData.reduce((acc, payment) => {
              return acc + (payment.amountPaid || 0);
            }, 0);
            setTotalRevenue(totalRev);

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const thisMonthRevenue = revenueData
              .filter(payment => {
                const paymentDate = new Date(payment.createdAt);
                return paymentDate.getMonth() === currentMonth &&
                  paymentDate.getFullYear() === currentYear;
              })
              .reduce((acc, payment) => {
                return acc + (payment.amountPaid || 0);
              }, 0);

            setRevenueThisMonth(thisMonthRevenue);
          }
        } catch (error) {
          console.error('Error fetching revenue data:', error);
          setTotalRevenue(0);
          setRevenueThisMonth(0);
        }

        // Try to fetch users data
        try {
          const usersResponse = await fetch('http://localhost:5003/api/user/getusers', {
            credentials: 'include'  // Add this line to include cookies
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setTotalUsers(usersData.length || 0);
          } else {
            console.warn('Failed to fetch users, status:', usersResponse.status);
            // Set a default value or leave as 0
            setTotalUsers(0);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          setTotalUsers(0);
        }

        let totalBookingsThisMonth = 0;

        try {
          const bookingsResponse = await fetch('http://localhost:5003/api/booking/display-summary');
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0;
            setTotalBookings(bookingsCount);
            if (Array.isArray(bookingsData)) {
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();
              const thisMonthBookings = bookingsData.filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate.getMonth() == currentMonth &&
                  bookingDate.getFullYear() == currentYear;
              });
              totalBookingsThisMonth = thisMonthBookings.length;
            }

            // Now fetch packages and calculate stats after we have the bookings data
            try {
              // Fetch packages
              const packagesResponse = await fetch('http://localhost:5003/api/package/viewPackages');

              if (packagesResponse.ok) {
                const packagesData = await packagesResponse.json();

                // Create a map of package ID to package details
                const packageMap = {};
                packagesData.forEach(pkg => {
                  packageMap[pkg._id] = pkg;
                });

                // Count bookings by package
                const packageCounts = {};

                // Process Array of bookings
                if (Array.isArray(bookingsData)) {
                  bookingsData.forEach(booking => {
                    const packageId = booking.packageId;
                    const packageType = booking.packageType;

                    // If we have a packageId, count it
                    if (packageId) {
                      packageCounts[packageId] = (packageCounts[packageId] || 0) + 1;
                    }
                    // Otherwise try to match by package type
                    else if (packageType) {
                      // Find matching package by name
                      const matchingPackage = packagesData.find(pkg =>
                        pkg.packagename.toLowerCase() === packageType.toLowerCase()
                      );

                      if (matchingPackage) {
                        packageCounts[matchingPackage._id] = (packageCounts[matchingPackage._id] || 0) + 1;
                      }
                    }
                  });
                }

                // Sort packages by booking count and take top 3
                const sortedPackages = Object.keys(packageCounts)
                  .map(packageId => ({
                    id: packageId,
                    name: packageMap[packageId] ? packageMap[packageId].packagename : 'Unknown Package',
                    price: packageMap[packageId] ? packageMap[packageId].packagePrice : 0,
                    count: packageCounts[packageId]
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3);

                setPackageBookingCounts(packageCounts);
                setTopPackages(sortedPackages);
              }
            } catch (error) {
              console.error('Error fetching package statistics:', error);
            } finally {
              setPackagesLoading(false);
            }
          }
          setBookingChange(3.8);
        } catch (error) {
          console.error('Error fetching bookings data:', error);
          // Set default value
          setTotalBookings(0);
          totalBookingsThisMonth = 0;
          setPackagesLoading(false);
        }

        setTotalBookingsThisMonth(totalBookingsThisMonth);

        try {
          const bookingsResponse = await fetch('http://localhost:5003/api/booking/recent-bookings');
          if (bookingsResponse.ok) {
            const recentBookingsData = await bookingsResponse.json();
            setRecentBookings(recentBookingsData);
          }
        } catch (error) {
          console.error('Error fetching recent bookings:', error);
        }

        try {
          const paymentsResponse = await fetch('http://localhost:5003/api/payments/getAllPayments');
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            const sortedPayments = Array.isArray(paymentsData)
              ? [...paymentsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
              : [];
            setRecentPayments(sortedPayments);
          }
        } catch (error) {
          console.error('Error fetching recent payments:', error);
        }

      } catch (error) {
        console.error('Error in dashboard data fetching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent page refresh if Enter key is pressed in the search input
      if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    window.location.href = "/sign-in"; // Redirect to login page
  };

  const handleGlobalSearch = (e) => {
    const value = e.target.value;
    setGlobalSearchTerm(value);

    if (value.trim().length > 2) {
      performGlobalSearch(value);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const performGlobalSearch = async (query) => {
    setIsSearching(true);
    const results = [];
    const searchQuery = query.toLowerCase();

    try {
      // Search in bookings
      if (recentBookings && recentBookings.length > 0) {
        const bookingMatches = recentBookings.filter(booking =>
          booking.fullName?.toLowerCase().includes(searchQuery) ||
          booking.email?.toLowerCase().includes(searchQuery) ||
          booking.packageType?.toLowerCase().includes(searchQuery)
        ).map(booking => ({
          id: booking._id,
          type: 'booking',
          title: `Booking: ${booking.fullName || 'Unnamed'}`,
          subtitle: `Package: ${booking.packageType || 'N/A'}`,
          icon: Calendar,
          date: new Date(booking.date).toLocaleDateString(),
          page: 'booking'
        }));

        results.push(...bookingMatches);
      }

      // Search in packages
      try {
        const packagesResponse = await fetch('http://localhost:5003/api/package/viewPackages');
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();

          const packageMatches = packagesData.filter(pkg =>
            pkg.packagename?.toLowerCase().includes(searchQuery) ||
            pkg.packageDetails?.toLowerCase().includes(searchQuery)
          ).map(pkg => ({
            id: pkg._id,
            type: 'package',
            title: `Package: ${pkg.packagename}`,
            subtitle: `Rs.${pkg.packagePrice}`,
            icon: SquareLibrary,
            page: 'packages'
          }));

          results.push(...packageMatches);
        }
      } catch (error) {
        console.error('Error searching packages:', error);
      }

      // Search in payments
      if (recentPayments && recentPayments.length > 0) {
        const paymentMatches = recentPayments.filter(payment =>
          payment.bookingId?.fullName?.toLowerCase().includes(searchQuery) ||
          payment.paymentMethod?.toLowerCase().includes(searchQuery)
        ).map(payment => ({
          id: payment._id,
          type: 'payment',
          title: `Payment: ${payment.bookingId?.fullName || 'Unnamed'}`,
          subtitle: `Rs.${payment.amountPaid}`,
          icon: DollarSign,
          date: new Date(payment.createdAt).toLocaleDateString(),
          page: 'payments'
        }));

        results.push(...paymentMatches);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (e, result) => {
    e.preventDefault(); // Prevent default browser behavior
    
    // Set which page we want to navigate to
    setActivePage(result.page);
    
    // Store the selected item information in session storage
    sessionStorage.setItem('searchResultItem', JSON.stringify({
      id: result.id,
      type: result.type,
      timestamp: Date.now()
    }));
    
    // Close the search results and clear the input
    setShowSearchResults(false);
    setGlobalSearchTerm('');
  };

  const handlePageTransition = (newPage) => {
    if (newPage === activePage) return;

    setIsPageTransitioning(true);

    // Delay the page change to allow for animation
    setTimeout(() => {
      setActivePage(newPage);
      setIsPageTransitioning(false);
    }, 600);
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
    { id: 'images', title: 'Gallery', icon: Images },
    { id: 'user', title: 'Users', icon: UsersRound },
    { id: 'payments', title: 'Finance', icon: WalletCards },
    { id: 'packages', title: 'Packages', icon: SquareLibrary },
    { id: 'booking', title: 'Bookings', icon: Calendar },
    { id: 'contact', title: 'Contact', icon: MessageSquare }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderContent = () => {

    const cardVariants = {
      hidden: { opacity: 1, y: 0 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: [0.98, 1],
        transition: {
          delay: 0.1 + (i * 0.05),
          duration: 0.4,
          ease: "easeOut"
        }
      })
    };

    const PageTransition = ({ children }) => (
      <motion.div
        initial="hidden"
        animate={loading ? "hidden" : "visible"}
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.1,
              staggerChildren: 0.05
            }
          }
        }}
      >
        {children}
      </motion.div>
    );

    if (activePage === 'payments') {
      return <AdminFinance activePage={activePage} />;
    } else if (activePage === 'images') {
      return <AdminPortfolio activePage={activePage} />;
    } else if (activePage === 'packages') {
      return <AdminPackages activePage={activePage} />;
    } else if (activePage === 'user') {
      return <AdminUser activePage={activePage} />;
    } else if (activePage === 'booking') {
      return <Adminbooking activePage={activePage} />;
    } else if (activePage == 'contact') {
      return <AdminContact activePage={activePage}/>
    } else {
      return (
        <PageTransition>
          <div>
            <div className="mb-8 relative overflow-hidden">
              <motion.div
                className="bg-black/95 rounded-2xl p-8 pr-12 shadow-lg text-white relative overflow-hidden"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.23, 1, 0.32, 1], // Custom easing for a more professional feel
                  delay: 0.2 // Slight delay so it starts after initial load
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-full opacity-20">
                  <motion.div
                    initial={{ rotate: -15, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <Aperture size={280} className="absolute -right-8 -top-8 text-amber-500" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h1 className="text-3xl font-bold">Welcome to DreamWorks Studio</h1>
                </motion.div>

                <motion.p
                  className="text-white/70 mt-2 max-w-lg"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Manage your photography business with ease. Track bookings, clients, and finances all in one place.
                </motion.p>

                <motion.div
                  className="mt-6 flex space-x-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setActivePage('packages')}
                    className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg text-black font-medium transition-all flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Calendar size={18} className="mr-2" />
                    New Package
                  </motion.button>
                  <motion.button
                    onClick={() => setActivePage('images')}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Image size={18} className="mr-2" />
                    Upload Photos
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-8">
              {/* Revenue Card */}
              <motion.div
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-black/5 hover:shadow-lg transition-all"
                variants={cardVariants}
                custom={1}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="p-3 bg-amber-50 rounded-xl"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <DollarSign size={22} className="text-amber-600" />
                    </motion.div>
                    <h3 className="ml-3 text-lg font-semibold text-black/80">Revenue</h3>
                  </div>
                  {loading ? (
                    <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
                  ) : (
                    <div className="flex ml-4">
                      {/* Total revenue */}
                      <div className="flex-1">
                        <div className="flex items-baseline">
                          <h2 className="text-xl font-bold text-black/90">Rs.{totalRevenue.toLocaleString()}</h2>
                          <span className={`ml-2 text-sm px-2 py-0.5 rounded ${revenueChange >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <span className="flex items-center">
                              <TrendingUp size={12} className={`mr-1 ${revenueChange < 0 ? 'transform rotate-180' : ''}`} />
                              {revenueChange.toFixed(1)}%
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-black/60 mt-1">Total earnings</p>
                      </div>

                      {/* Vertical divider */}
                      <div className="mx-3 w-px bg-gray-300"></div>

                      {/* This month's revenue */}
                      <div className="flex-1 ml-4">
                        <div className="flex items-baseline">
                          <h2 className="text-xl font-bold text-black/90">Rs.{revenueThisMonth.toLocaleString()}</h2>
                        </div>
                        <p className="text-sm text-black/60 mt-1">This month</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bookings Card */}
              <motion.div
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-black/5 hover:shadow-lg transition-all"
                variants={cardVariants}
                custom={2}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <motion.div className="p-3 bg-amber-50 rounded-xl">
                      <Calendar size={22} className="text-amber-600" />
                    </motion.div>
                    <h3 className="ml-3 text-lg font-semibold text-black/80">Bookings</h3>
                  </div>
                  {loading ? (
                    <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
                  ) : (
                    <div className="flex ml-4" >
                      {/* Total bookings */}
                      <div className="flex-1">
                        <div className="flex items-baseline">
                          <h2 className="text-2xl font-bold text-black/90">{totalBookings}</h2>
                          <span className={`ml-2 text-sm px-2 py-0.5 rounded ${bookingChange >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <span className="flex items-center">
                              <TrendingUp size={12} className={`mr-1 ${bookingChange < 0 ? 'transform rotate-180' : ''}`} />
                              {bookingChange.toFixed(1)}%
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-black/60 mt-1">Total Bookings</p>
                      </div>

                      {/* Vertical divider */}
                      <div className="mx-3 w-px bg-gray-300"></div>

                      {/* This month's bookings */}
                      <div className="flex-1 ml-7">
                        <div className="flex items-baseline">
                          <h2 className="text-2xl font-bold text-black/90">{totalBookingsThisMonth}</h2>
                        </div>
                        <p className="text-sm text-black/60 mt-1">For This month</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-black/5 hover:shadow-lg transition-all"
                variants={cardVariants}
                custom={3}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="p-3 bg-amber-50 rounded-xl"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <SquareLibrary size={22} className="text-amber-600" />
                    </motion.div>
                    <h3 className="ml-3 text-lg font-semibold text-black/80">Popular Packages</h3>
                  </div>
                  {loading || packagesLoading ? (
                    <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
                  ) : (
                    <div className="flex ml-4">
                      {/* Top package with count - left side */}
                      <div className="flex-1">
                        <div className="flex items-baseline">
                          <h2 className="text-2xl font-bold text-black/90">
                            {topPackages.length > 0 ? topPackages[0].count : 0}
                          </h2>
                          <span className="ml-2 text-sm px-2 py-0.5 rounded bg-green-100 text-green-600">
                            <span className="flex items-center">
                              <TrendingUp size={12} className="mr-1" />
                              {topPackages.length > 0 ? '↑' : ''}2.3%
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-black/60 mt-1">
                          {topPackages.length > 0 ? topPackages[0].name : 'No packages'}
                        </p>
                      </div>

                      {/* Vertical divider - exactly like the user card */}
                      <div className="mx-3 w-px bg-gray-200"></div>

                      {/* Monthly bookings - right side */}
                      <div className="flex-1 ml-7">
                        <div className="flex items-baseline">
                          <h2 className="text-2xl font-bold text-black/90">
                            {topPackages.length > 1 ? topPackages[1].count : 0}
                          </h2>
                        </div>
                        <p className="text-sm text-black/60 mt-1">
                          {topPackages.length > 1 ? topPackages[1].name : 'No packages'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

            </div>

            {/* Recent Activity Section */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              variants={cardVariants}
              custom={5}
            >
              <motion.div
                className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-black/5"
                variants={cardVariants}
                custom={6}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-black/80">Recent Bookings</h3>
                  <motion.button
                    onClick={() => setActivePage('booking')}
                    className="text-amber-600 text-sm font-medium flex items-center hover:text-amber-700 transition-colors group"
                    whileHover={{ scale: 1.05 }}
                  >
                    View all
                    <motion.span
                      className="ml-1"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    ><ArrowRight size={16} className="ml-1" /></motion.span>
                  </motion.button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-black/50">Client</th>
                        <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-black/50">Type</th>
                        <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-black/50">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-black/50">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {loading ? (
                        // Loading state - show skeleton rows
                        [1, 2, 3].map((index) => (
                          <tr key={index}>
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-black/80">
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-black/70">
                              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-black/70">
                              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      ) : recentBookings.length > 0 ? (
                        // Display real booking data
                        recentBookings.map((booking, index) => (
                          <tr key={index} className="hover:bg-black/5 transition-colors">
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-black/80">
                              {booking.fullName || "Unknown"}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-black/70">
                              {booking.packageType || "N/A"}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-black/70">
                              {booking.date ? new Date(booking.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "N/A"}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs rounded-full bg-${booking.status === "Completed" ? "green" :
                                booking.status === "In Progress" ? "blue" : "amber"
                                }-100 text-${booking.status === "Completed" ? "green" :
                                  booking.status === "In Progress" ? "blue" : "amber"
                                }-800 font-medium`}>
                                {booking.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        // No bookings found
                        <tr>
                          <td colSpan="4" className="py-4 px-4 text-center text-black/50">
                            No recent bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl shadow-md p-6 border border-black/5"
                variants={cardVariants}
                custom={7}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-black/80">Recent Payments</h3>
                  <motion.button
                    onClick={() => setActivePage('payments')}
                    className="text-amber-600 text-sm font-medium flex items-center hover:text-amber-700 transition-colors group"
                    whileHover={{ scale: 1.05 }}
                  >
                    View all<motion.span
                      className="ml-1"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    ><ArrowRight size={16} className="ml-1" /></motion.span>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    // Loading state - show skeleton payment cards
                    [1, 2, 3].map((index) => (
                      <div key={index} className="flex items-center p-3 rounded-xl">
                        <div className="p-2 bg-gray-200 rounded-xl w-8 h-8 animate-pulse"></div>
                        <div className="ml-3 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    ))
                  ) : recentPayments.length > 0 ? (
                    // Display real payment data
                    recentPayments.map((payment, index) => (
                      <div key={index} className="flex items-center p-3 rounded-xl hover:bg-black/5 transition-colors">
                        <div className="p-2 bg-amber-50 rounded-xl">
                          <DollarSign size={16} className="text-amber-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-black/80">
                            {payment.bookingId?.packageType || "Payment"}
                            {payment.paymentType ? ` (${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)})` : ""}
                          </p>
                          <p className="text-xs text-black/50">
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : "Unknown date"}
                          </p>
                        </div>
                        <span className="text-green-600 font-medium">
                          +Rs.{payment.amountPaid?.toLocaleString() || "0"}
                        </span>
                      </div>
                    ))
                  ) : (
                    // No payments found
                    <div className="text-center py-4 text-black/50">
                      No recent payments found
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </PageTransition>
      );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-black shadow-xl transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <Aperture size={28} className="text-amber-500" />
              <div className="text-lg font-bold text-white">DreamWorks Studio.</div>
            </div>
          ) : (
            <Aperture size={28} className="text-amber-500 mx-auto" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <motion.button
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center w-full p-3 rounded-xl transition-all ${activePage === item.id
                    ? 'bg-amber-500 text-black font-medium'
                    : 'text-white/80 hover:bg-white/10'
                    }`}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex-shrink-0"
                  >
                    <item.icon size={20} />
                  </motion.div>
                  {sidebarOpen && (
                    <span className="ml-3 font-medium">{item.title}</span>
                  )}
                </motion.button>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full p-3 rounded-xl transition-colors text-white/70 hover:bg-white/10`}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm z-20 p-6 flex justify-between items-center sticky top-0 border-b border-black/5">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-black/80 hidden sm:block">
              {getGreeting()}, Admin | <span className="text-amber-600">{navItems.find(item => item.id === activePage)?.title || 'Dashboard'}</span>
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search
                size={18}
                className={`text-black/40 absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'text-amber-500 animate-pulse' : ''}`}
              />
              <input
                type="text" // Explicitly set type to text
                placeholder="Search..."
                value={globalSearchTerm}
                onChange={handleGlobalSearch}
                className="bg-black/5 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring focus:ring-amber-200 w-64 text-sm"
                onKeyDown={(e) => {
                  // Prevent form submission on Enter key
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                onFocus={() => {
                  if (globalSearchTerm.trim().length > 2) {
                    setShowSearchResults(true);
                  }
                }}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full mt-1 left-0 w-72 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                      <span className="ml-2 text-gray-500">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((result) => (
                        <div
                        key={`${result.type}-${result.id}`}
                        className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onMouseDown={(e) => handleSearchResultClick(e, result)}
                      >
                          <div className="flex items-center">
                            <div className="p-2 bg-amber-100 rounded-lg mr-3">
                              {result.icon && <result.icon size={16} className="text-amber-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{result.title}</p>
                              <p className="text-xs text-gray-500 flex items-center justify-between">
                                <span>{result.subtitle}</span>
                                {result.date && <span className="text-gray-400">{result.date}</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {globalSearchTerm.trim().length > 0 ? 'No results found' : 'Type to search'}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-black/5 relative">
              <Bell size={20} className="text-black/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {/* User Avatar - Updated with Redux user data */}
            <div className="flex items-center space-x-2">
              {currentUser ? (
                <>
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                    <img
                      src={currentUser.avatar || "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif"}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-black/80 hidden md:block">
                    {currentUser.username || "Admin"}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                    <span className="font-medium text-white">A</span>
                  </div>
                  <span className="text-sm font-medium text-black/70 hidden md:block">Admin</span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-16">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;