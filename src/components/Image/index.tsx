import React, { SFC } from "react";

export interface ImageProps {
    src: string;
    className?: string;
    alt?: string;
    animate?: boolean;
}

const Image: SFC<ImageProps> = (props) => {
    const { src, className, alt } = props;
    const css = ["__image__", className ? className : null].join(" ").trim();

    return (
        <img className={css} src={src} alt={alt} />
    );
};

export default Image;
