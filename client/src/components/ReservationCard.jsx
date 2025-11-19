import React from 'react';

const ReservationCard = ({ reservation, onAction }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-gray-800';
      case 'cancelled':
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/default-amenity.jpg';
  };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        
            {/* Image and Status Section */}
            <div className="h-48 bg-gray-200 relative">
                <img
                src={reservation.amenityImage || '/images/default-amenity.jpg'}
                alt={reservation.amenityName}
                className="w-full h-full object-cover"
                onError={handleImageError}
                />
                
                {/* Reservation Status Badge */}
                <div className={`absolute top-3 right-3 ${
                getStatusBadge(reservation.status)
                } px-3 py-1 rounded-full text-xs font-semibold shadow-md capitalize`}>
                {reservation.status}
                </div>
                
                {/* Reservation ID or Ref */}
                <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                Ref: {reservation.id}
                </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4">

                {/* Amenity Name */}
                <h3 className="text-lg font-bold text-lp-dark font- line-clamp-1 mb-2">
                {reservation.amenityName}
                </h3>
                
                {/* Reservation Dates/Times */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                <span className="font-semibold">Booking:</span> {reservation.startDate} to {reservation.endDate}
                </p>
                
                {/* Details: Duration and Total Price */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                        </svg>

                        {/* You'd calculate duration here, but using a placeholder for simplicity */}
                        <span>{reservation.duration || 'N/A'}</span>
                    </div>
                    
                    <div className="text-lg font-bold text-lp-orange">
                        ₱{reservation.totalPrice.toLocaleString()}
                    </div>
                </div>
                
                {/* Primary Action Button (e.g., View Details) */}
                <button 
                onClick={() => onAction(reservation, 'view')}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 
                    bg-lp-blue hover:bg-lp-blue-hover text-white cursor-pointer transform hover:scale-[1.02]
                }`}
                >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                View Details
                </button>
            </div>
        </div>
    );
};

export default ReservationCard;