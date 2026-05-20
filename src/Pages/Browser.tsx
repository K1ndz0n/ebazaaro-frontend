import List from "../Modules/List";
import ApiService from "../ApiService";


export default function Browser() {

    return(
        <div className="browser">
            <List fetchFunction={(queryString) => ApiService.getThumbnails(queryString)} />
        </div>
    );
}