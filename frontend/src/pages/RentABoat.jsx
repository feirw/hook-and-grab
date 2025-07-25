import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaList, FaTh, FaSearch } from 'react-icons/fa';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavBar from './../components/NavBar';
import '../styles/RentABoat.css';
import axios from 'axios';
import NewBoatModal from './../components/NewBoatModal';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';

const RentABoat = () => {
    const navigate = useNavigate();
    const [isGridView, setIsGridView] = useState(true);
    const [boats, setBoats] = useState([]); // Initialize as an empty array
    const [filteredBoats, setFilteredBoats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3482/boats')
            .then(response => {
                console.log('Response:', response);
                if (Array.isArray(response.data.boats)) {
                    setBoats(response.data.boats);
                    setFilteredBoats(response.data.boats);
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching boats:', error);
            });
    }, []);

    useEffect(() => {
        filterBoats(searchQuery);
    }, [searchQuery, boats]);

    const filterBoats = (query) => {
        const filtered = boats.filter(boat => 
            boat.title.toLowerCase().includes(query.toLowerCase()) ||
            boat.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredBoats(filtered);
    };

    const toggleView = () => {
        setIsGridView(!isGridView);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddBoat = (newBoat) => {
        setBoats([...boats, newBoat]);
    };

    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="site-container">
            <NavBar />
            <div className="content-container">
                <div className="header">
                    <div className="market-icons">
                        <div className="right-grid mt-5">
                            {isGridView ? (
                                <FaList className="market-icon" onClick={toggleView} />
                            ) : (
                                <FaTh className="market-icon" onClick={toggleView} />
                            )}
                        </div>
                    </div>
                    <h1 className="text-center mt-5 pt-5">Rent A Boat</h1>
                    <p className="text-center">Save Resources, Empower Communities</p>
                </div>
                <section className="renting-search">
                    <button className="rent-filter-button">
                        Filters <FilterAltIcon id="filter-icon" />
                    </button>
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
                    {/* <button className="renting-search-button">Search</button> */}
                    {user && (
                        <button className="renting-your-boat-button" onClick={handleOpenModal}>
                            Rent your Boat
                        </button>
                    )}
                </section>
                <section className={`market-items ${isGridView ? 'grid-view' : 'list-view'}`}>
                    {filteredBoats.map((boat, index) => (
                        <div key={index} className="market-item font1">
                            <h2>{boat.title}</h2>
                            {boat.images && boat.images.length > 0 && (
                                <img src={`data:${boat.images[0].mimeType};base64,${boat.images[0].data}`} alt={boat.title} />
                            )}
                            <p>{boat.description}</p>
                            <p>{(boat.pricePerDay || 0).toFixed(2)}€ per day</p>
                            <div className="market-item-buttons">
                                <Button variant="primary" className="rent-button">
                                    Rent Now
                                </Button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
            <NewBoatModal isOpen={isModalOpen} onClose={handleCloseModal} onAddBoat={handleAddBoat} />
        </div>
    );
};

export default RentABoat;
