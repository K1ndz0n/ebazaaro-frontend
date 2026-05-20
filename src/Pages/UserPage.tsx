import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ApiService from "../ApiService";
import LoaderComponent from "../Modules/LoadingComponent";
import List from "../Modules/List";


export default function UserPage() {
    const { username } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (username) {
            ApiService.userExists(username).then((exists) => {
                setIsLoading(false);
                if (!exists) {
                    navigate("/404");
                }
            });
        }
    }, [username]);

    if (isLoading) {
        return <LoaderComponent />
    }
    
    return(
        <div className="browser">
            <p className="user-title">Ogłoszenia użytkownika {username}</p>
            {username &&
            <List fetchFunction={(queryString) => ApiService.getThumbnailsByUsername(queryString, username)} />}
        </div>
    );
}