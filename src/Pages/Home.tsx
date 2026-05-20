import { useEffect, useState } from "react";
import type { Post, Thumbnail } from "../ApiService";
import ApiService from "../ApiService";
import { data } from "react-router";
import BigThumbnail from "../Modules/BigThumbnail";
import PostThumbnail from "../Modules/PostThumbnail";
import LoaderComponent from "../Modules/LoadingComponent";


export default function Home() {
    const [latest, setLatest] = useState<Thumbnail[]>([]);
    const [torun, setTorun] = useState<Thumbnail[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async() => {
        await ApiService.getThumbnails("page_size=3")
            .then((data) => setLatest(data.data));

        await ApiService.getThumbnails("city_id=5419&page_size=5")
            .then((data) => setTorun(data.data));

        setIsLoading(false);
    }

    if (isLoading) return <LoaderComponent />

    return(
        <div className="home-page">
            <p className="home-page-text">Najnowsze ogłoszenia</p> 
            <div className="latest">        
                {latest.map((th) => (
                    <BigThumbnail data={th} />
                ))}
            </div>


            <p className="home-page-text">Ogłoszenia w: Toruń</p>
            {torun.map((th) => (
                <PostThumbnail data={th} />
            ))}
        </div>
    );
}