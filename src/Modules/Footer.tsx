import { FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="footer">
            <p>© 2026 eBazaaro</p>

                <a 
                    href="https://github.com/K1ndz0n"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaGithub color="white" size={25} />
                </a>
        </footer>
    );
}