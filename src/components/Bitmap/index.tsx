import React, { SFC, useCallback, useEffect, useState, useRef, RefObject, } from "react";
import "./style.scss";

export interface BitmapProps {
    src: string;
    className?: string;
    alt?: string;
    autocomplete?: boolean;
    onComplete: () => void; // event called on completion
}

const TICK = 150;
const STEPS = [
    0.01,
    0.02,
    0.03,
    0.05,
    0.08,
    0.13,
    0.21,
    0.34,
    0.55,
    0.89,
    1.00,
];

const Bitmap: SFC<BitmapProps> = (props) => {
    let ref: RefObject<HTMLCanvasElement> = useRef();
    let animateTimerId: number = null;
    let currentStep = 0;

    const img = new Image();

    const { autocomplete, src, className, onComplete } = props;
    const css = ["__image__", className ? className : null].join(" ").trim();

    const [loading, setLoading] = useState(!autocomplete);
/*
function loadImage(url) {
  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}
*/
    // animation routines
    const resampleImage = (resolution: number) => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");

        const w = img.width;
        const h = img.height;

        const dw = w * resolution;
        const dh = h * resolution;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, dw, dh);
        ctx.drawImage(canvas, 0, 0, dw, dh, 0, 0, w, h);
    };
    const clearAnimationTimer = () => {
        if (animateTimerId) {
            window.clearInterval(animateTimerId);
            animateTimerId = null;
        }
    };
    const animate = () => {
        clearAnimationTimer();
        animateTimerId = window.setInterval(() => {
            if (currentStep < STEPS.length) {
                resampleImage(STEPS[currentStep]);
                currentStep++;
            } else {
                clearAnimationTimer();
                onComplete && onComplete();
            }
        }, TICK);
    };

    const loadImage = useCallback(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            img.onload = () => {
                // resize the canvas element
                const w = img.width;
                const h = img.height;

                // todo: max dimensions
                // make sure width is no larger than container width
                canvas.width = w;
                canvas.height = h;

                if (!autocomplete) {
                    setLoading(false);
                    animate();
                } else {
                    ctx.drawImage(img, 0, 0);
                    onComplete && onComplete();
                }
            };
            img.src = src;
        }
    }, [src, img]);

    useEffect(() => {
        // setTimeout(() => loadImage(), 5000);
        loadImage();
    }, [loading, setLoading, loadImage]);

    return (
        <div className={css}>
            {loading && <div className="progressbar" />}
            <canvas ref={ref} />
        </div>
    );
};

export default Bitmap;
