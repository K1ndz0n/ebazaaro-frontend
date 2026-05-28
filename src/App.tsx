import './App.css'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import Footer from './Modules/Footer'
import { useState } from 'react'
import NavMenu from './Modules/NavMenu';
import { LuMenu } from "react-icons/lu";
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import CategoryList from './Modules/CategoryList';
import Browser from './Pages/Browser';
import UserPage from './Pages/UserPage';
import PostPage from './Pages/PostPage';
import AddPostPanel from './Modules/AddPostPanel';
import LikedPosts from './Pages/LikedPosts';

interface Props {
  children: React.ReactNode;
}

function AppContent() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const hideCategoryOn = ["/login", "/register", "/add", "/saved"];
    const shouldHideCategories = 
        hideCategoryOn.includes(location.pathname) || 
        location.pathname.startsWith("/user/") ||
        location.pathname.startsWith("/edit/") ||
        location.pathname.startsWith("/post/");

    const ProtectedRoute = ({ children }: Props) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return <Navigate to="/" replace />;
        }

        return children;
    };

    const NotLoggedInRoute = ({ children }: Props) => {
        const token = localStorage.getItem("token");

        if (token) {
            return <Navigate to="/" replace />;
        }

        return children;
    }

    return (
            <div className='app'>
                <header>
                    <img className='logo' src="/logo.png" onClick={() => navigate("/")} />
                    <button className='menu-button' onClick={() => setMenuOpen(true)}>
                        <LuMenu size={24} />
                    </button>    
                </header>

                

                <main>
                    {!shouldHideCategories && <CategoryList />}
                    <NavMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/browser" element={<Browser />} />
                        <Route path="/user/:username" element={<UserPage />} />
                        <Route path="/post/:id" element={<PostPage />} />

                        <Route path="/login" element={
                            <NotLoggedInRoute>
                                <Login />
                            </NotLoggedInRoute>
                        } />
                        
                        <Route path="/register" element={
                            <NotLoggedInRoute>
                                <Register />
                            </NotLoggedInRoute>
                        } />

                        <Route path="/add" element={
                            <ProtectedRoute>
                                <AddPostPanel editMode={false} />
                            </ProtectedRoute>
                        } />

                        <Route path="/edit/:id" element={
                            <ProtectedRoute>
                                <AddPostPanel editMode={true} />
                            </ProtectedRoute>
                        } />

                        <Route path="/saved" element={
                            <ProtectedRoute>
                                <LikedPosts />
                            </ProtectedRoute>
                        } />
                    </Routes>

                </main>

                <Footer />
            </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App
