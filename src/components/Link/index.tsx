import React, { SFC, useEffect } from "react";

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
    className?: string;
    onClick?: (target: string | LinkTarget[], shiftKey: boolean) => void;
    onRendered?: () => void;
}

const Link: SFC<LinkProps> = (props) => {
    const { text, target, className, onClick, onRendered } = props;
    const css = ["__link__", className ? className : null].join(" ").trim();

    // events
    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => (onClick && onClick(target, e.shiftKey));
    const handleRendered = () => (onRendered && onRendered());

    // this should fire on mount/update
    useEffect(() => handleRendered());

    return (
        <span className={css} onClick={handleClick}>{text}</span>
    );
};

export default Link;
