import { useState, useEffect, useMemo } from 'react';
import '../styles/Market.css';
import { FaList, FaTh, FaSearch } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import NewProductModal from '../components/NewProductModal';
import ContactModal from '../components/ContactModal';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mediaSrc, formatPrice } from '../utils/format';

const Market = () => {
    const { user, openLogin } = useAuth();
    const [isGridView, setIsGridView] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [currentMaxPrice, setCurrentMaxPrice] = useState(1000);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [onlyFree, setOnlyFree] = useState(false);
    const [openToTrade, setOpenToTrade] = useState(false);
    const [sortOrder, setSortOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [contactItem, setContactItem] = useState(null);

    const fetchProducts = () => {
        setLoading(true);
        api.get('/products?limit=100')
            .then((response) => {
                const fetchedProducts = response.data.products || [];
                setProducts(fetchedProducts);
                const prices = fetchedProducts.map((product) => Number(product.price) || 0);
                const highest = prices.length ? Math.max(...prices) : 1000;
                setMaxPrice(highest);
                setCurrentMaxPrice(highest);
                setError('');
            })
            .catch(() => {
                setError('Could not load the market right now.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        let next = products.filter((product) => {
            const price = Number(product.price) || 0;
            const inRange = price <= currentMaxPrice;
            const matchesFree = onlyFree ? price === 0 || product.isFree : true;
            const matchesTrade = openToTrade ? Boolean(product.isOpenToTrade) : true;
            const matchesQuery =
                product.title?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query);
            return inRange && matchesFree && matchesTrade && matchesQuery;
        });

        if (sortOrder) {
            next = [...next].sort((a, b) =>
                sortOrder === 'asc'
                    ? (Number(a.price) || 0) - (Number(b.price) || 0)
                    : (Number(b.price) || 0) - (Number(a.price) || 0)
            );
        }
        return next;
    }, [products, searchQuery, currentMaxPrice, onlyFree, openToTrade, sortOrder]);

    const handleAddProduct = (newProduct) => {
        setProducts((current) => [newProduct, ...current]);
        const nextMax = Math.max(maxPrice, Number(newProduct.price) || 0);
        setMaxPrice(nextMax);
        setCurrentMaxPrice(nextMax);
    };

    const openListing = () => {
        if (!user) {
            openLogin();
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <div className="site-container">
            <div className="content-container">
                <div className="market-container">
                    <header className="market-header">
                        <h1 className="text-center mt-5 pt-5">Market</h1>
                        <div className="market-icons">
                            {isGridView ? (
                                <FaList className="market-icon" onClick={() => setIsGridView(false)} title="List view" />
                            ) : (
                                <FaTh className="market-icon" onClick={() => setIsGridView(true)} title="Grid view" />
                            )}
                        </div>
                    </header>
                    <section className="market-search">
                        <div className="sort-wrapper">
                            <button className="market-sort-button" onClick={() => setShowSortMenu((open) => !open)}>
                                Sort <SortIcon id="sort-icon" />
                            </button>
                            {showSortMenu && (
                                <div className="sort-menu">
                                    <button onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}>Price: Low to High</button>
                                    <button onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}>Price: High to Low</button>
                                </div>
                            )}
                        </div>
                        <div className="filter-wrapper">
                            <button className="market-filter-button" onClick={() => setShowFilterMenu((open) => !open)}>
                                Filters <FilterAltIcon id="filter-icon" />
                            </button>
                            {showFilterMenu && (
                                <div className="filter-menu">
                                    <div className="slider-container">
                                        <label htmlFor="max-price">Price Range: Up to {currentMaxPrice}€</label>
                                        <input
                                            id="max-price"
                                            type="range"
                                            min="0"
                                            max={maxPrice || 1}
                                            value={currentMaxPrice}
                                            onChange={(e) => setCurrentMaxPrice(+e.target.value)}
                                        />
                                    </div>
                                    <div className="checkbox-container">
                                        <label>
                                            Only free items
                                            <input
                                                type="checkbox"
                                                checked={onlyFree}
                                                onChange={(e) => setOnlyFree(e.target.checked)}
                                                id="free-checkbox"
                                            />
                                        </label>
                                    </div>
                                    <div className="checkbox-container">
                                        <label>
                                            Open to trade
                                            <input
                                                type="checkbox"
                                                checked={openToTrade}
                                                onChange={(e) => setOpenToTrade(e.target.checked)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for items"
                                className="market-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="market-new-product-button" onClick={openListing}>
                            New Product <AddIcon id="add-icon" />
                        </button>
                    </section>

                    {loading && <p className="status-message">Loading listings...</p>}
                    {error && <p className="status-message status-error">{error}</p>}
                    {!loading && !error && filteredProducts.length === 0 && (
                        <p className="status-message">No items match your search yet. Be the first to list something.</p>
                    )}

                    <section className={`market-items ${isGridView ? 'grid-view' : 'list-view'}`}>
                        {filteredProducts.map((product) => {
                            const image = mediaSrc(product.images?.[0]);
                            return (
                                <div key={product.id} className="market-item">
                                    <h2>{product.title}</h2>
                                    {image ? (
                                        <img src={image} alt={product.title} />
                                    ) : (
                                        <div className="item-placeholder">No photo yet</div>
                                    )}
                                    <p>{product.description}</p>
                                    <div className="item-meta">
                                        <p className="item-price">{product.price === 0 || product.isFree ? 'Free' : formatPrice(product.price)}</p>
                                        <div className="item-badges">
                                            {product.isOpenToTrade ? <span className="badge-pill">Open to trade</span> : null}
                                            {product.sellerUsername ? <span className="badge-pill badge-muted">{product.sellerUsername}</span> : null}
                                        </div>
                                    </div>
                                    <div className="market-item-buttons">
                                        <Button
                                            variant="primary"
                                            className="buy-button"
                                            onClick={() => setContactItem({ product, mode: product.price === 0 || product.isFree ? 'Get' : 'Buy' })}
                                        >
                                            {product.price === 0 || product.isFree ? 'Get for Free' : 'Buy Now'}
                                        </Button>
                                        {product.isOpenToTrade ? (
                                            <Button
                                                variant="secondary"
                                                className="trade-button"
                                                onClick={() => setContactItem({ product, mode: 'Trade' })}
                                            >
                                                Trade
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </div>
            </div>
            <NewProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddProduct={handleAddProduct} />
            <ContactModal
                show={Boolean(contactItem)}
                onClose={() => setContactItem(null)}
                title={`${contactItem?.mode || 'Contact'} ${contactItem?.product?.title || ''}`}
                actionLabel={contactItem?.mode || 'request'}
                person={{
                    name: contactItem?.product?.sellerUsername,
                    email: contactItem?.product?.sellerEmail,
                    phone: contactItem?.product?.sellerPhone,
                }}
            />
        </div>
    );
};

export default Market;
