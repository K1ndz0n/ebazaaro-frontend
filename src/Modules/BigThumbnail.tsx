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

    return(
        <div className="big-thumbnail" onClick={() => navigate(`/post/${data.id}`)}>
            {photo}
            <div className="big-thumbnail-info-wrapper">
                <div className="big-info-left">
                    <span className="title">{data.name}</span>
                    <span style={{color: "#616161", wordBreak: 'break-word'}}>{data.city.name}, {data.city.voivodeship}</span>
                    <span className="big-thumbnail-category">{data.category}</span>
                </div>
                <div className="big-info-right">
                    <span className="big-condition">{data.condition === "NEW" ? "Nowy" : "Używany"}</span>
                    <span className="big-price">{data.price} zł</span>
                </div>
            </div>
        </div>
    );
}