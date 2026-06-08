export interface User {
    id: number;
    username: string;
}

export interface LoginData {
    token: string;
}

export interface Category {
    id: number;
    name: string;
}

interface CategoryResponse {
    data: Category[];
}

export interface City {
    id: number;
    name: string;
    voivodeship: string;
    latitude: number;
    longtitude: number;
}

interface CitiesResponse {
    data: City[];
}

export interface Thumbnail {
    id: number;
    name: string;
    city: City;
    price: number;
    condition: string;
    thumbnailPhoto?: string;
    category: string;
    author: string;
}

export interface Meta {
    currentPage: number;
    lastPage: number;
    total:number;
}

export interface ThumbnailResponse {
    data: Thumbnail[];
    meta: Meta;
}

export interface Photo {
    id: number;
    path: string;
    order: number;
    file?: File;
}

export interface Post {
    id: number;
    name: string;
    description?: string;
    city: City;
    price: number;
    email: string;
    phoneNumber?: string;
    condition: string;
    createdAt: string;
    photos: Photo[];
    category: Category;
    author: string;
}

export interface AddPostData {
    name: string;
    description?: string;
    cityId: number;
    phoneNumber?: string
    email: string;
    price: number;
    condition: string;
    categoryId: number;
}

export default class ApiService {
    static url = import.meta.env.VITE_API_URL;

    static async getLoggedUser(token: string) {
        const response = await fetch(
            `${this.url}/api/user/me/details`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Błąd autoryzacji");
        }

        return await response.json() as User;
    }

    static async login(email: string, password: string) {
        const response = await fetch(
            `${this.url}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        let data;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error("Niepoprawny email lub hasło");
            }

            throw new Error("Coś poszło nie tak, spróbuj ponownie później");
        }

        return data as LoginData;
    }

    static async register(email: string, username: string, password: string, 
        confirmPassword: string, recaptchaToken: string | null | undefined) {
    
        const response = await fetch(`${this.url}/api/auth/register`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                username,
                password,
                confirmPassword,
                recaptchaToken
            })
        });
 
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                throw data;
            }
            throw new Error(data.message || "Coś poszło nie tak");
        }

        return data as LoginData;
    }

    static async getCategories() {
        const response = await fetch(`${this.url}/api/categories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as Category[];
    }

    static async getThumbnails(params: string) {
        const response = await fetch(`${this.url}/api/posts/thumbnails?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as ThumbnailResponse;
    }

    static async getThumbnailsByUsername(params: string, username: string) {
        const response = await fetch(`${this.url}/api/posts/thumbnails/${username}?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as ThumbnailResponse;
    }

    static async userExists(username: string) {
        const response = await fetch(`${this.url}/api/user/${username}`, {
            method: "GET"
        });

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return true;
    }

    static async getPost(id: number) {
        const response = await fetch(`${this.url}/api/posts/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as Post;
    }

    static async addPost(data: AddPostData, token: string) {
        const response = await fetch(`${this.url}/api/posts/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as Post;
    }

    static async updatePost(id: number, data: AddPostData, token: string) {
        const response = await fetch(`${this.url}/api/posts/edit/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as Post;
    }

    static async setPhotos(id: number, data: FormData, token: string) {
        const response = await fetch(`${this.url}/api/photos/set/${id}`, {
            method: "POST",
            body: data,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }
    }

    static async getCities(name: string) {
        const response = await fetch(`${this.url}/api/cities/find/${name}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as City[];
    }

    static async getCityById(id: number) {
        const response = await fetch(`${this.url}/api/cities/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as City;
    }

    static async deletePost(id: number, token: string) {
        const response = await fetch(`${this.url}/api/posts/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return;
    }
    
    static async addLike(id: number, token: string) {
        const response = await fetch(`${this.url}/api/likes/add/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return;
    }

    static async deleteLike(id: number, token: string) {
        const response = await fetch(`${this.url}/api/likes/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return;
    }

    static async isLiked(id: number, token: string) {
        const response = await fetch(`${this.url}/api/likes/exists/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return true;
    }

    static async getLikedPosts(params: string, token: string) {
        const response = await fetch(`${this.url}/api/posts/thumbnails/liked?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json() as ThumbnailResponse;
    }
}