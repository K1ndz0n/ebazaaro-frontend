import { BeatLoader } from "react-spinners";
import { useState } from "react";

interface LoadingButtonProps {
    text?: string; 
    onClick?: () => Promise<void> | void; 
    className?: string;
    disabled?: boolean;
    ref?: React.RefObject<HTMLButtonElement | null>; 
}

export default function LoadingButton({ ref, className, text, disabled, onClick }: LoadingButtonProps) {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = async () => {
        setIsClicked(true);

        if (onClick) {
            await onClick(); 
        }

        setIsClicked(false);
    };

    return(
        <button
            ref={ref}
            className={className} 
            disabled={disabled || isClicked} 
            onClick={handleClick}>
            {isClicked ? <BeatLoader color="white" size={8}/> : text}
        </button>
    )
}
