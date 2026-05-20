import { useNavigate } from "react-router";
import type { Thumbnail } from "../ApiService";
import Icon from "./Icon";
import ApiService from "../ApiService";

interface ThumbnailProps {
    data: Thumbnail
}

export default function BigThumbnail({ data }: ThumbnailProps) {
    const navigate = useNavigate();
    const photo = data.thumbnailPhoto
        ? <img
            className="big-thumbnail-photo"
            src={`${ApiService.url}/storage/${data.thumbnailPhoto}`} />
        : <Icon />

    const handleAuthorClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation();
        navigate(`/user/${data.author}`);
    }

    return(
        <div className="big-thumbnail" onClick={() => navigate(`/post/${data.id}`)}>
            {photo}
            <div className="big-thumbnail-info-wrapper">
                <div className="big-info-left">
                    <span className="title">{data.name}</span>
                    <p style={{color: "#616161", wordBreak: 'break-word'}}>{data.city.name}, {data.city.voivodeship}</p>
                    <span className="thumbnail-category">{data.category}</span>
                </div>
                <div className="big-info-right">
                    <span className="big-condition">{data.condition === "NEW" ? "Nowy" : "Używany"}</span>
                    <p className="big-price">{data.price} zł</p>
                </div>
            </div>
        </div>
    );
}