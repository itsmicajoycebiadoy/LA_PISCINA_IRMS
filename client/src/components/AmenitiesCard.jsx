import React from 'react';

const AmenitiesCard = ({ amenity, onBook }) => {
  const handleImageError = (e) => {
    e.target.src = '/images/default-amenity.jpg';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={amenity.image} 
          alt={amenity.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 ${
          amenity.available 
            ? 'bg-lp-orange text-white' 
            : 'bg-red-500 text-white'
        } px-3 py-1 rounded-full text-xs font-semibold shadow-md`}>
          {amenity.available ? 'Available' : 'Unavailable'}
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {amenity.type}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-bold text-lp-dark font- line-clamp-1 mb-2">
          {amenity.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {amenity.description}
        </p>
        
        {/* Capacity and Price */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>Up to {amenity.capacity} people</span>
          </div>
          <div className="text-lg font-bold text-lp-orange">
            ₱{amenity.price.toLocaleString()}
          </div>
        </div>
        
        {/* Button Container */}
        <div className="flex flex-col gap-2">
          {/* Add to Cart Button */}
          <button
            onClick={() => onBook(amenity)}
            disabled={!amenity.available}
            className={`w-full py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              amenity.available 
                ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transform hover:scale-[1.02]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {amenity.available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesCard;