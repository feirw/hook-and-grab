import { useEffect, useMemo, useState } from 'react';
import { FaList, FaTh, FaSearch } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import '../styles/Market.css';
import '../styles/RentABoat.css';
import NewBoatModal from '../components/NewBoatModal';
import BookingModal from '../components/BookingModal';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mediaSrc, formatPrice } from '../utils/format';

const RentABoat = () => {
    const { user, openLogin } = useAuth();
    const { showToast } = useToast();
    const [isGridView, setIsGridView] = useState(true);
    const [boats, setBoats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBoat, setSelectedBoat] = useState(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [maxPrice, setMaxPrice] = useState(200);
    const [currentMaxPrice, setCurrentMaxPrice] = useState(200);
    const [locationFilter, setLocationFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBoats = () => {
        setLoading(true);
        api.get('/boats?limit=100')
            .then((response) => {
                const fetched = response.data.boats || [];
                setBoats(fetched);
                const prices = fetched.map((boat) => Number(boat.pricePerDay) || 0);
                const highest = prices.length ? Math.max(...prices) : 200;
                setMaxPrice(highest);
                setCurrentMaxPrice(highest);
                setError('');
            })
            .catch(() => setError('Could not load boats right now.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBoats();
    }, []);

    const locations = useMemo(
        () => [...new Set(boats.map((boat) => boat.location).filter(Boolean))],
        [boats]
    );

    const filteredBoats = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return boats.filter((boat) => {
            const matchesQuery =
                boat.title?.toLowerCase().includes(query) ||
                boat.description?.toLowerCase().includes(query) ||
                boat.location?.toLowerCase().includes(query);
            const matchesPrice = (Number(boat.pricePerDay) || 0) <= currentMaxPrice;
            const matchesLocation = locationFilter ? boat.location === locationFilter : true;
            return matchesQuery && matchesPrice && matchesLocation;
        });
    }, [boats, searchQuery, currentMaxPrice, locationFilter]);

    const openListing = () => {
        if (!user) {
            openLogin();
            return;
        }
        setIsModalOpen(true);
    };

    const openBooking = (boat) => {
        if (!user) {
            openLogin();
            return;
        }
        if (Number(boat.ownerId) === Number(user.id)) {
            showToast('You already own this listing.', 'info');
            return;
        }
        setSelectedBoat(boat);
    };

    return (
        <div className="site-container">
            <div className="content-container">
                <div className="header">
                    <div className="market-icons">
                        <div className="right-grid mt-5">
                            {isGridView ? (
                                <FaList className="market-icon" onClick={() => setIsGridView(false)} />
                            ) : (
                                <FaTh className="market-icon" onClick={() => setIsGridView(true)} />
                            )}
                        </div>
                    </div>
                    <h1 className="text-center mt-5 pt-5">Rent A Boat</h1>
                    <p className="text-center">Save Resources, Empower Communities</p>
                </div>
                <section className="renting-search">
                    <div className="filter-wrapper">
                        <button className="rent-filter-button" onClick={() => setShowFilterMenu((open) => !open)}>
                            Filters <FilterAltIcon id="filter-icon" />
                        </button>
                        {showFilterMenu && (
                            <div className="filter-menu">
                                <div className="slider-container">
                                    <label htmlFor="boat-max-price">Up to {currentMaxPrice}€ / day</label>
                                    <input
                                        id="boat-max-price"
                                        type="range"
                                        min="0"
                                        max={maxPrice || 1}
                                        value={currentMaxPrice}
                                        onChange={(e) => setCurrentMaxPrice(+e.target.value)}
                                    />
                                </div>
                                <div className="checkbox-container">
                                    <label htmlFor="boat-location">Location</label>
                                    <select
                                        id="boat-location"
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                    >
                                        <option value="">All harbors</option>
                                        {locations.map((location) => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for boats"
                            className="renting-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="renting-your-boat-button" onClick={openListing}>
                        Rent your Boat
                    </button>
                </section>

                {loading && <p className="status-message">Loading boats...</p>}
                {error && <p className="status-message status-error">{error}</p>}
                {!loading && !error && filteredBoats.length === 0 && (
                    <p className="status-message">No boats match those filters yet.</p>
                )}

                <section className={`market-items ${isGridView ? 'grid-view' : 'list-view'}`}>
                    {filteredBoats.map((boat) => {
                        const image = mediaSrc(boat.images?.[0]);
                        return (
                            <div key={boat.id} className="market-item font1">
                                <h2>{boat.title}</h2>
                                {image ? (
                                    <img src={image} alt={boat.title} />
                                ) : (
                                    <div className="item-placeholder">No photo yet</div>
                                )}
                                <p>{boat.description}</p>
                                <p>{formatPrice(boat.pricePerDay)} per day</p>
                                <div className="item-badges">
                                    {boat.location ? <span className="badge-pill">{boat.location}</span> : null}
                                    {boat.ownerUsername ? <span className="badge-pill badge-muted">{boat.ownerUsername}</span> : null}
                                </div>
                                <div className="market-item-buttons">
                                    <Button variant="primary" className="rent-button" onClick={() => openBooking(boat)}>
                                        Rent Now
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>
            <NewBoatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddBoat={(boat) => setBoats((current) => [boat, ...current])} />
            <BookingModal
                boat={selectedBoat}
                show={Boolean(selectedBoat)}
                onClose={() => setSelectedBoat(null)}
                onBooked={() => showToast('Booking request sent to the owner.', 'success')}
            />
        </div>
    );
};

export default RentABoat;
