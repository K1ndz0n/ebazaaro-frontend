import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import type { User } from "../ApiService";
import ApiService from "../ApiService";
import { useNavigate } from "react-router";
import { FiPower } from "react-icons/fi";
import LoaderComponent from "./LoadingComponent";

interface NavMenuProps {
    menuOpen: boolean;
    setMenuOpen: (value: boolean) => void;
}

export default function NavMenu({ menuOpen, setMenuOpen }: NavMenuProps) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const [instantClose, setInstantClose] = useState(false);

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            ApiService.getLoggedUser(token).then((u) => {
                setUser(u);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const handleClick = (path: string) => {
        setInstantClose(true);
        setMenuOpen(false);
        navigate(path);
        setTimeout(() => setInstantClose(false), 100);
    }

    const handleLogout = () => {
        setInstantClose(true);
        setMenuOpen(false);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
        setTimeout(() => setInstantClose(false), 100);
    }

    return (
        <>
            <div className={`nav-menu-overlay ${menuOpen ? 'open' : ''} ${instantClose ? 'no-transition' : ''}`} 
                 onClick={() => setMenuOpen(false)}></div>

            <div className={`nav-menu ${menuOpen ? 'open' : ''} ${instantClose ? 'no-transition' : ''}`}>
                <div className="menu-button-wrapper">
                    <button className='menu-button' onClick={() => setMenuOpen(false)}><LuX size={24} /></button>
                </div>
                {token ?
                <>
                    {isLoading ? <div style={{margin: "auto", position: "relative"}}><LoaderComponent /></div> :
                    <>
                        <button className="nav-button add" onClick={() => handleClick("/add")}>+ Dodaj</button>
                        <button className="nav-button" onClick={() => handleClick(`/user/${user?.username}`)}>Moje ogłoszenia</button>
                        <button className="nav-button" onClick={() => handleClick("/saved")}>Zapisane ogłoszenia</button>
                        <p>{user?.username}</p>
                        <button className="nav-button logout" onClick={() => handleLogout()}><FiPower /> Wyloguj</button>
                    </>}
                </>
                : <>
                    <button className="nav-button" onClick={() => handleClick("/login")}>Zaloguj</button>
                    <button className="nav-button" onClick={() => handleClick("/register")}>Zarejestruj się</button>
                </>}
            </div>   
        </>
    );
}