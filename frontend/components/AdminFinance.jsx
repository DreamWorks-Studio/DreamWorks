import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, DollarSign, CreditCard, RefreshCw, Download, Filter, Calendar, ChevronDown, Eye, ArrowUpDown, FileText, Printer, BarChart4, PieChart, AlertCircle, ChevronRight } from 'lucide-react';
import AutoGenReport from './AutoGenReport';
import FinancialReports from './FinancialReport';
import { motion } from 'framer-motion';

const AdminFinance = ({ }) => {
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showStats, setShowStats] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('http://localhost:5003/api/payments/getAllPayments')
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPaymentData(data);
          } else {
            setPaymentData([]);
            console.error("Unexpected API response:", data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching payments:', error);
          setLoading(false);
        })
    }, 75);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPayments = paymentData.filter(payment => {

    const matchesSearch = payment.bookingId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedFilter === "all" ||
      payment.paymentStatus === selectedFilter;

    const paymentDate = payment.createdAt ? new Date(payment.createdAt) : null;
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDateRange =
      !paymentDate ||
      !startDate ||
      !endDate ||
      (paymentDate >= startDate && paymentDate <= endDate);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const totalRevenue = paymentData.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
  const pendingRevenue = paymentData.reduce((sum, payment) => {
    if (payment.paymentStatus === 'pending' || payment.paymentStatus === 'partial') {
      return sum + ((payment.totalAmount || 0) - (payment.amountPaid || 0));
    }
    return sum;
  }, 0);
  const paidPayments = paymentData.filter(payment => payment.paymentStatus === 'paid').length;
  const pendingPayments = paymentData.filter(payment => payment.paymentStatus === 'pending').length;
  const partialPayments = paymentData.filter(payment => payment.paymentStatus === 'partial').length;
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const sortedPayments = [...filteredPayments];
  if (sortConfig.key) {
    sortedPayments.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key.includes('.')) {
        const [parent, child] = sortConfig.key.split('.');
        aValue = a[parent]?.[child] || '';
        bValue = b[parent]?.[child] || '';
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      if (sortConfig.direction === 'ascending') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ?
        <ArrowUpDown size={14} className="ml-1 text-amber-300" /> :
        <ArrowUpDown size={14} className="ml-1 text-amber-300 transform rotate-180" />;
    }
    return <ArrowUpDown size={14} className="ml-1 text-amber-200 opacity-50" />;
  };
  const exportToCSV = () => {
    const headers = ["Booking ID", "Customer", "Package", "Total Amount", "Paid Amount", "Payment Status", "Payment Method"];
    const rows = filteredPayments.map(payment => [
      payment.bookingId?._id || '-',
      payment.bookingId?.fullName || '-',
      payment.bookingId?.packageType || '-',
      payment.totalAmount?.toFixed(2) || '0.00',
      payment.amountPaid?.toFixed(2) || '0.00',
      payment.paymentStatus,
      payment.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #4f46e5; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .status { padding: 5px 10px; border-radius: 12px; font-size: 12px; }
            .paid { background-color: #10b981; color: white; }
            .pending { background-color: #6b7280; color: white; }
            .partial { background-color: #f59e0b; color: white; }
            .summary { margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>Payment Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map(payment => `
                <tr>
                  <td>${payment.bookingId?._id || '-'}</td>
                  <td>${payment.bookingId?.fullName || '-'}</td>
                  <td>${payment.bookingId?.packageType || '-'}</td>
                  <td>Rs.${payment.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>Rs.${payment.amountPaid?.toFixed(2) || '0.00'}</td>
                  <td><span class="status ${payment.paymentStatus}">${payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}</span></td>
                  <td>${payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Revenue: Rs.${totalRevenue.toFixed(2)}</p>
            <p>Pending Revenue: Rs.${pendingRevenue.toFixed(2)}</p>
            <p>Paid Payments: ${paidPayments}</p>
            <p>Pending Payments: ${pendingPayments}</p>
            <p>Partial Payments: ${partialPayments}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  useEffect(() => {
    const searchResultItem = sessionStorage.getItem('searchResultItem');
    if (searchResultItem) {
      const resultData = JSON.parse(searchResultItem);
      
      if (resultData.type === 'payment' && Date.now() - resultData.timestamp < 2000) {
        const paymentToHighlight = paymentData.find(payment => payment._id === resultData.id);
        
        if (paymentToHighlight) {
          // For payments, you might want to:
          viewPaymentDetails(paymentToHighlight);
        }
        
        sessionStorage.removeItem('searchResultItem');
      }
    }
  }, [paymentData]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Camera size={24} className="text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-800">Finance</h1>
          </motion.div>
          <div
            className="flex items-center text-sm text-gray-500 mt-2"
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <button
              onClick={() => handleNavigate("/admin", () => { /* set your active page callback here */ })}
              className="hover:text-amber-600 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              Dashboard
            </button>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-amber-600 font-medium">Finance</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReports(true)}
            className="bg-white text-amber-500 flex items-center gap-2 px-4 py-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200 group overflow-hidden"
            title="Generate Reports"
          >
            <PieChart size={18} />
            <span className="max-w-0 whitespace-nowrap overflow-hidden group-hover:max-w-20 transition-all duration-300 ease-in-out">Reports</span>
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white text-amber-500 flex items-center gap-2 px-4 py-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200 group overflow-hidden"
            title="Toggle Statistics"
          >
            <BarChart4 size={18} />
            <span className="max-w-0 whitespace-nowrap overflow-hidden group-hover:max-w-20 transition-all duration-300 ease-in-out">Statistics</span>
          </button>

          <button
            onClick={printReport}
            className="bg-white text-amber-500 flex items-center gap-2 px-4 py-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200 group overflow-hidden"
            title="Print Report"
          >
            <Printer size={18} />
            <span className="max-w-0 whitespace-nowrap overflow-hidden group-hover:max-w-20 transition-all duration-300 ease-in-out">Print</span>
          </button>

          <button
            onClick={exportToCSV}
            className="bg-white text-amber-500 flex items-center gap-2 px-4 py-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200 group overflow-hidden"
            title="Export to CSV"
          >
            <Download size={18} />
            <span className="max-w-0 whitespace-nowrap overflow-hidden group-hover:max-w-20 transition-all duration-300 ease-in-out">Export</span>
          </button>

          <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2 w-64">
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-amber-500 px-4 py-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Filter size={16} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedFilter("all")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedFilter === "all" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedFilter("paid")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedFilter === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => setSelectedFilter("partial")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedFilter === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Partial
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedFilter("all");
                      setDateRange({ start: "", end: "" });
                    }}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-amber-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="bg-white text-amber-500 p-2 rounded-full shadow-md border border-gray-100 hover:bg-amber-50 transition-colors duration-200"
            onClick={() => {
              setLoading(true);
              fetch('http://localhost:5004/api/payments/getAllPayments')
                .then((response) => response.json())
                .then((data) => {
                  if (Array.isArray(data)) {
                    setPaymentData(data);
                  }
                  setLoading(false);
                })
                .catch((error) => {
                  console.error('Error refreshing payments:', error);
                  setLoading(false);
                });
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards - No animation, centered */}
      {showStats && (
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-4 gap-4 w-full">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-800">Rs.{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <DollarSign size={20} className="text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Pending Revenue</p>
                  <p className="text-xl font-bold text-gray-800">Rs.{pendingRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <AlertCircle size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Paid Payments</p>
                  <p className="text-xl font-bold text-gray-800">{paidPayments}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign size={20} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Partial Payments</p>
                  <p className="text-xl font-bold text-gray-800">{partialPayments}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <AlertCircle size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Table with smooth loading transition */}
      <div
        className="bg-white rounded-xl overflow-hidden transition-all duration-500 border border-gray-100"
        style={{
          maxHeight: loading ? '0' : '2000px',
          opacity: loading ? 0 : 1,
          transition: 'max-height 0.5s ease-in-out, opacity 0.3s ease-in-out'
        }}
      >
        {loading ? (
          <div className="p-16 text-center overflow-hidden">
            <div className="relative mx-auto mb-4 w-20 h-20">
              {/* Camera body */}
              <div className="absolute inset-0 bg-gray-800 rounded-lg shadow-lg"></div>

              {/* Camera lens with pulsing aperture effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flash reflection effect */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full opacity-70 animate-pulse"></div>

              {/* Camera viewfinder */}
              <div className="absolute top-0 left-1/4 w-8 h-2 bg-gray-700 rounded-sm"></div>

              {/* Shutter animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full">
                <div className="w-full h-full border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium mt-4">Processing your studio data...</p>
          </div>
        ) : paymentData.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">

                  <th className="py-4 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('bookingId.fullName')}>
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('bookingId.fullName')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('bookingId.packageType')}>
                    <div className="flex items-center">
                      Package
                      {getSortIcon('bookingId.packageType')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('totalAmount')}>
                    <div className="flex items-center">
                      Total Amount
                      {getSortIcon('totalAmount')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('amountPaid')}>
                    <div className="flex items-center">
                      Paid Amount
                      {getSortIcon('amountPaid')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center font-medium cursor-pointer" onClick={() => handleSort('paymentStatus')}>
                    <div className="flex items-center justify-center">
                      Payment Status
                      {getSortIcon('paymentStatus')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center font-medium cursor-pointer" onClick={() => handleSort('paymentMethod')}>
                    <div className="flex items-center justify-center">
                      Payment Method
                      {getSortIcon('paymentMethod')}
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((payment, index) => (
                  <tr
                    key={payment.id || index}
                    className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                    transition-colors duration-150
                    ${hoveredRow === index ? 'bg-amber-400' : ''}
                   `}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="py-4 px-4 border-b border-gray-100 font-medium">{payment.bookingId?.fullName || '-'}</td>
                    <td className="py-4 px-4 border-b border-gray-100">{payment.bookingId?.packageType || '-'}</td>
                    <td className="py-4 px-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <span className="text-gray-800 font-medium">Rs.{payment.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <span className="text-gray-800">Rs.{payment.amountPaid?.toFixed(2) || '0.00'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-gray-100 text-center">
                      <span
                        className={`
                        px-4 py-1 rounded-full text-white text-xs font-medium
                        ${payment.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            payment.paymentStatus === 'pending' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                              payment.paymentStatus === 'partial' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                          }
                        shadow-sm
                      `}>
                        {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-gray-100 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`
                          flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                          ${payment.paymentMethod === 'cash' ?
                              'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-purple-50 text-purple-700 border border-purple-200'
                            }
                        `}>
                          {payment.paymentMethod === 'cash' ?
                            <DollarSign size={12} /> :
                            <CreditCard size={12} />
                          }
                          {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-gray-100 text-center">
                      <button
                        onClick={() => viewPaymentDetails(payment)}
                        className="text-amber-500 p-1.5 rounded hover:bg-amber-100 transition-colors"
                        title="View Payment Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading overlay that shows when loading state is true */}
      {loading && (
        <div className="p-12 text-center mt-4">
          <div className="relative mx-auto mb-6 w-16 h-16">
            {/* Circular spinner representing a lens focusing */}
            <div className="absolute inset-0 border-4 border-gray-200 border-opacity-30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>

            {/* Camera icon in the middle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={20} className="text-gray-700" />
            </div>

            {/* Pulsing light effect */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading studio payment data...</p>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <div>
          {!loading && filteredPayments.length > 0 &&
            `Showing ${filteredPayments.length} payment${filteredPayments.length !== 1 ? 's' : ''}`
          }
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-amber-600" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>


      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
              <h3 className="text-lg font-medium">Payment Details</h3>
              <button
                onClick={() => setShowPaymentDetails(false)}
                className="text-gray-200 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Customer</div>
                  <div className="font-medium">{selectedPayment.bookingId?.fullName || '-'}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Booking ID</div>
                  <div className="font-medium">{selectedPayment.bookingId?._id || '-'}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Package</div>
                  <div className="font-medium">{selectedPayment.bookingId?.packageType || '-'}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-gray-600">Booking Date</div>
                  <div className="font-medium">{selectedPayment.bookingId?.bookingDate ? new Date(selectedPayment.bookingId.bookingDate).toLocaleDateString() : '-'}</div>
                </div>
              </div>

              <h4 className="font-medium text-gray-800 mb-3">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="text-lg font-bold text-gray-800">Rs.{selectedPayment.totalAmount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Amount Paid</div>
                  <div className="text-lg font-bold text-gray-800">Rs.{selectedPayment.amountPaid?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <div className="flex items-center">
                    <span className={`
                      px-3 py-0.5 rounded-full text-white text-xs font-medium mt-1
                      ${selectedPayment.paymentStatus === 'paid' ? 'bg-green-500' :
                        selectedPayment.paymentStatus === 'pending' ? 'bg-gray-500' :
                          selectedPayment.paymentStatus === 'partial' ? 'bg-yellow-500' :
                            'bg-red-500'
                      }
                    `}>
                      {selectedPayment.paymentStatus.charAt(0).toUpperCase() + selectedPayment.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="flex items-center gap-1 mt-1">
                    {selectedPayment.paymentMethod === 'cash' ? <DollarSign size={16} className="text-blue-600" /> : <CreditCard size={16} className="text-purple-600" />}
                    <span className="font-medium">
                      {selectedPayment.paymentMethod.charAt(0).toUpperCase() + selectedPayment.paymentMethod.slice(1) || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Payment Date</div>
                  <div className="font-medium">{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : '-'}</div>
                </div>
                {selectedPayment.lastModified && (
                  <div className="flex justify-between">
                    <div className="text-gray-600">Last Modified</div>
                    <div className="font-medium">{new Date(selectedPayment.lastModified).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {selectedPayment.notes && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">{selectedPayment.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => AutoGenReport({ payment: selectedPayment })}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-black/80 transition-colors flex items-center gap-1"
              >
                <Printer size={16} />
                Print Receipt
              </button>
              <button
                onClick={() => setShowPaymentDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <FinancialReports
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        paymentData={paymentData}
      />
    </div>
  );
};

export default AdminFinance;