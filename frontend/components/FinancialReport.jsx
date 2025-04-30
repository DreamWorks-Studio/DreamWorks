import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, FileText, BarChart2, ChevronDown, Download, Printer, Clock } from 'lucide-react';

const FinancialReports = ({ isOpen, onClose, paymentData }) => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    partialRevenue: 0,
    totalTransactions: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    partialTransactions: 0
  });
  
  const modalRef = useRef(null);

  // Set default date ranges based on report type
  useEffect(() => {
    const today = new Date();
    let startDate = new Date();
    
    switch(reportType) {
      case 'daily':
        // Today
        setDateRange({
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        });
        break;
      case 'weekly':
        // Last 7 days
        startDate.setDate(today.getDate() - 6);
        setDateRange({
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        });
        break;
      case 'monthly':
        // Current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        });
        break;
      case 'yearly':
        // Current year
        startDate = new Date(today.getFullYear(), 0, 1);
        setDateRange({
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        });
        break;
      default:
        break;
    }
  }, [reportType]);

  // Generate report when date range or payment data changes
  useEffect(() => {
    if (!paymentData || paymentData.length === 0) return;
    
    generateReport();
  }, [dateRange, paymentData]);
  
  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const generateReport = () => {
    if (!paymentData || !dateRange.start || !dateRange.end) return;
    
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    // Filter payments within date range
    const filteredPayments = paymentData.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    setReportData(filteredPayments);
    
    // Calculate summary
    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const paidPayments = filteredPayments.filter(payment => payment.paymentStatus === 'paid');
    const pendingPayments = filteredPayments.filter(payment => payment.paymentStatus === 'pending');
    const partialPayments = filteredPayments.filter(payment => payment.paymentStatus === 'partial');
    
    const paidRevenue = paidPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const pendingRevenue = filteredPayments.reduce((sum, payment) => {
      if (payment.paymentStatus === 'pending') {
        return sum + ((payment.totalAmount || 0) - (payment.amountPaid || 0));
      }
      return sum;
    }, 0);
    const partialRevenue = filteredPayments.reduce((sum, payment) => {
      if (payment.paymentStatus === 'partial') {
        return sum + ((payment.totalAmount || 0) - (payment.amountPaid || 0));
      }
      return sum;
    }, 0);
    
    setSummary({
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      partialRevenue,
      totalTransactions: filteredPayments.length,
      paidTransactions: paidPayments.length,
      pendingTransactions: pendingPayments.length,
      partialTransactions: partialPayments.length
    });
  };

  const exportToCSV = () => {
    const reportTitle = getReportTitle();
    const headers = ["Date", "Booking ID", "Customer", "Package", "Total Amount", "Paid Amount", "Status", "Method"];
    const rows = reportData.map(payment => [
      new Date(payment.createdAt).toLocaleDateString(),
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
    link.setAttribute('download', `${reportTitle.replace(/\s/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const printReport = () => {
    const reportTitle = getReportTitle();
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #f59e0b; margin-bottom: 5px; }
            h2 { color: #4b5563; font-size: 16px; margin-bottom: 20px; }
            .date-range { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f59e0b; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .status { padding: 5px 10px; border-radius: 12px; font-size: 12px; }
            .paid { background-color: #10b981; color: white; }
            .pending { background-color: #6b7280; color: white; }
            .partial { background-color: #f59e0b; color: white; }
            .summary { margin-top: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .summary-box { background-color: #f9fafb; padding: 15px; border-radius: 8px; }
            .summary-title { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
            .summary-value { color: #111827; font-size: 24px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <h2>Financial Report</h2>
          <div class="date-range">
            Period: ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-grid">
              <div class="summary-box">
                <div class="summary-title">Total Revenue</div>
                <div class="summary-value">Rs.${summary.totalRevenue.toFixed(2)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Total Transactions</div>
                <div class="summary-value">${summary.totalTransactions}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Paid Revenue</div>
                <div class="summary-value">Rs.${summary.paidRevenue.toFixed(2)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Pending Revenue</div>
                <div class="summary-value">Rs.${summary.pendingRevenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          <h3>Transaction Details</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(payment => `
                <tr>
                  <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>${payment.bookingId?.fullName || '-'}</td>
                  <td>${payment.bookingId?.packageType || '-'}</td>
                  <td>Rs.${payment.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>Rs.${payment.amountPaid?.toFixed(2) || '0.00'}</td>
                  <td><span class="status ${payment.paymentStatus}">${payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
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
  
  const getReportTitle = () => {
    const startDate = new Date(dateRange.start).toLocaleDateString();
    const endDate = new Date(dateRange.end).toLocaleDateString();
    
    switch(reportType) {
      case 'daily':
        return `Daily Report - ${startDate}`;
      case 'weekly':
        return `Weekly Report - ${startDate} to ${endDate}`;
      case 'monthly':
        return `Monthly Report - ${startDate} to ${endDate}`;
      case 'yearly':
        return `Yearly Report - ${startDate} to ${endDate}`;
      default:
        return `Custom Report - ${startDate} to ${endDate}`;
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <BarChart2 size={24} />
            <div>
              <h2 className="text-xl font-semibold">Finance Reports</h2>
              <p className="text-amber-100 text-sm">Generate customized financial reports</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-amber-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Report Controls */}
        <div className="px-6 py-4 bg-gray-50 flex flex-wrap items-center gap-4 border-b border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Report Type</label>
            <div className="relative inline-block">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 w-32 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={printReport}
              className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        {/* Report Summary */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-amber-500" />
            {getReportTitle()}
          </h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-800">Rs.{summary.totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.totalTransactions} transactions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-500">Paid Revenue</div>
              <div className="text-2xl font-bold text-gray-800">Rs.{summary.paidRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.paidTransactions} transactions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="text-sm text-gray-500">Partial Payments</div>
              <div className="text-2xl font-bold text-gray-800">Rs.{summary.partialRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.partialTransactions} transactions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
              <div className="text-sm text-gray-500">Pending Revenue</div>
              <div className="text-2xl font-bold text-gray-800">Rs.{summary.pendingRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.pendingTransactions} transactions</div>
            </div>
          </div>
        </div>
        
        {/* Report Data Table */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {reportData.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No transactions found in the selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Customer</th>
                      <th className="py-3 px-4 text-left font-medium">Package</th>
                      <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Paid Amount</th>
                      <th className="py-3 px-4 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((payment, index) => (
                      <tr 
                        key={payment.id || index} 
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-3 px-4 border-b border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-100 font-medium">{payment.bookingId?.fullName || '-'}</td>
                        <td className="py-3 px-4 border-b border-gray-100">{payment.bookingId?.packageType || '-'}</td>
                        <td className="py-3 px-4 border-b border-gray-100">Rs.{payment.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 border-b border-gray-100">Rs.{payment.amountPaid?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 border-b border-gray-100 text-center">
                          <span className={`
                            px-3 py-1 rounded-full text-white text-xs font-medium
                            ${payment.paymentStatus === 'paid' ? 'bg-green-500' :
                              payment.paymentStatus === 'pending' ? 'bg-gray-500' :
                              payment.paymentStatus === 'partial' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }
                          `}>
                            {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <div>
              {reportData.length > 0 && 
                `Showing ${reportData.length} transaction${reportData.length !== 1 ? 's' : ''}`
              }
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={14} className="text-amber-500" />
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;