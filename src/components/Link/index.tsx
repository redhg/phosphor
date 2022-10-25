import React, { FC, useEffect, useState } from "react";

import "./style.scss";

// enum LinkTargetType {
//     Unknown = 0,
//     Screen,
//     Dialog,
// }

interface LinkTarget {
    target: string;
    type: any;
    locked?: boolean;
}

export interface LinkProps {
    text: string;
    target: string | LinkTarget[];
    locked: boolean; // hide the action behind a shift key or long press
    className?: string;

    onClick?: (target: string | LinkTarget[], shiftKey: boolean) => void;
    onRendered?: () => void;
}

const LONGPRESS_DURATION = 500; // 0.5 seconds = one long press

const Link: FC<LinkProps> = (props) => {
    const { text, target, className, onClick, onRendered, locked } = props;
    const css = ["__link__", className ? className : null].join(" ").trim();

    const [timer, setTimer] = useState<number>(null);
    const [isLongPress, setIsLongPress] = useState(false);

    // const [startTime, setStartTime] = useState<number>(null);

    // events
    let ms = 0;
    const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
        // start the timer
        ms = 0;
        setIsLongPress(false);
        window.clearInterval(timer);
        setTimer(null);
        setTimer(window.setInterval(() => {
            ms += 10;
            if (ms === LONGPRESS_DURATION) {
                setIsLongPress(true);
            }
        }, 10));
    };

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        const unlocked = e.shiftKey || isLongPress;
        onClick && onClick(target, unlocked);
        // clear the timer if necessary
        window.clearInterval(timer);
        setTimer(null);
    };
    const handleMouseUp = (e: React.MouseEvent<HTMLSpanElement>) => {
        // clear the timer
        window.clearInterval(timer);
        setTimer(null);
    }
    const handleRendered = () => (onRendered && onRendered());

    // this should fire on mount/update
    useEffect(() => handleRendered());

    return (
        <span className={css} onMouseDown={handleMouseDown} onClick={handleClick} onMouseUp={handleMouseUp}>{text}</span>
    );
};

export default Link;
