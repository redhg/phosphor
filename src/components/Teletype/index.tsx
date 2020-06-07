import React, { Component, ReactElement } from "react";

// css
import "./style.scss";

interface TeletypeProps {
    text: string; // text to animate
    className?: string; // css class
    autostart?: boolean; // start animating immediately? default = true
    autocomplete?: boolean; // skip animating and instead fully render? default = false
    speed?: number; // optional animation speed in ms; default = 5

    onComplete: () => void; // event called on completion
    onNewLine?: () => void; // event called when the cursor is moved to a new line
}

interface TeletypeState {
    index: number;
    char: number;
    active: boolean;
    done: boolean;
    paused: boolean;
}

class Teletype extends Component<TeletypeProps, TeletypeState> {
    private _cursorInterval = 5;
    private _animateTimerId: number = null;
    private _cursorRef: React.RefObject<HTMLElement> = null;
    private _cursorY: number = null;

    constructor(props: TeletypeProps) {
        super(props);

        this._cursorRef = React.createRef<HTMLElement>();
        this._cursorY = 0;

        const done = !!props.autocomplete;
        const paused = props.autostart === false;

        this._cursorInterval = props.speed || this._cursorInterval;

        this.state = {
            index: 0,
            char: 0,
            active: false,
            done,
            paused,
        };

        this._animate = this._animate.bind(this);
        this._updateState = this._updateState.bind(this);
    }

    public render(): ReactElement {
        const { text, className } = this.props;
        const { char, done, active, } = this.state;

        const visible = text.substr(0, char); // already rendered
        const cursor = text.substr(char, 1) || " "; // " " ensures the curosr is briefly visible for line breaks
        const hidden = text.substr(char + 1); // to be rendered

        if (!active || done) {
            return null;
        }

        const css = ["__teletype__", className ? className : null].join(" ").trim();

        return (
            <div className={css}>
                <span className="visible">{visible}</span>
                <span className="cursor" ref={this._cursorRef}>{cursor}</span>
                <span className="hidden">{hidden}</span>
            </div>
        );
    }

    public componentDidMount(): void {
        const { paused, done } = this.state;

        // if autocomplete is on, we can skip to the end
        if (done) {
            this._onComplete();
            return;
        }

        // ready to go
        if (!paused) {
            this.setState({
                active: true,
            }, () => this._animate());
        }
    }

    public componentDidUpdate(prevProps: TeletypeProps, prevState: TeletypeState): void {
        if (!prevState.done && this.state.done) {
            this._onComplete();
        }


        if (this.state.done) {
            return;
        }

        this._animate();
    }

    public componentWillUnmount(): void {
        if (this._animateTimerId !== null) {
            clearTimeout(this._animateTimerId);
            this._animateTimerId = null;
        }
    }

    private _animate(): void {
        this._clearAnimateTimer();

        if (this.state.paused) {
            return;
        }

        // track the current active line
        this._getCursorPosition();

        // setTimeout is preferred over requestAnimationFrame so the interval
        // can be specified -- we can control how janky it looked; requestAnimationFrame
        // results in animation that's much to smooth for our purposes.
        this._animateTimerId = window.setTimeout(this._updateState, this._cursorInterval);
    }

    private _getCursorPosition(): void {
        const { onNewLine } = this.props;
        // get the cursorRef
        const ref = this._cursorRef;
        let y = this._cursorY;

        if (ref && ref.current) {
            const node = ref.current;
            const top = node.offsetTop;
            if (y !== top) {
                // new line
                this._cursorY = top;
                onNewLine && onNewLine();
            }
        }
    }

    private _clearAnimateTimer(): void {
        if (this._animateTimerId !== null) {
            window.clearTimeout(this._animateTimerId);
            this._animateTimerId = null;
        }
    }

    private _updateState(): void {
        const { text, } = this.props;
        const {
            char,
            active,
            done,
            paused,
        } = this.state;

        if (done) {
            return;
        }

        // let nextIndex = index;
        let nextChar = char;
        let nextActive = active;
        let nextDone = done;
        let nextPaused = paused;

        // if we're not active, we are now!
        if (!nextActive) {
            nextActive = true;
        }

        // if char is less that the current string, increment it
        if (char < text.length) {
            nextChar = char + 1;
        } else {
            nextActive = false;
            nextDone = true;
        }

        // update state
        this.setState({
            // index: nextIndex,
            char: nextChar,
            active: nextActive,
            done: nextDone,
            paused: nextPaused,
        });
    }

    private _onComplete(): void {
        const { onComplete, } = this.props;
        onComplete && onComplete();
    }
}

export default Teletype;
