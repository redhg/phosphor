import React, { SFC } from "react";

export interface ILinkProps {
    text: string;
    target: string;
    className?: string;
    onClick?: (target: string) => void;
}

const Link: SFC<ILinkProps> = (props) => {
    const { text, target, className, onClick } = props;
    const handleClick = () => { onClick && onClick(target) };

    return (
        <span className={className} onClick={handleClick}>{text}</span>
    );
};

export default Link;
