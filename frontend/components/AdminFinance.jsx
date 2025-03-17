import React, { useState, useEffect } from 'react';

const AdminFinance = ({ activePage }) => {
      const [paymentData, setPaymentData] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchPaymentData = async () => {
          try {
            setLoading(true);
            const response = await fetch('/api/getPayment');
            const data = await response.json();
            setPaymentData(data);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching payment data:', error);
            setLoading(false);
          }
        };
    
        if (activePage === 'payments') {
          fetchPaymentData();
        }
      }, [activePage]);

  return (
    <><div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
          <p className="text-gray-600">Payment History</p>
      </div><div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                  <div className="p-4 text-center">Loading payment data...</div>
              ) : paymentData.length === 0 ? (
                  <div className="p-4 text-center">No payment records found</div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="min-w-full">
                          <thead>
                              <tr className="bg-gray-700 text-white">
                                  <th className="py-3 px-4 text-left">Booking ID</th>
                                  <th className="py-3 px-4 text-left">Customer</th>
                                  <th className="py-3 px-4 text-left">Package</th>
                                  <th className="py-3 px-4 text-left">Total Amount</th>
                                  <th className="py-3 px-4 text-left">Paid Amount</th>
                                  <th className="py-3 px-4 text-center">Payment Status</th>
                                  <th className="py-3 px-4 text-center">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {paymentData.map((payment, index) => (
                                  <tr key={payment.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="py-3 px-4 border-b">{payment.booking?.bookingId || '-'}</td>
                                      <td className="py-3 px-4 border-b">{payment.booking?.user?.name || '-'}</td>
                                      <td className="py-3 px-4 border-b">{payment.booking?.package?.name || '-'}</td>
                                      <td className="py-3 px-4 border-b">Rs.{payment.booking?.package?.price?.toFixed(2) || '0.00'}</td>
                                      <td className="py-3 px-4 border-b">Rs.{payment.paidAmount?.toFixed(2) || '0.00'}</td>
                                      <td className="py-3 px-4 border-b text-center">
                                          <span className={`px-3 py-1 rounded-full text-white text-sm ${payment.status === 'Complete' ? 'bg-green-600' :
                                                  payment.status === 'Pending' ? 'bg-gray-600' : 'bg-yellow-600'}`}>
                                              {payment.status}
                                          </span>
                                      </td>
                                      <td className="py-3 px-4 border-b text-center">
                                          <button
                                              onClick={() => handleViewPayment(payment.id)}
                                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded"
                                          >
                                              View
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div></>
  );
};

const handleViewPayment = (paymentId) => {
    console.log('Viewing payments:', paymentId);
  };

export default AdminFinance;