import { useEffect, useState } from "react";
import type { Thumbnail } from "../ApiService";
import ApiService from "../ApiService";
import BigThumbnail from "../Modules/BigThumbnail";
import PostThumbnail from "../Modules/PostThumbnail";
import LoaderComponent from "../Modules/LoadingComponent";


export default function Home() {
    const [latest, setLatest] = useState<Thumbnail[]>([]);
    const [torun, setTorun] = useState<Thumbnail[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const isMobile = window.innerWidth < 1025;

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async() => {
        await ApiService.getThumbnails("size=3")
            .then((data) => setLatest(data.data));

        await ApiService.getThumbnails("cityId=5419&size=5")
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
            {isMobile ?
                <>
                    {torun.map((th) => (
                        <BigThumbnail data={th} />
                    ))}
                </> :
                <>
                    {torun.map((th) => (
                        <PostThumbnail data={th} />
                    ))}
                </>}
            
        </div>
    );
}