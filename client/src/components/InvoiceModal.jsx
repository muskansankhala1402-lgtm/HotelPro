import React from 'react';
import { Printer, X, CheckCircle, Building2 } from 'lucide-react';

const InvoiceModal = ({ show, onHide, invoice }) => {
  if (!show || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const { hotelDetails, guestDetails, bookingDetails, financials, invoiceNumber, issuedDate } = invoice;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1070 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white no-print">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <Building2 size={20} className="text-warning" /> Official Invoice & Receipt
            </h5>
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-warning btn-sm d-flex align-items-center gap-1" onClick={handlePrint}>
                <Printer size={16} /> Print / Save PDF
              </button>
              <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
            </div>
          </div>

          <div className="modal-body p-4 p-md-5" id="printable-invoice">
            {/* Invoice Header */}
            <div className="row pb-4 mb-4 border-bottom">
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <h4 className="fw-bold mb-0 text-dark">HotelPro</h4>
                </div>
                <p className="text-muted small mb-1">{hotelDetails?.name || 'HotelPro Grand Luxury & Suites'}</p>
                <p className="text-muted small mb-1">{hotelDetails?.address || '777 Ocean Blvd, Grand Vista, CA'}</p>
                <p className="text-muted small mb-1">Email: {hotelDetails?.email || 'reservations@hotelpro.com'}</p>
                <p className="text-muted small">Tax ID: {hotelDetails?.taxId || 'US-TAX-98472199'}</p>
              </div>

              <div className="col-sm-6 text-sm-end mt-3 mt-sm-0">
                <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 fs-6 mb-2">
                  <CheckCircle size={16} className="me-1 inline" /> {financials?.paymentStatus || 'PAID'}
                </span>
                <h5 className="text-dark fw-bold mb-1">Invoice #{invoiceNumber}</h5>
                <p className="text-muted small mb-1">
                  Issued: {new Date(issuedDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-muted small mb-0">Booking Ref: <strong className="text-dark">{bookingDetails?.bookingReference}</strong></p>
                <p className="text-muted small">Transaction ID: <span className="font-monospace text-dark">{financials?.transactionId}</span></p>
              </div>
            </div>

            {/* Billed To & Reservation Summary */}
            <div className="row mb-4">
              <div className="col-sm-6">
                <h6 className="fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Billed To</h6>
                <h6 className="fw-bold text-dark mb-1">{guestDetails?.name}</h6>
                <p className="text-muted small mb-1">{guestDetails?.email}</p>
                {guestDetails?.phone && <p className="text-muted small mb-1">{guestDetails?.phone}</p>}
              </div>

              <div className="col-sm-6 text-sm-end mt-3 mt-sm-0">
                <h6 className="fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Reservation Summary</h6>
                <p className="text-muted small mb-1">
                  Room: <strong>#{bookingDetails?.roomNumber} ({bookingDetails?.roomCategory})</strong>
                </p>
                <p className="text-muted small mb-1">
                  Check-in: <strong>{new Date(bookingDetails?.checkInDate).toLocaleDateString()}</strong>
                </p>
                <p className="text-muted small mb-0">
                  Check-out: <strong>{new Date(bookingDetails?.checkOutDate).toLocaleDateString()}</strong>
                </p>
                <p className="text-muted small">
                  Duration: <strong>{bookingDetails?.totalNights} Night(s)</strong>
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Rate</th>
                    <th className="text-center">Qty / Nights</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="fw-bold">Accommodation - {bookingDetails?.roomCategory}</div>
                      <small className="text-muted">Room #{bookingDetails?.roomNumber} reservation</small>
                    </td>
                    <td className="text-center">${financials?.pricePerNight}</td>
                    <td className="text-center">{bookingDetails?.totalNights}</td>
                    <td className="text-end fw-semibold">${financials?.subtotal?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-muted small">Hotel Occupancy & City Tax (12%)</td>
                    <td className="text-end text-muted small">${financials?.taxes?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-muted small">Resort & Service Fee</td>
                    <td className="text-end text-muted small">${financials?.serviceFee?.toFixed(2)}</td>
                  </tr>
                  {financials?.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="text-end text-success small">Promotional Discount</td>
                      <td className="text-end text-success small">-${financials?.discount?.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="table-light">
                    <td colSpan="3" className="text-end fw-bold fs-5 text-dark">Total Amount Paid</td>
                    <td className="text-end fw-bold fs-5 text-dark">${financials?.totalAmount?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Details Footer */}
            <div className="p-3 bg-light rounded text-muted small d-flex flex-column flex-sm-row justify-content-between align-items-center">
              <div>
                Payment Method: <strong className="text-dark">{financials?.paymentMethod}</strong> (Card ending in {financials?.cardLast4 || '4242'})
              </div>
              <div className="mt-2 mt-sm-0 text-success fw-bold">
                Payment Authorized & Settled
              </div>
            </div>

            <div className="text-center text-muted small mt-4 pt-3 border-top">
              Thank you for choosing HotelPro! We hope you have a marvelous stay with us.
            </div>
          </div>

          <div className="modal-footer bg-light no-print">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            <button type="button" className="btn btn-navy" onClick={handlePrint}>
              <Printer size={16} className="me-1" /> Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
