import { useRef, useState } from "react";
import ApiService from "../ApiService";
import { useNavigate } from "react-router";
import LoadingButton from "../Modules/LoadingButton";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import ReCAPTCHA from "react-google-recaptcha";

function validatePassword(password: string) {
    if (password.length < 6) {
        return "Hasło musi mieć co najmniej 6 znaków";
    }

    if (!/[a-z]/.test(password)) {
        return "Hasło musi zawierać małą literę (a-z)";
    }

    if (!/[A-Z]/.test(password)) {
        return "Hasło musi zawierać dużą literę (A-Z)";
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
        return "Hasło musi zawierać co najmniej jeden znak specjalny";
    }

    return "";
}

const validationMessages: { [key: string]: string } = {
    "The email has already been taken.": "Ten adres e-mail jest już zajęty.",
    "The name has already been taken.": "Ta nazwa użytkownika jest już zajęta.",
    "The password field must be at least 8 characters.": "Hasło musi mieć co najmniej 8 znaków.",
    "The password confirmation does not match.": "Hasła nie są identyczne.",
};

const translateError = (error: string) => {
    return validationMessages[error] || error;
};

export default function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);

    const [passwordError, setPasswordError] = useState(false);

    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const recaptchaRef = useRef<ReCAPTCHA | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null | undefined>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async () => {
        setErrors({});
        var validatePass = validatePassword(password);
        if (validatePass !== "") {
            setError(validatePass);
            return;
        }

        if (!validateEmail(email)) {
            setError("Wpisz poprawny email");
            return;
        }

        try {
            setError("");
            const data = await ApiService.register(email, username, password, confirmPassword, captchaToken);
            localStorage.setItem("token", data.token);
            navigate("/");
            window.location.reload();
        } catch (err: any) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setError(err instanceof Error ? err.message : 'Wystąpił błąd');
            } 
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            buttonRef.current?.click();
        }
    }

    const handleInputClick = () => {
        setPasswordError(false);
        if (password !== confirmPassword) {
            setPasswordError(true);
        }
    }

    return(
        <div className="login-form">
            <div className="input-wrapper">
                <label>Email</label>
                <input type="text" onChange={(e) => setEmail(e.target.value)}/>
                {errors.email && <p className="error-message">{translateError(errors.email[0])}</p>}
            </div>

            <div className="input-wrapper">
                <label>Nazwa użytkownika</label>
                <input type="text" onChange={(e) => setUsername(e.target.value)}/>
                {errors.name && <p className="error-message">{translateError(errors.name[0])}</p>}
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

            <div className="input-wrapper">
                <label>Powtórz hasło</label>
                <input
                    className={passwordError ? "password-error" : ""}
                    onClick={() => handleInputClick()}
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}/>
            </div>
            <div style={{margin: "20px auto"}}>
                <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_TOKEN}
                    ref={recaptchaRef}
                    onChange={() => setCaptchaToken(recaptchaRef.current?.getValue())} />
            </div>

            <p className="error-message">{error}</p>

            <LoadingButton
                ref={buttonRef}
                className="form-button"
                disabled={email === "" || password === "" || username === ""
                    || password !== confirmPassword || !captchaToken}
                onClick={() => handleRegister()}
                text="Zarejestruj się"/>

            <p style={{margin: "20px auto"}}>Posiadasz już konto?</p>
            <button className="form-button" onClick={() => navigate("/login")}>Zaloguj się</button>
        </div>
    );
}