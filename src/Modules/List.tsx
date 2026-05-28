import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import type { City, ThumbnailResponse } from "../ApiService";
import ApiService from "../ApiService";
import PostThumbnail from "./PostThumbnail";
import LoaderComponent from "./LoadingComponent";
import { IoLocationSharp } from "react-icons/io5";
import { HiOutlineTrash } from "react-icons/hi";
import { FiCrosshair } from "react-icons/fi";

interface ListProps {
    fetchFunction: (queryString: string) => Promise<ThumbnailResponse>;
}

export default function List({ fetchFunction }: ListProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tempParams, setTempParams] = useState<URLSearchParams>(searchParams);
    const [data, setData] = useState<ThumbnailResponse>();
    const [page, setPage] = useState(1);

    const [cities, setCities] = useState<City[]>([]);
    const [citySearch, setCitySearch] = useState("");
    const [selectedCity, setSeletedCity] = useState<City | null>(null);
    const [showCityMenu, setShowCityMenu] = useState(false);

    const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

    const [isLoading, setIsLoading] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowCityMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const pageNumber = searchParams.get("page");
        if (pageNumber) {
            setPage(Number(pageNumber));
        } else {
            setPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        setIsLoading(true);
        fetchFunction(searchParams.toString()).then((th) => {
            setData(th);
            const cityId = searchParams.get("city_id");
            if (cityId) {
                ApiService.getCityById(Number(cityId)).then((c) => {
                    setSeletedCity(c);
                    setIsLoading(false);
                })
            }

            const lat = Number(searchParams.get("user_lat"));
            const lng = Number(searchParams.get("user_lng"));
            if (lat && lng) {
                setCoords({ lat, lng })
            }

            setIsLoading(false);
        });
    }, [searchParams]);

    useEffect(() => {
        setCities([]);
        if (citySearch !== "" || citySearch.length > 2) {
            ApiService.getCities(citySearch).then((cit) => {
                setCities(cit);
            });
        }
    }, [citySearch]);

    const updateParam = async (key: string, value: string) => {
        const newParams = new URLSearchParams(tempParams);
        
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        
        await setTempParams(newParams);
    };

    const applyParams = () => {
        console.log(tempParams.get("user_lng")?.toString());
        setSearchParams(tempParams);
    }

    const changePage = (pageNumber: number) => {
        if (page < pageNumber) {
            window.scrollTo({
            top: 0
            });
        }

        setPage(pageNumber);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", pageNumber.toString());
        setSearchParams(newParams);
    } 

    const handleMenuCLick = () => {
        setCities([]);
        setShowCityMenu(!showCityMenu);
        setCitySearch("");
    }

    const handleCityClick = (index: number) => {
        setCities([]);
        setShowCityMenu(false);
        setCitySearch("");

        if (index === -1) {
            tempParams.delete("user_lat");
            tempParams.delete("user_lng");
            tempParams.delete("radius");
            setSeletedCity(null);
            tempParams.delete("city_id");
            setCoords({ lat: null, lng: null}); 
            return;
        }

        setSeletedCity(cities[index]);
        updateParam("city_id", cities[index].id.toString());
    }

    const handleMyLocalization = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setCoords({ lat, lng });

                tempParams.set("user_lat", lat.toString());
                tempParams.set("user_lng", lng.toString());
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );

        setShowCityMenu(false);
    }

    const citiesComponent = 
        <div className="city-search-container" ref={menuRef}>
            <IoLocationSharp size={25} color="#666" />
            <span className="city-searchbar" onClick={() => handleMenuCLick()}>
                {selectedCity
                ? selectedCity.name + ", " + selectedCity.voivodeship
                : coords.lat ? "Moja lokalizacja" : "Cała Polska"}
            </span>
            <select
                disabled={!selectedCity && !coords.lat && !coords.lng}
                value={!selectedCity && !coords.lat && !coords.lng ? "" : tempParams.get("radius") ?? "0"}
                onChange={(e) => updateParam("radius", e.target.value)}
                className="filter-select"
            >
                <option value="0">+0 km</option>
                <option value="10">+10 km</option>
                <option value="20">+20 km</option>
                <option value="30">+30 km</option>
                <option value="50">+50 km</option>
                <option value="75">+75 km</option>
                <option value="100">+100 km</option>
                <option value="150">+150 km</option>
                <option value="200">+200 km</option>
            </select>
            
            {showCityMenu &&
                <div className="city-menu">
                    <span className="city-button" onClick={() => handleCityClick(-1)}>Cała Polska</span>
                    <span className="city-button my-localization" onClick={() => handleMyLocalization()}>
                        <div className="localization-label">
                            <FiCrosshair color="black" />
                            {" "}Moja lokalizacja
                        </div>
                        <span className="localization-permission">Wymaga pozwolenia na lokalizację</span>
                    </span>
                    <input 
                        type="text"
                        placeholder="Miejscowość"
                        onChange={(e) => setCitySearch(e.target.value)}
                    />
                    {cities.map((c, index) => (
                        <span className="city-button" onClick={() => handleCityClick(index)}>{c.name + ", " + c.voivodeship}</span>
                    ))}
                </div>
            }
        </div>

    const clearParams = () => {
        setTempParams(new URLSearchParams({}));
        setSearchParams({});
        setSeletedCity(null);
    }

    if (isLoading) return <LoaderComponent />

    return(
        <>
            <div className="filters-wrapper">
                <div className="searchbar-wrapper">
                    <input
                        className="search-input"
                        type="text"
                        value={tempParams.get("search") ?? ""}
                        placeholder="Wpisz frazę..." 
                        onChange={(e) => updateParam("search", e.target.value)}/>

                    <button className="search-button" onClick={() => applyParams()}>
                        <LuSearch size={18} />
                        <span>Szukaj</span>
                    </button>
                    <button className="clear-button" onClick={() => clearParams()}>
                        <HiOutlineTrash color="black" size={35} />
                    </button>
                </div>

                <div className="filters-down">
                    <div className="filter-input-wrapper">
                        <label>Lokalizacja</label>
                        {citiesComponent}
                    </div>
                    
                    <div className="filter-input-wrapper">
                        <label>Cena min (zł)</label>
                        <input
                            type="number"
                            min={0}
                            value={tempParams.get("price_from") ?? ""}
                            onChange={(e) => updateParam("price_from", e.target.value)}/>
                    </div>
                    <div className="filter-input-wrapper">
                        <label>Cena max (zł)</label>
                        <input
                            type="number"
                            min={0}
                            value={tempParams.get("price_to") ?? ""}
                            onChange={(e) => updateParam("price_to", e.target.value)}/>
                    </div>
                    <div className="filter-input-wrapper">
                        <label>Stan</label>
                        <select
                            value={tempParams.get("condition") ?? ""}
                            onChange={(e) => updateParam("condition", e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Każdy</option>
                            <option value="new">Nowy</option>
                            <option value="used">Używany</option>
                        </select>
                    </div>

                    <div className="filter-input-wrapper">
                        <label>Sortuj</label>
                        <select
                            value={tempParams.get("sort") ?? "newest"}
                            onChange={(e) => updateParam("sort", e.target.value)}
                            className="filter-select"
                        >
                            <option value="newest">Najnowsze</option>
                            <option value="oldest">Najstarsze</option>
                            <option value="price_asc">Cena rosnąco</option>
                            <option value="price_desc">Cena malejąco</option>
                        </select>
                    </div>
                </div>
                <span className="post-number">{data?.meta.total} ogłoszeń</span>
            </div>

            {data?.data.map((t) => (
                <PostThumbnail data={t}/>
            ))}

            <div className="page-manager">
                <button
                    className="page-button"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                >
                    <LuChevronLeft size={25} />
                </button>
                <span>Strona {page} {" "}</span>
                <span>z {" "}</span>
                <span className="last-page" onClick={() => data?.meta && changePage(data?.meta.last_page)}>
                    {data?.meta.last_page}
                </span>
                <button
                    className="page-button"
                    disabled={!data?.meta || page >= data.meta.last_page}
                    onClick={() => changePage(page + 1)}
                >
                    <LuChevronRight size={25} />
                </button>
            </div>
        </>
    );
}