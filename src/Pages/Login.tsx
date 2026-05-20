import { useRef, useState } from "react";
import ApiService from "../ApiService";
import { useNavigate } from "react-router";
import LoadingButton from "../Modules/LoadingButton";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async () => {
        if (!validateEmail(email)) {
            setError("Wpisz poprawny email");
            return;
        }

        try {
            setError("");
            const data = await ApiService.login(email, password);
            localStorage.setItem("token", data.token);
            navigate("/");
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd');
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            buttonRef.current?.click();
        }
    }

    return(
        <div className="login-form">
            <div className="input-wrapper">
                <label>Email</label>
                <input type="text" onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="input-wrapper">
                <label>Hasło</label>
                <input
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}/>
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <MdOutlineVisibilityOff size={22} /> : <MdOutlineRemoveRedEye size={22} />}
                </span>
            </div>

            <p className="error-message">{error}</p>

            <LoadingButton
                ref={buttonRef}
                className="form-button"
                disabled={email === "" || password === ""}
                onClick={() => handleLogin()}
                text="Zaloguj"/>

            <p style={{margin: "20px auto"}}>Nie posiadasz konta?</p>
            <button className="form-button" onClick={() => navigate("/register")}>Zarejestruj się</button>
        </div>
    );
}