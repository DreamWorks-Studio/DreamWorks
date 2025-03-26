import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const AdminFinance = ({}) => {
      const [paymentData, setPaymentData] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchQuery, setSearchQuery] = useState("");

      useEffect(() => {
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
            });
    }, []);

    const filteredPayments = paymentData.filter(payment =>
        payment.bookingId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <><div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
          <p className="text-gray-600">Payment History</p>
          <div className="flex items-center rounded-md bg-gray-100 border-1 px-3 py-2 w-64 mt-2">
          <Search size={18} className="text-gray-500" />
          <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
          />
          </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                  <th className='py-3 px-4 text-center'>Payment Method</th>
                                  {/*<th className="py-3 px-4 text-center">Action</th>*/}
                              </tr>
                          </thead>
                          <tbody>
                              {filteredPayments.map((payment, index) => (
                                  <tr key={payment.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="py-3 px-4 border-b">{payment.bookingId?._id || '-'}</td>
                                      <td className="py-3 px-4 border-b">{payment.bookingId?.fullName || '-'}</td>
                                      <td className="py-3 px-4 border-b">{payment.bookingId?.packageType || '-'}</td>
                                      <td className="py-3 px-4 border-b">Rs.{payment.totalAmount?.toFixed(2) || '0.00'}</td>
                                      <td className="py-3 px-4 border-b">Rs.{payment.amountPaid?.toFixed(2) || '0.00'}</td>
                                      <td className="py-3 px-4 border-b text-center">
                                          <span className={`px-4 py-1 rounded-full text-white text-sm ${payment.paymentStatus === 'paid' ? 'bg-green-600' :
                                                  payment.paymentStatus === 'pending' ? 'bg-gray-600' :
                                                      payment.paymentStatus === 'partial' ? 'bg-yellow-600' : 'bg-red-600'
                                              }`}>
                                              {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                                          </span>
                                      </td>
                                      <td className='py-3 px-4 border-b text-center'>
                                        <span className={`px-4 py-1 rounded-full text-sm ${
                                            payment.paymentMethod === 'cash' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) || '-'}
                                        </span>

                                      </td>
                                      {/*----

                                      <td className="py-3 px-4 border-b text-center">
                                          <button
                                              onClick={() => handleViewPayment(payment.id)}
                                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded"
                                          >
                                              View
                                          </button>
                                      </td>---*/}

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