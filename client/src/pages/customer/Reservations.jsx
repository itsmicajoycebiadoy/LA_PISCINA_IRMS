import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ReservationCard from "../../components/ReservationCard";
// Import icons
import { ArrowLeft, Loader2, Calendar, Frown, XCircle, Info, Facebook, LogOut, Instagram, Twitter, CheckCircle, QrCode, ShoppingCart, Plus, Minus, Trash2, Bell, Upload, FileImage } from "lucide-react";

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelReservationId, setCancelReservationId] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [activeSection, setActiveSection] = useState("reservations");
    const [amenities, setAmenities] = useState([]);
    const [amenityLoading, setAmenityLoading] = useState(false);
    const [amenityError, setAmenityError] = useState(null);
    
    // New state for reservation form
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [formData, setFormData] = useState({
        guestName: "",
        email: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: "",
        amenitiesType: "",
        specialRequest: "",
        paymentType: "Cash",
        screenshot: null
    });

    // Cart state - Load from localStorage on component mount
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Payment options
    const paymentOptions = ["Cash", "GCash"];

    // Sample QR Code (base64 encoded sample QR code image)
    const sampleQrCode = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMzMzIi8+CjxyZWN0IHg9IjEzMCIgeT0iNDAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzMzMyIvPgo8cmVjdCB4PSI0MCIgeT0iMTMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMzMzMiLz4KPHJlY3QgeD0iODAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMzMzMiLz4KPC9zdmc+";

    // Fetch amenities from your backend API
    const fetchAmenities = async () => {
        try {
            setAmenityLoading(true);
            setAmenityError(null);
            
            const response = await fetch('http://localhost:5000/api/amenities');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch amenities: ${response.status}`);
            }
            
            const data = await response.json();
            setAmenities(data);
            
        } catch (err) {
            console.error('Error fetching amenities:', err);
            setAmenityError(err.message);
            addNotification('Failed to load amenities. Using default options.', 'error');
        } finally {
            setAmenityLoading(false);
        }
    };

    // Load cart from localStorage on component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('reservationCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('reservationCart', JSON.stringify(cart));
    }, [cart]);

    // Load amenities when component mounts
    useEffect(() => {
        fetchAmenities();
    }, []);

    // Cart functions
    const addToCart = (amenity) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.name === amenity.name);
            if (existingItem) {
                return prevCart.map(item =>
                    item.name === amenity.name
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Apply 20% discount when adding to cart
                const discountedAmenity = {
                    ...amenity,
                    quantity: 1,
                    originalPrice: amenity.price, // Store original price
                    price: amenity.price * 0.8 // Apply 20% discount
                };
                return [...prevCart, discountedAmenity];
            }
        });
        addNotification(`Added ${amenity.name} to cart with 20% discount!`, "success");
    };

    const removeFromCart = (amenityName) => {
        setCart(prevCart => prevCart.filter(item => item.name !== amenityName));
        addNotification(`Removed ${amenityName} from cart`, "info");
    };

    const updateQuantity = (amenityName, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(amenityName);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.name === amenityName
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getOriginalTotal = () => {
        return cart.reduce((total, item) => total + ((item.originalPrice || item.price) * item.quantity), 0);
    };

    const getDiscountAmount = () => {
        return getOriginalTotal() - getCartTotal();
    };

    const getCartItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Clear cart function
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('reservationCart');
    };

    // Notification functions
    const addNotification = (message, type = "info") => {
        const id = Date.now();
        const notification = { id, message, type, timestamp: new Date() };
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 latest
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                addNotification('Please upload an image file', 'error');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                addNotification('File size should be less than 5MB', 'error');
                return;
            }

            setFormData(prev => ({
                ...prev,
                screenshot: file
            }));
            addNotification('Screenshot uploaded successfully', 'success');
        }
    };

    // Remove uploaded screenshot
    const removeScreenshot = () => {
        setFormData(prev => ({
            ...prev,
            screenshot: null
        }));
        addNotification('Screenshot removed', 'info');
    };

    // Handle form submission
    const handleSubmitReservation = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.guestName || !formData.email || !formData.checkInDate || !formData.checkOutDate || !formData.numberOfGuests) {
            addNotification('Please fill in all required fields', 'error');
            return;
        }

        // If GCash is selected, require screenshot
        if (formData.paymentType === "GCash" && !formData.screenshot) {
            addNotification('Please upload a screenshot of your GCash payment', 'error');
            return;
        }
        
        // Show success notification on the right side
        addNotification("Reservation submitted successfully! Your booking is being processed.", "success");
        
        // Show the main success modal
        setShowSuccessNotification(true);
        setShowReservationForm(false);
        
        // Reset form after submission
        setFormData({
            guestName: "",
            email: "",
            checkInDate: "",
            checkOutDate: "",
            numberOfGuests: "",
            amenitiesType: "",
            specialRequest: "",
            paymentType: "Cash",
            screenshot: null
        });

        // Clear cart after successful reservation
        clearCart();
        setShowCart(false);
    };

    // Navigation functions
    const handleNavigation = (routeKey) => {
        let path = '/';
        switch (routeKey) {
            case 'home':
                path = '/CustomerDashboard';
                break;
            case 'amenities':
                path = '/amenities';
                break;
            case 'reservations':
                path = '/reservations';
                break;
            case 'feedback':
                path = '/feedback';
                break;
            case 'contact':
                path = '/contact';
                break;
            default:
                path = '/dashboard';
        }
        setActiveSection(routeKey);
        navigate(path);
    };

    const handleLogoutClick = () => {
        console.log("Logging out...");
        logout();
        localStorage.removeItem('token');
        localStorage.removeItem('reservationCart'); // Clear cart on logout
        navigate('/');
    };

    const fetchReservations = async () => {
        if (!user) {
            setError("User not logged in.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setTimeout(() => navigate('/'), 100);
            return;
        }
        fetchReservations();
    }, [user, navigate]);

    const handleAction = (reservation, actionType) => {
        if (actionType === 'view') {
            console.log('Viewing details for reservation:', reservation.id);
            navigate(`/reservations/${reservation.id}`);
        } else if (actionType === 'cancel' && reservation.status.toLowerCase() === 'pending') {
            setCancelReservationId(reservation.id);
        }
    };

    const confirmCancel = async () => {
        if (!cancelReservationId) return;

        try {
            // Update local state to reflect cancellation without API call
            setReservations(prev => prev.map(res =>
                res.id === cancelReservationId ? { ...res, status: 'Cancelled' } : res
            ));

            addNotification(`Reservation ${cancelReservationId} has been successfully cancelled.`, "info");

        } catch (err) {
            console.error('Cancellation error:', err);
            setError("Could not cancel reservation. " + err.message);
        } finally {
            setCancelReservationId(null);
        }
    };

    // Filter logic
    const filteredReservations = reservations.filter(reservation => {
        if (!reservation || !reservation.status || typeof reservation.status !== 'string') return false;
        if (activeTab === 'all') return true;
        return reservation.status.toLowerCase() === activeTab;
    });

    const getTabClasses = (tab) =>
        `px-4 py-2 font-medium rounded-full transition-colors duration-200 cursor-pointer ${
            activeTab === tab
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
        }`;

    // Use fetched amenities or fallback to default options
    const displayAmenities = amenities.length > 0 ? amenities : [
        { name: "Small Kubo 1", price: 500, description: "Small open hut for guests", capacity: "Up to 5 people" },
        { name: "Small Kubo 2", price: 500, description: "Small open hut for guests", capacity: "Up to 5 people" },
        { name: "Large Kubo 1", price: 800, description: "Large hut for families", capacity: "Up to 10 people" },
        { name: "Adults Swimming Pool", price: 2400, description: "Large swimming pool for adults", capacity: "Up to 20 people" },
        { name: "Kids Swimming Pool", price: 1200, description: "Safe swimming area for children", capacity: "Up to 15 people" },
        { name: "Private Pool Villa", price: 4500, description: "Luxury villa with private pool", capacity: "Up to 8 people" }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-body">
            {/* Header - Fixed height */}
            <header className="bg-white shadow-sm flex-shrink-0">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">LP</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 font-header">La Piscina IRMS</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <button
                                onClick={() => handleNavigation('home')}
                                className={`font-body font-medium pb-1 transition-colors ${
                                    activeSection === 'home'
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-900 hover:text-orange-500'
                                }`}
                            >
                                Home
                            </button>

                            <button
                                onClick={() => handleNavigation('amenities')}
                                className={`font-body font-medium pb-1 transition-colors ${
                                    activeSection === 'amenities'
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-900 hover:text-orange-500'
                                }`}
                            >
                                Amenities
                            </button>

                            <button
                                onClick={() => handleNavigation('reservations')}
                                className={`font-body font-medium pb-1 transition-colors ${
                                    activeSection === 'reservations'
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-900 hover:text-orange-500'
                                }`}
                            >
                                Reservations
                            </button>

                            <button
                                onClick={() => handleNavigation('feedback')}
                                className={`font-body font-medium pb-1 transition-colors ${
                                    activeSection === 'feedback'
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-900 hover:text-orange-500'
                                }`}
                            >
                                Feedback
                            </button>

                            <button
                                onClick={() => handleNavigation('contact')}
                                className={`font-body font-medium pb-1 transition-colors ${
                                    activeSection === 'contact'
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-900 hover:text-orange-500'
                                }`}
                            >
                                Contact
                            </button>
                        </nav>

                        <div className="flex items-center space-x-6">
                            {/* Cart Button */}
                            <button
                                onClick={() => setShowCart(!showCart)}
                                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                {getCartItemCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {getCartItemCount()}
                                    </span>
                                )}
                            </button>

                            {/* Welcome Message */}
                            {user && (
                            <div className="hidden md:flex items-center space-x-3 text-gray-900">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{user.username}</span>
                                    <span className="text-xs text-gray-500">Welcome back!</span>
                                </div>
                            </div>)}

                            {/* Logout Button */}
                            <button
                                onClick={handleLogoutClick}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Shopping Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCart(false)}>
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Your Cart</h3>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Your cart is empty</p>
                                        <p className="text-sm text-gray-400 mt-2">Add amenities from the home page</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-orange-500 font-bold">₱{item.price.toLocaleString()}</p>
                                                        {item.originalPrice && (
                                                            <p className="text-sm text-gray-500 line-through">₱{item.originalPrice.toLocaleString()}</p>
                                                        )}
                                                    </div>
                                                    {item.capacity && (
                                                        <p className="text-xs text-gray-500 mt-1">{item.capacity}</p>
                                                    )}
                                                    {item.originalPrice && (
                                                        <p className="text-xs text-green-600 font-semibold mt-1">20% OFF!</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.name)}
                                                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="border-t pt-4">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Original Total:</span>
                                            <span className="text-sm text-gray-600 line-through">₱{getOriginalTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-green-600">Discount (20%):</span>
                                            <span className="text-sm text-green-600">-₱{getDiscountAmount().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total:</span>
                                            <span className="text-xl font-bold text-orange-500">₱{getCartTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setShowCart(false);
                                                setShowReservationForm(true);
                                            }}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            Proceed to Reservation
                                        </button>
                                        <button
                                            onClick={clearCart}
                                            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Responsive Notifications - Fixed on right side */}
            <div className="fixed top-20 right-4 z-50 space-y-2 w-full max-w-xs sm:max-w-sm md:max-w-md">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-3 sm:p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
                            notification.type === 'success'
                                ? 'bg-green-50 border-green-500 text-green-800'
                                : notification.type === 'error'
                                ? 'bg-red-50 border-red-500 text-red-800'
                                : 'bg-blue-50 border-blue-500 text-blue-800'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-2 flex-1">
                                <div className="flex-shrink-0 mt-0.5">
                                    {notification.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                                    {notification.type === 'error' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                                    {notification.type === 'info' && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
                                </div>
                                <p className="font-medium text-sm sm:text-base break-words flex-1">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Success Notification Modal */}
            {showSuccessNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-2xl mx-4 w-full transform transition-all duration-300 scale-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">You Successfully Made Reservation</h3>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Guest Name:</span>
                                    <span className="text-gray-900">{formData.guestName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Email Address:</span>
                                    <span className="text-gray-900">{formData.email}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Number of Guest:</span>
                                    <span className="text-gray-900">{formData.numberOfGuests} {formData.numberOfGuests === "1" ? "Guest" : "Guests"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Check-in Date:</span>
                                    <span className="text-gray-900">{formData.checkInDate}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Check-out Date:</span>
                                    <span className="text-gray-900">{formData.checkOutDate}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Payment Method:</span>
                                    <span className="text-gray-900">{formData.paymentType}</span>
                                </div>
                                {formData.paymentType === "GCash" && (
                                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                        <span className="font-semibold text-gray-700">Payment Screenshot:</span>
                                        <span className="text-gray-900">{formData.screenshot ? "Uploaded ✓" : "Not uploaded"}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                    <span className="font-semibold text-gray-700">Special Request:</span>
                                    <span className="text-gray-900">{formData.specialRequest || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Amount Paid:</span>
                                    <span className="text-gray-900 font-bold">₱{getCartTotal().toLocaleString()}</span>
                                </div>
                                {getDiscountAmount() > 0 && (
                                    <div className="flex justify-between items-center border-t border-blue-100 pt-2">
                                        <span className="font-semibold text-green-600">You Saved:</span>
                                        <span className="text-green-600 font-bold">₱{getDiscountAmount().toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowSuccessNotification(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {cancelReservationId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 w-full transform transition-all duration-300 scale-100">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Cancellation</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to cancel reservation **{cancelReservationId}**? This cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setCancelReservationId(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Confirm Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-6 py-10 flex-grow">
                {/* Reservations Header with Make Reservation Button */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 font-header mb-4">
                        Reservations
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Make new reservations or view your existing bookings. Experience luxury and comfort at La Piscina Resort.
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-12">
                        <button
                            onClick={() => setShowReservationForm(!showReservationForm)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Calendar className="w-5 h-5" />
                            {showReservationForm ? 'Cancel Reservation' : 'Make Reservation'}
                        </button>
                    </div>
                </div>

                {/* Reservation Form */}
                {showReservationForm && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8 mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Make a New Reservation</h3>
                        
                        <form onSubmit={handleSubmitReservation} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Guest Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Guest Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="guestName"
                                            value={formData.guestName}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Check-in Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Check-in Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="checkInDate"
                                            value={formData.checkInDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Number of Guests */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Number of Guests *
                                        </label>
                                        <select
                                            name="numberOfGuests"
                                            value={formData.numberOfGuests}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            required
                                        >
                                            <option value="">Select number of guests</option>
                                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Type of Payment with QR Code */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Type of Payment *
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <select
                                                name="paymentType"
                                                value={formData.paymentType}
                                                onChange={handleInputChange}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                                required
                                            >
                                                {paymentOptions.map(payment => (
                                                    <option key={payment} value={payment}>{payment}</option>
                                                ))}
                                            </select>
                                            {formData.paymentType === "GCash" && (
                                                <div className="flex-shrink-0">
                                                    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
                                                        <img 
                                                            src={sampleQrCode} 
                                                            alt="GCash QR Code" 
                                                            className="w-20 h-20 sm:w-24 sm:h-24"
                                                        />
                                                        <p className="text-xs text-gray-500 text-center mt-2">Scan to Pay</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Screenshot Upload */}
                                    {formData.paymentType === "GCash" && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Upload Payment Screenshot *
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                                                {!formData.screenshot ? (
                                                    <div>
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Upload screenshot of your GCash payment
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-4">
                                                            Supported formats: JPG, PNG, GIF (Max 5MB)
                                                        </p>
                                                        <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                                                            Choose File
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <FileImage className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {formData.screenshot.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-4">
                                                            {(formData.screenshot.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={removeScreenshot}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            Remove File
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Request */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Special Request
                                        </label>
                                        <textarea
                                            name="specialRequest"
                                            value={formData.specialRequest}
                                            onChange={handleInputChange}
                                            placeholder="Any special requests or references..."
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            maxLength="5000"
                                        />
                                        <div className="text-right text-sm text-gray-500 mt-1">
                                            {formData.specialRequest.length}/5000 characters
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Email Address */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Check-out Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Check-out Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="checkOutDate"
                                            value={formData.checkOutDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Cart Summary in Reservation Form */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Your Cart</h4>
                                        {cart.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">Your cart is empty. Add amenities from the home page.</p>
                                        ) : (
                                            <>
                                                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                                    {cart.map((item) => (
                                                        <div key={item.name} className="flex justify-between text-sm">
                                                            <div>
                                                                <span>{item.name} x{item.quantity}</span>
                                                                {item.originalPrice && (
                                                                    <span className="text-xs text-green-600 ml-2">(20% OFF!)</span>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-orange-500">₱{(item.price * item.quantity).toLocaleString()}</span>
                                                                {item.originalPrice && (
                                                                    <span className="text-xs text-gray-500 line-through block">₱{(item.originalPrice * item.quantity).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="border-t pt-2 space-y-1">
                                                    {getDiscountAmount() > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Original Total:</span>
                                                                <span className="text-gray-600 line-through">₱{getOriginalTotal().toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-green-600">Discount (20%):</span>
                                                                <span className="text-green-600">-₱{getDiscountAmount().toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex justify-between font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-orange-500">₱{getCartTotal().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-6"></div>

                            {/* Required fields note */}
                            <div className="text-sm text-gray-500 text-center">
                                * Required fields
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg font-semibold text-lg transition-colors w-full sm:w-auto"
                                >
                                    Submit Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* Footer Section */}
            <footer className="bg-gray-900 text-white py-12 flex-shrink-0">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Location & Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold font-header mb-4 text-orange-500">Visit Us Today</h3>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p className="text-gray-300">Barangay Gumamela, Balayan</p>
                                        <p className="text-gray-300">Batangas, Philippines</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-300">+63 (912) 345-6789</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-300">info@lapiscinaconception.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links & Navigation */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold font-header mb-4 text-orange-500">Quick Links</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleNavigation('home')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Home
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('amenities')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Amenities
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('reservations')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Reservations
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('feedback')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Feedback
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('contact')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Contact
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleNavigation('home')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        About Us
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('contact')}
                                        className="block text-gray-300 hover:text-orange-500 transition-colors text-left"
                                    >
                                        Contact
                                    </button>
                                    <button className="block text-gray-300 hover:text-orange-500 transition-colors text-left">
                                        FAQ
                                    </button>
                                    <button className="block text-gray-300 hover:text-orange-500 transition-colors text-left">
                                        Privacy Policy
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Operating Hours & Social Media */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold font-header mb-4 text-orange-500">Resort Hours</h3>
                            <div className="space-y-2 text-gray-300">
                                <div className="flex justify-between">
                                    <span>Monday - Thursday:</span>
                                    <span>8:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Friday - Saturday:</span>
                                    <span>8:00 AM - 11:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday:</span>
                                    <span>8:00 AM - 9:00 PM</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h4 className="font-semibold mb-3 text-orange-500">Follow Us</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                                        <Facebook className="w-6 h-6" />
                                    </a>
                                    <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                    <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} La Piscina IRMS. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Reservations;