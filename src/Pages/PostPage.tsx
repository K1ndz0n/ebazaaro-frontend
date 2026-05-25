import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Post } from "../ApiService";
import ApiService from "../ApiService";
import { LuBookmark, LuBookmarkCheck, LuPencil } from "react-icons/lu";
import LoaderComponent from "../Modules/LoadingComponent";


export default function PostPage() {
    const { id } = useParams();
    const [data, setData] = useState<Post>();
    const navigate = useNavigate();
    const [isMyPost, setIsMyPost] = useState(false);
    const token = localStorage.getItem("token");

    const [currentPhtoto, setCurrentPhoto] = useState(0);
    const miniPhotoRefs = useRef<HTMLImageElement[]>([]);

    const [isLiked, setIsLiked] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsMyPost(false);
        setIsLoading(true);
        setIsLiked(false);
        if (id) {
            ApiService.getPost(Number(id)).then(async (post) => {
                if (post === null) {
                    navigate("/404");
                    return;
                }

                if (token) {
                    await ApiService.getLoggedUser(token).then(async (user) => {
                        if (user.name === post.author) {
                            await ApiService.isLiked(Number(id), token).then((liked) => {
                                setIsLiked(liked);
                                setIsMyPost(true);       
                            });

                            setIsLoading(false);
                        }
                    });
                }

                setIsLoading(false);

                if (post.photos.length > 1) {
                    post.photos.sort((a, b) => a.order - b.order);
                }

                setData(post);
            })
        }
    }, [id]);

    useEffect(() => {
        const activeMini = miniPhotoRefs.current[currentPhtoto];
        
        if (activeMini) {
            activeMini.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentPhtoto]);

    var photoComponent =
        <div className="photo-component">
            <div className="photo-viewer">
                {data && data.photos.length > 0 &&
                    <button 
                        className="photo-nav left"
                        onClick={() => setCurrentPhoto(Math.max(0, currentPhtoto - 1))}>
                        ‹</button>}

                {data && data.photos.length > 0 &&
                <img 
                    className="main-photo"
                    src={`${ApiService.url}/storage/${data.photos[currentPhtoto].path}`} />}
                
                {data && data.photos.length > 0 &&
                    <button 
                        className="photo-nav right"
                        onClick={() => currentPhtoto < data.photos.length - 1
                        && setCurrentPhoto(currentPhtoto + 1)}>
                        ›</button>}

                {data && data.photos.length === 0 && <p className="photo-nav no-photo">Brak zdjęć</p>}
            </div>

            <div className="mini-photos">
                {data?.photos.map((p, index) => (
                    <img
                        ref={(el) => {
                            if (el) {
                                miniPhotoRefs.current[index] = el;
                            } else {
                                delete miniPhotoRefs.current[index];
                            }
                        }}
                        src={`${ApiService.url}/storage/${p.path}`}
                        onClick={() => setCurrentPhoto(index)}
                        className={`mini-photo ${index === currentPhtoto ? 
                            "active" : "inactive"
                        }`} />
                ))}
            </div>
        </div>

    const handleLike = async () => {
        if (!token) return;
        if (isLiked) {
            await ApiService.deleteLike(Number(id), token);
            setIsLiked(false);
            return;
        }

        ApiService.addLike(Number(id), token).then(() => setIsLiked(true));
    }

    const likeButton = 
        <>
            {token &&
                <button
                    className={"like-button"}
                    onClick={() => handleLike()}
                >
                    {isLiked ? "Zapisano" : "Zapisz"}
                    {isLiked ? <LuBookmarkCheck size={24} /> : <LuBookmark size={24} />}
                </button>
            }
        </>

    if (isLoading) return <LoaderComponent />

    return(
        <div className="post-details">
            <div className="details-left">
                {photoComponent}
                <div className="description">
                    <span className="post-name">Opis</span>
                    <p style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{data?.description ?? "Brak opisu."}</p>
                </div>
            </div>
            <div className="details-right">
                <div className="post-info">
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <span className="post-name">{data?.name}</span>
                        <div style={{display: "flex"}}>
                            {isMyPost && <button className="edit-button" onClick={() => navigate(`/edit/${id}`)}><LuPencil size={18} /></button>}
                            {likeButton}
                        </div>
                    </div>
                    <span style={{color: "#494949"}}>
                        Ogłoszenie użytkownika {" "}
                        <span className="author-link" onClick={() => navigate(`/user/${data?.author}`)}>{data?.author}</span>
                    </span>
                    <span style={{color: "#494949", fontSize: "14px"}}>Utworzono {data?.created_at}</span>
                    <p style={{fontSize: "18px"}}>{data?.city.name}, {data?.city.voivodeship}</p>
                    <div className="info-down">
                        <span className="price">{data?.price} zł | {data?.condition === "new" ? "Nowy" : "Używany"}</span>
                    </div>
                </div>
                <div className="contact-info">
                    <span className="post-name">Dane kontaktowe</span>
                    <span className="contact-data">{data?.email}</span>
                    <span className="contact-data">Telefon: {data?.phone_number ?? "brak"}</span>
                </div>
            </div>
        </div>
    );
}