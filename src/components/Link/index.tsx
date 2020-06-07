import React, { SFC, useEffect } from "react";

import "./style.scss";

export interface LinkProps {
    text: string;
    target: string;
    className?: string;
    onClick?: (target: string) => void;
    onRendered?: () => void;
}

const Link: SFC<LinkProps> = (props) => {
    const { text, target, className, onClick, onRendered } = props;
    const css = ["__link__", className ? className : null].join(" ").trim();

    // events
    const handleClick = () => (onClick && onClick(target));
    const handleRendered = () => (onRendered && onRendered());

    // this should fire on mount/update
    useEffect(() => handleRendered());

    return (
        <span className={css} onClick={handleClick}>{text}</span>
    );
};

export default Link;
