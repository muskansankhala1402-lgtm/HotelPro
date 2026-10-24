const generateInvoiceData = (booking, payment, user) => {
  const invoiceNumber = booking.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
  return {
    invoiceNumber,
    issuedDate: new Date(),
    hotelDetails: {
      name: 'HotelPro Grand Luxury & Suites',
      address: '777 Ocean Blvd, Grand Vista, CA 90210',
      phone: '+1 (800) 555-ROOM',
      email: 'reservations@hotelpro.com',
      taxId: 'US-TAX-98472199',
    },
    guestDetails: {
      name: user?.name || 'Guest User',
      email: user?.email || 'guest@example.com',
      phone: user?.phone || 'N/A',
      address: user?.address || 'N/A',
    },
    bookingDetails: {
      bookingReference: booking.bookingReference,
      roomNumber: booking.room?.roomNumber || 'Assigned on arrival',
      roomCategory: booking.room?.category?.name || 'Standard Suite',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalNights: booking.totalNights,
      guestsCount: booking.guestsCount,
    },
    financials: {
      pricePerNight: booking.pricePerNight,
      subtotal: booking.subtotal,
      taxes: booking.taxes,
      serviceFee: booking.serviceFee,
      discount: booking.discount,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      transactionId: payment?.transactionId || `TX-${Date.now()}`,
    },
  };
};

module.exports = { generateInvoiceData };
