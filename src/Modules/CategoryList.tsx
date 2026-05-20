import { useEffect, useState } from "react";
import type { Category } from "../ApiService";
import ApiService from "../ApiService";
import { LuChevronRight } from "react-icons/lu";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import LoaderComponent from "./LoadingComponent";

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isInBrowser, setIsInBrowser] = useState(false);

    const navigate = useNavigate();
    const [params] = useSearchParams();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        ApiService.getCategories().then((cat) => {
            cat.sort((a, b) => b.id - a.id);
            setCategories(cat);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        setIsInBrowser(false);
        if (location.pathname === "/browser") {
            setSelectedCategory("");
            setIsInBrowser(true);
        }

        const cat = params.get("category");
        if (cat) {
            setSelectedCategory(cat);
        }
    }, [params, location])

    const handleCategoryClick = (categoryName: string) => {
        const newParams = new URLSearchParams(params);
        if (categoryName === "") {
            newParams.delete("category");
        } else {
            newParams.set("category", categoryName);
        }

        newParams.set("page", "1");
        navigate(`/browser?${newParams.toString()}`);
    };

    if (isLoading) return(
        <div className="categories">
            <LoaderComponent />
        </div>
    );

    return(
        <div className="categories">
            <span
                className={`category-button all ${selectedCategory === "" && isInBrowser ? "selected" : ""}`}
                onClick={() => handleCategoryClick("")}>
                <span>Wszystkie</span>
                <LuChevronRight />
            </span>

            {categories.map(c => (
                <span
                    key={c.id}
                    className={`category-button ${selectedCategory.toUpperCase() === c.name.toUpperCase() && isInBrowser ? "selected" : ""}`}
                    onClick={() => handleCategoryClick(c.name)}>
                    <span>{c.name}</span>
                    <LuChevronRight />
                </span>
            ))}
        </div>
    );
}