import { ClipLoader } from "react-spinners";

function LoaderComponent() {
    return(
        <div className="loader-container">
                <ClipLoader color="#000000" size={50} />
                <p className="no-content-info">Ładowanie...</p>
        </div>
    )
}

export default LoaderComponent;