import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardTab from '@mui/icons-material/KeyboardTab';
import './../styles/NavBar.css';
import hookIcon from './../assets/icons/hook.svg';
import { useAuth } from '../context/AuthContext';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, user, logout, openLogin, openSignup } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleDrawer = (open) => () => setIsDrawerOpen(open);

    const goTo = (path) => {
        setIsDrawerOpen(false);
        navigate(path);
    };

    const goToAbout = () => {
        setIsDrawerOpen(false);
        if (location.pathname === '/' || location.pathname === '/home') {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        navigate('/');
        setTimeout(() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    };

    const isActive = (path) => location.pathname === path;

    const drawerContent = (
        <div className="drawer-content">
            <KeyboardTab className="drawer-close" onClick={toggleDrawer(false)} />
            <Nav className="flex-column">
                <Nav.Link onClick={() => goTo('/market')}>Market</Nav.Link>
                <Nav.Link onClick={() => goTo('/rentaboat')}>Rent a Boat</Nav.Link>
                <Nav.Link onClick={() => goTo('/forum')}>Forum</Nav.Link>
                <Nav.Link onClick={() => goTo('/faq')}>FAQ</Nav.Link>
                <Nav.Link onClick={goToAbout}>About</Nav.Link>
                {isLoggedIn ? (
                    <>
                        <Nav.Link onClick={() => goTo('/profile')}>{user?.username || 'Profile'}</Nav.Link>
                        <Nav.Link onClick={handleLogout}>Log Out</Nav.Link>
                    </>
                ) : (
                    <Nav.Link onClick={() => { setIsDrawerOpen(false); openLogin(); }}>Account</Nav.Link>
                )}
            </Nav>
        </div>
    );

    return (
        <Navbar className="custom-navbar" variant="dark" expand="lg" fixed="top">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    Hook&Grab
                    <img src={hookIcon} alt="Hook&Grab" id="icon-brand" />
                </Navbar.Brand>

                <div className="d-lg-none">
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon id="burger" />
                    </IconButton>
                </div>

                <div className="d-none d-lg-flex w-100 justify-content-end">
                    <Nav className="me-auto">
                        <Nav.Link className={isActive('/market') ? 'nav-active' : ''} onClick={() => navigate('/market')}>Market</Nav.Link>
                        <Nav.Link className={isActive('/rentaboat') ? 'nav-active' : ''} onClick={() => navigate('/rentaboat')}>Rent a Boat</Nav.Link>
                        <Nav.Link className={isActive('/forum') ? 'nav-active' : ''} onClick={() => navigate('/forum')}>Forum</Nav.Link>
                        <Nav.Link className={isActive('/faq') ? 'nav-active' : ''} onClick={() => navigate('/faq')}>FAQ</Nav.Link>
                        <Nav.Link onClick={goToAbout}>About</Nav.Link>
                    </Nav>
                    <Nav>
                        <NavDropdown title={isLoggedIn ? (user?.username || 'Account') : 'Account'} id="account-dropdown" align="end">
                            {isLoggedIn ? (
                                <>
                                    <NavDropdown.Item onClick={() => navigate('/profile')} className="no-text-shadow">Profile</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="no-text-shadow">Log Out</NavDropdown.Item>
                                </>
                            ) : (
                                <>
                                    <NavDropdown.Item onClick={openLogin} className="no-text-shadow">Log In</NavDropdown.Item>
                                    <NavDropdown.Item onClick={openSignup} className="no-text-shadow">Sign Up</NavDropdown.Item>
                                </>
                            )}
                        </NavDropdown>
                    </Nav>
                </div>
            </Container>

            <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
                {drawerContent}
            </Drawer>
        </Navbar>
    );
}

export default NavBar;
