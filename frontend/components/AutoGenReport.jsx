import React from 'react'

const AutoGenReport = ({ payment }) => {
    // We're now accepting 'payment' as a prop
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Poppins', Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              background-color: #f9fafb;
            }
            .receipt-container {
              max-width: 800px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              padding: 40px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f3f4f6;
            }
            .logo-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background-color: #FFC107;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 24px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: bold;
              color: #000000;
              letter-spacing: -0.5px;
            }
            .receipt-title {
              font-size: 20px;
              color: #4b5563;
              font-weight: 500;
            }
            .receipt-metadata {
              text-align: right;
              color: #6b7280;
            }
            .receipt-no {
              font-weight: 600;
              font-size: 16px;
              color: #111827;
            }
            .receipt-date {
              margin-top: 5px;
              font-size: 14px;
            }
            .customer-section {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .customer-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              margin-bottom: 5px;
            }
            .label {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 3px;
            }
            .value {
              font-weight: 500;
              color: #111827;
              font-size: 15px;
            }
            .payment-details {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
            }
            .payment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .payment-total {
              background-color: #f3f4f6;
              padding: 15px 20px;
              border-radius: 8px;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-weight: 600;
              color: #374151;
              font-size: 16px;
            }
            .total-value {
              font-weight: 700;
              color: #111827;
              font-size: 20px;
            }
            .payment-status {
              margin-top: 15px;
              text-align: right;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 50px;
              font-size: 14px;
              font-weight: 500;
              text-transform: capitalize;
            }
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-partial {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-pending {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .divider {
              border-top: 1px solid #e5e7eb;
              margin: 25px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #6b7280;
              text-align: center;
              line-height: 1.5;
            }
            .contact-details {
              display: flex;
              gap: 15px;
              justify-content: center;
              margin: 15px 0;
            }
            .contact-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .contact-icon {
              width: 16px;
              height: 16px;
              display: inline-block;
            }
            .barcode {
              text-align: center;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
              color: #9ca3af;
              font-size: 12px;
            }
            .payment-methods {
              display: flex;
              gap: 10px;
              justify-content: center;
              margin-top: 10px;
            }
            .payment-methods img {
              height: 20px;
              opacity: 0.6;
            }
            @media print {
              body { 
                background-color: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .receipt-container {
                box-shadow: none;
                max-width: 100%;
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo-container">
                <div class="logo-icon">DS</div>
                <div class="logo-text">DreamWork Studio</div>
              </div>
              <div class="receipt-metadata">
                <div class="receipt-title">Payment Receipt</div>
                <div class="receipt-no">#${payment._id || 'N/A'}</div>
                <div class="receipt-date">${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}</div>
              </div>
            </div>
            
            <div class="customer-section">
              <div class="section-title">Customer Information</div>
              <div class="customer-details">
                <div>
                  <div class="info-item">
                    <div class="label">Customer Name</div>
                    <div class="value">${payment.bookingId?.fullName || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Booking ID</div>
                    <div class="value">${payment.bookingId?._id || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <div class="label">Package Type</div>
                    <div class="value">${payment.bookingId?.packageType || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Invoice Date</div>
                    <div class="value">${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="payment-details">
              <div class="section-title">Payment Details</div>
              <div class="payment-grid">
                <div class="info-item">
                  <div class="label">Payment Method</div>
                  <div class="value">${payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Payment Date</div>
                  <div class="value">${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Amount Paid</div>
                  <div class="value">Rs. ${payment.amountPaid?.toFixed(2) || '0.00'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Balance Due</div>
                  <div class="value">Rs. ${((payment.totalAmount || 0) - (payment.amountPaid || 0)).toFixed(2)}</div>
                </div>
              </div>
              
              <div class="payment-total">
                <span class="total-label">Total Amount</span>
                <span class="total-value">Rs. ${payment.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div class="payment-status">
                <span class="status-badge ${
                  payment.paymentStatus === 'paid' ? 'status-paid' : 
                  payment.paymentStatus === 'partial' ? 'status-partial' : 'status-pending'
                }">
                  ${payment.paymentStatus ? payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1) : 'N/A'}
                </span>
              </div>
            </div>
            
            <div class="barcode">
              |||| |||| || ||| |||| ||| ||| | ||
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p><strong>Thank you for choosing DreamWork Studio!</strong></p>
              <div class="contact-details">
                <div class="contact-item">
                  <span class="contact-icon">✉</span>
                  info@dreamworkstudio.com
                </div>
                <div class="contact-item">
                  <span class="contact-icon">☎</span>
                  +94-72-190-8494
                </div>
              </div>
              <p>This is a computer-generated receipt and requires no signature.</p>
              <div class="payment-methods">
                <!-- Placeholder for payment method icons -->
                <span style="font-size: 12px; color: #9ca3af;">Visa</span>
                <span style="font-size: 12px; color: #9ca3af;">MasterCard</span>
                <span style="font-size: 12px; color: #9ca3af;">Cash</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
export default AutoGenReport