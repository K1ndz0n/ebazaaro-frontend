import { useNavigate } from "react-router";
import type { Thumbnail } from "../ApiService";
import Icon from "./Icon";
import ApiService from "../ApiService";

interface ThumbnailProps {
    data: Thumbnail
}

export default function PostThumbnail({ data }: ThumbnailProps) {
    const navigate = useNavigate();
    const photo = data.thumbnailPhoto
        ? <img
            className="thumbnail-photo"
            src={`${ApiService.url}/storage/${data.thumbnailPhoto}`} />
        : <Icon />

    const handleAuthorClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation();
        navigate(`/user/${data.author}`);
    }

    return(
        <div className="thumbnail" onClick={() => navigate(`/post/${data.id}`)}>
            {photo}
            <div className="thumbnail-info-wrapper">
                <div>
                    <span className="title">{data.name}</span>
                    <p style={{color: "#616161"}}>{data.city.name}, {data.city.voivodeship}</p>
                    <span className="thumbnail-category">{data.category}</span>
                </div>
                <div className="info-right">
                    <span className="condition">{data.condition === "NEW" ? "Nowy" : "Używany"}</span>
                    <p style={{fontWeight: "bold"}}>{data.price} zł</p>
                    <span className="user-info">
                        Od użytkownika {" "}
                        <span className="author-link" onClick={(e) => handleAuthorClick(e)}>{data.author}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}