import ApiService from "../ApiService";
import List from "../Modules/List";


export default function LikedPosts() {
    const token = localStorage.getItem("token") ?? "";

    return(
        <div className="browser">
            <p className="user-title">Zapisane posty</p>
            <List fetchFunction={(queryString) => ApiService.getLikedPosts(queryString, token)} />
        </div>
        
    );
}