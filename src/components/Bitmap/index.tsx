import React, { Component, RefObject, ReactElement, } from "react";
import "./style.scss";

export interface BitmapProps {
    src: string;
    className?: string;
    alt?: string;
    autocomplete?: boolean;
    onComplete: () => void; // event called on completion
}

interface BitmapState {
    loading: boolean;
    image: HTMLImageElement;
}

const TICK = 150;
// ersatz Fibonacci sequence
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

class Bitmap extends Component<BitmapProps, BitmapState> {
    private _canvasRef: RefObject<HTMLCanvasElement> = null;
    private _animateTimerId: number = null;
    private _currentStep = 0;

    constructor(props: BitmapProps) {
        super(props);

        this._canvasRef = React.createRef<HTMLCanvasElement>();
        const loading = !this.props.autocomplete;

        this.state = {
            loading,
            image: new Image(),
        };
    }

    public render(): ReactElement {
        const { className } = this.props;
        const { loading } = this.state;
        const css = ["__image__", className ? className : null].join(" ").trim();

        return (
            <div className={css}>
                {loading && <div className="progressbar" />}
                <canvas ref={this._canvasRef} />
            </div>
        );
    }

    public componentDidMount(): void {
        this._loadImage();
    }

    private _resampleImage(resolution: number): void {
        const { image, } = this.state;
        const canvas = this._canvasRef.current;
        const ctx = canvas.getContext("2d");

        const w = image.width;
        const h = image.height;

        const dw = w * resolution;
        const dh = h * resolution;

        // trun off smoothing to ensure it's pixelated
        ctx.imageSmoothingEnabled = false;
        // shrink the image
        ctx.drawImage(image, 0, 0, dw, dh);
        // then draw the above bitmap at then expected image size without resampling
        ctx.drawImage(canvas, 0, 0, dw, dh, 0, 0, w, h);
    }

    private _clearAnimationTimer = () => {
        if (this._animateTimerId) {
            window.clearInterval(this._animateTimerId);
            this._animateTimerId = null;
        }
    };

    private _animate(): void {
        const { onComplete, } = this.props;

        this._clearAnimationTimer();
        this._animateTimerId = window.setInterval(() => {
            if (this._currentStep < STEPS.length) {
                this._resampleImage(STEPS[this._currentStep]);
                this._currentStep++;
            } else {
                this._clearAnimationTimer();
                onComplete && onComplete();
            }
        }, TICK);
    }

    private _loadImage(): void {
        const { autocomplete, onComplete, src, } = this.props;
        const { image } = this.state;
        const canvas = this._canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && image) {
            image.onload = () => {
                // resize the canvas element
                const w = image.width;
                const h = image.height;

                // todo: max dimensions
                // make sure width is no larger than container width
                canvas.width = w;
                canvas.height = h;

                if (!autocomplete) {
                    this.setState({
                        loading: false,
                    }, () => this._animate());
                } else {
                    ctx.drawImage(image, 0, 0);
                    onComplete && onComplete();
                }
            };
            image.src = src;
        }
    }
}

export default Bitmap;
