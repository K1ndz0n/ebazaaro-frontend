export interface User {
    id: number;
    name: string;
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
    current_page: number;
    last_page: number;
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
    phone_number?: string;
    condition: string;
    created_at: string;
    photos: Photo[];
    category: Category;
    author: string;
}

export interface AddPostData {
    name: string;
    description?: string;
    city_id: number;
    phone_number?: string
    email: string;
    price: number;
    condition: string;
    category_id: number
}

export default class ApiService {
    static url = import.meta.env.VITE_API_URL;

    static async getLoggedUser(token: string) {
        const response = await fetch(
            `${this.url}/api/user`, {
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
            if (response.status === 401) {
                throw new Error("Niepoprawny email lub hasło");
            }

            throw new Error("Coś poszło nie tak, spróbuj ponownie później");
        }

        return data as LoginData;
    }

    static async register(email: string, name: string, password: string, 
        password_confirmation: string, recaptcha_token: string | null | undefined) {
    
        const response = await fetch(`${this.url}/api/auth/register`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                name,
                password,
                password_confirmation,
                recaptcha_token
            })
        });
 
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422) {
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

        const data = await response.json() as CategoryResponse;
        return data.data;
    }

    static async getThumbnails(params: string) {
        const response = await fetch(`${this.url}/api/post/thumbnails?${params}`, {
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
        const response = await fetch(`${this.url}/api/post/thumbnails/${username}?${params}`, {
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
        const response = await fetch(`${this.url}/api/post/${id}`, {
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

        const data = await response.json();
        return data.data as Post;
    }

    static async addPost(data: AddPostData, token: string) {
        const response = await fetch(`${this.url}/api/posts`, {
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

        const newData = await response.json();
        return newData.data as Post;
    }

    static async updatePost(id: number, data: AddPostData, token: string) {
        const response = await fetch(`${this.url}/api/posts/${id}`, {
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

        const newData = await response.json();
        return newData.data as Post;
    }

    static async setPhotos(id: number, data: FormData, token: string) {
        const response = await fetch(`${this.url}/api/posts/${id}/photos/set`, {
            method: "POST",
            body: data,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return await response.json();
    }

    static async getCities(name: string) {
        const response = await fetch(`${this.url}/api/cities/${name}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        const data = await response.json() as CitiesResponse;
        return data.data;
    }

    static async getCityById(id: number) {
        const response = await fetch(`${this.url}/api/city/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        const data = await response.json();
        return data.data as City;
    }

    static async deletePost(id: number, token: string) {
        const response = await fetch(`${this.url}/api/posts/${id}`, {
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
        const response = await fetch(`${this.url}/api/likes`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "post_id": id
            })
        });

        if (!response.ok) {
            throw new Error("Coś poszło nie tak");
        }

        return;
    }

    static async deleteLike(id: number, token: string) {
        const response = await fetch(`${this.url}/api/likes/${id}`, {
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
        const response = await fetch(`${this.url}/api/posts/liked?${params}`, {
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