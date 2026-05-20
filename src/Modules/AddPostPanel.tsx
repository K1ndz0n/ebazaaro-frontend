import { useEffect, useRef, useState } from "react";
import type { AddPostData, Category, City, Photo } from "../ApiService";
import { useNavigate, useParams } from "react-router";
import ApiService from "../ApiService";
import LoadingButton from "./LoadingButton";
import { LuChevronDown, LuChevronUp, LuX } from "react-icons/lu";
import LoaderComponent from "./LoadingComponent";
import { IoLocationSharp } from "react-icons/io5";
import { HiOutlineTrash } from "react-icons/hi";

interface AddPostProps {
    editMode: boolean;
}

export default function AddPostPanel({ editMode }: AddPostProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState<string | undefined>("");
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
    const [email, setEmail] = useState("");
    const [price, setPrice] = useState(0);
    const [categoryId, setCategoryId] = useState(0);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [condition, setCondition] = useState("");

    const [cities, setCities] = useState<City[]>([]);
    const [citySearch, setCitySearch] = useState("");
    const [city, setCity] = useState<City | null>(null);
    const [showCityMenu, setShowCityMenu] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);

    const token = localStorage.getItem("token");
    const { id } = useParams();
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const [showDeletePanel, setShowDeletePanel] = useState(false);

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
        if (id && token) {
            ApiService.getLoggedUser(token).then((user) => {
                ApiService.getPost(Number(id)).then((data) => {
                    if (!data) {
                        navigate("/404");
                        return;
                    }

                    if (user.name !== data.author) {
                        navigate("/");
                        return;
                    }
                    
                    setName(data.name);
                    setDescription(data.description);
                    setPhoneNumber(data.phone_number);
                    setEmail(data.email);
                    setPrice(data.price);
                    setCategoryId(data.category.id);
                    setCondition(data.condition);
                    setCity(data.city);

                    if (data.photos.length > 1) {
                        data.photos.sort((a, b) => a.order - b.order);
                    }
                        
                    data.photos.forEach((p) => {
                        p.path = `${ApiService.url}/storage/${p.path}`;
                    });
                    setPhotos(data.photos);

                    ApiService.getCategories().then((cat) => {
                        cat.sort((a, b) => b.id - a.id);
                        setCategories(cat);
                        setIsLoading(false);
                    });
                });

            });
        } else {
            ApiService.getCategories().then((cat) => {
                cat.sort((a, b) => b.id - a.id);
                setCategories(cat);
                setIsLoading(false);
            });
        }
    }, [id]);

    useEffect(() => {
        setCities([]);
        if (citySearch !== "" || citySearch.length > 2) {
            ApiService.getCities(citySearch).then((cit) => {
                setCities(cit);
            });
        }
    }, [citySearch]);


    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^(?:\+48)?[ -]?(?:[0-9]{3}[ -]?){2}[0-9]{3}$/;
        return phoneRegex.test(phone.trim());
    };

    const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        const newPhotos: Photo[] = files.map((file, index) => ({
            id: -1,
            file: file,
            path: URL.createObjectURL(file), 
            order: photos.length + index + 1    
        }));

        setPhotos([...photos, ...newPhotos]);
    }

    const removePhoto = (indexToRemove: number) => {
        const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
        const reindexedPhotos = updatedPhotos.map((photo, idx) => ({
            ...photo,
            order: idx + 1
        }));

        setPhotos(reindexedPhotos);
    }

    const moveUp = (index: number) => {
        const updatedPhotos = [...photos];
        const temp = updatedPhotos[index];
        updatedPhotos[index] = updatedPhotos[index - 1];
        updatedPhotos[index - 1] = temp;

        const reindexedPhotos = updatedPhotos.map((photo, idx) => ({
            ...photo,
            order: idx + 1
        }));

        setPhotos(reindexedPhotos);
    };

    const moveDown = (index: number) => {
        const updatedPhotos = [...photos];
        const temp = updatedPhotos[index];
        updatedPhotos[index] = updatedPhotos[index + 1];
        updatedPhotos[index + 1] = temp;

        const reindexedPhotos = updatedPhotos.map((photo, idx) => ({
            ...photo,
            order: idx + 1
        }));

        setPhotos(reindexedPhotos);
    };

    const handleRequest = async () => {
        if (!validateEmail(email)) {
            setError("Niepoprawny email.");
            return;
        }

        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            setError("Niepoprawny numer telefonu.");
            return;
        }

        const formData = new FormData();
        photos.forEach((photo, index) => {
            formData.append(`photos[${index}][id]`, photo.id.toString());
            formData.append(`photos[${index}][order]`, photo.order.toString());

            if (photo.id === -1 && photo.file) {
                formData.append(`photos[${index}][file]`, photo.file);
            }
        });

        if (!city) {
            return;
        }

        const postData: AddPostData = {
            name: name,
            description: description,
            city_id: city?.id,
            phone_number: phoneNumber,
            email: email,
            price: price,
            condition: condition,
            category_id: categoryId,
        };

        try {
            if (editMode && token) {
                await ApiService.updatePost(Number(id), postData, token).then(async () => {
                    await ApiService.setPhotos(Number(id), formData, token).then(() => {
                        navigate(`/post/${id}`);
                    }) 
                })
            } else {
                if (token) {
                    await ApiService.addPost(postData, token).then(async (res) => {
                        await ApiService.setPhotos(res.id, formData, token).then(() => {
                            navigate(`/post/${res.id}`);
                        }) 
                    })
                }
            }
        } catch { }
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

        setCity(cities[index]);
    }

    const handleDelete = async () => {
        if (!token) return;
        await ApiService.deletePost(Number(id), token);
        navigate("/");
    }

    const citiesComponent = 
         <div className="city-search-container" ref={menuRef}>
            <IoLocationSharp size={25} color="#666" />
            <span className="city-searchbar" onClick={() => handleMenuCLick()}>
                {city
                ? city.name + ", " + city.voivodeship
                : ""}
            </span>
                
            {showCityMenu &&
                <div className="city-menu">
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

    if (isLoading) return <LoaderComponent />

    return(
        <div className="add-panel">
            {editMode &&
                <button className="delete-post-button" onClick={() => setShowDeletePanel(true)}>
                    <HiOutlineTrash color="red" size={35} />
                </button>
            }

            {showDeletePanel &&
                <div className="delete-panel-overlay">
                    <p>Czy na pewno chcesz usunąć ten post?</p>
                    <div>
                        <button className="delete-panel-button delete" onClick={() => handleDelete()}>Tak</button>
                        <button className="delete-panel-button" onClick={() => setShowDeletePanel(false)}>Nie</button>
                    </div>  
                </div>
            }

            <div className="add-panel-wrapper">
                <div className="add-panel-left">

                    <p>Podstawowe dane</p>
                    <div className="add-post-input">
                        <label>Nazwa</label>
                        <input type="text" onChange={(e) => setName(e.target.value)} value={name}/>
                    </div>
                    <div className="add-post-input">
                        <label>Opis (opcjonalnie)</label>
                        <textarea onChange={(e) => setDescription(e.target.value)} value={description} />
                    </div>

                    <p>Dane kontaktowe</p>
                    <div className="add-post-input">
                        <label>Email</label>
                        <input type="text" onChange={(e) => setEmail(e.target.value)} value={email}/>
                    </div>
                    <div className="add-post-input">
                        <label>Numer telefonu (opcjonalnie)</label>
                        <input type="text" onChange={(e) => setPhoneNumber(e.target.value)} value={phoneNumber}/>
                    </div>
                </div>
                <div className="add-panel-middle">
                    <p>Lokalizacja</p>
                    {citiesComponent}

                    <div className="add-post-input">
                        <label>Stan</label>
                        <select
                            onChange={(e) => setCondition(e.target.value)}
                            className="filter-select"
                            value={condition}
                        >
                            <option value="" />
                            <option value="new">Nowy</option>
                            <option value="used">Używany</option>
                        </select>
                    </div>
                    <div className="add-post-input">
                        <label>Cena</label>
                        <input type="number" onChange={(e) => setPrice(Number(e.target.value))} value={price ?? null}/>
                    </div>
                    <div className="add-post-input">
                        <label>Kategoria</label>
                        <select
                            value={categoryId ?? 0}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            className="filter-select"
                        >
                            <option value={0}></option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="add-panel-right">
                    <p>Zdjęcia</p>
                    <div className="add-photo-panel">
                        {photos.map((p, index) => (
                            <div className="photo-row">
                                <img 
                                    className="mini-photo"
                                    src={p.path}/>
                                <button
                                    disabled={index === 0}
                                    onClick={() => moveUp(index)}
                                    className="add-photo-nav"><LuChevronUp size={20} /></button>
                                <button
                                    disabled={index === photos.length - 1}
                                    onClick={() => moveDown(index)}
                                    className="add-photo-nav"><LuChevronDown size={20} /></button>
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="add-photo-nav"><LuX size={18} /></button>
                            </div>
                        ))}
                    </div>
                    <label className="add-photo-button">
                        <input 
                            type="file" 
                            multiple
                            accept="image/*" 
                            onChange={addPhoto} 
                            style={{ display: 'none' }} 
                        />
                        <span>+ Nowe zdjęcie</span>
                    </label>
                </div>
            </div>

            <p className="error-message">{error}</p>
            <LoadingButton
                ref={buttonRef}
                className="form-button"
                disabled={name === "" || city === null
                     || email === ""
                    || price < 0 || price > 10000000 || price === null
                    || categoryId === 0 || categoryId === null
                    || condition === ""}
                text={editMode ? "Zapisz" : "Dodaj"}
                onClick={() => handleRequest()}
            />
        </div>
    );
}