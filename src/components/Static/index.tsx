import React, { FC, useCallback, useEffect, useRef, } from "react";
import "./style.scss";

export interface StaticProps {
    lifespan?: number; // how long shoudl the static last, in ms; default 1000
    className?: string;
    onRendered?: () => void;
    onClose?: () => void;
}

const TICK = 1000;
const LIFESPAN_DEFAULT = 1000;

const Static: FC<StaticProps> = (props) => {
    let ref: React.RefObject<HTMLCanvasElement> = useRef();
    let time = 0;
    let animateTimerId: number = null;
    let lifespanTimerId: number = null;

    const { className, onRendered, onClose, } = props;
    const css = [
        "__static__",
        className ? className : null,
    ].join(" ").trim();

    // add a keyhandler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        e.preventDefault();

        const key = e.key.toLowerCase();

        switch (key) {
            case "enter":
            case "escape":
                onClose && onClose();
                break;

            default:
                break;
        }
    }, [onClose]);

    // animation routines
    const clearAnimationTimer = () => {
        if (animateTimerId) {
            window.clearInterval(animateTimerId);
            animateTimerId = null;
        }
    };
    const animate = () => {
        clearAnimationTimer();
        noise();
        animateTimerId = window.setInterval(noise, TICK);
    };

    const noise = () => {
        if (!ref) {
            return;
        }

        const canvas = ref.current;
        const context = canvas.getContext("2d");

        const img = context.createImageData(canvas.width, canvas.height);
        const pix = img.data;

        for (let i = 0, n = pix.length; i < n; i += 4) {
            pix[i] = pix[i + 1] = pix[i + 2] =  Math.random() * 200;
            pix[i + 3] = 255; // 100% opaque
        }

        context.putImageData(img, 0, 0);
        time = (time + 1) % canvas.height;
    };

    // mount & unmount
    useEffect(() => {
        // mount
        document.addEventListener("keydown", handleKeyDown);
        animate();

        // unmount
        return () => {
            clearAnimationTimer();
            document.removeEventListener("keydown", handleKeyDown);
        };
    });

    return (
        <section className={css}>
            <canvas width="320" height="240" ref={ref} />
        </section>
    );
};

export default Static;