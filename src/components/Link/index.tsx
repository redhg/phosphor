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

const LONGPRESS_DURATION = 1000; // 0.5 seconds = one long press

const Link: FC<LinkProps> = (props) => {
    const { text, target, className, onClick, onRendered, locked } = props;
    const css = ["__link__", className ? className : null].join(" ").trim();

    // const [timer, setTimer] = useState<number>(null);
    // const [isLongPress, setIsLongPress] = useState(false);

    // const [startTime, setStartTime] = useState<number>(0);

    // events
    // let ms = 0;
    // const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    //     setStartTime(Date.now());
    // };

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        console.log("click");
        onClick && onClick(target, e.shiftKey);
    };
    const handleRendered = () => (onRendered && onRendered());

    // this should fire on mount/update
    useEffect(() => handleRendered());

    const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
        e.preventDefault(); // prevents the click event firing
        console.log("handleTouchEnd");
        onClick && onClick(target, e.touches.length > 1);
    };

    return (
        <span
            className={css}
            onClick={handleClick}
            onTouchEnd={handleTouchEnd}
        >
            {text}
        </span>
    );
};

export default Link;
