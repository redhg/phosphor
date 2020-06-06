import React, { SFC, useEffect, useRef, RefObject } from "react";

export interface PromptProps {
    prompt?: string;
    className?: string;
    commands?: any[];
    onCommand?: (command: string, action: string) => void;
    onRendered?: () => void;
    onEscape?: () => void;
}

export const PROMPT_DEFAULT = "$> ";

const Prompt: SFC<PromptProps> = (props) => {
    const { prompt, className, commands, onCommand, onRendered, onEscape } = props;
    const css = ["__prompt__", className ? className : null].join(" ").trim();
    const ref: RefObject<HTMLSpanElement> = useRef();

    // events
    const handleFocus = () => ref.current.focus();

    const handleKeypress = (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (e.key.toLowerCase() === "enter") {
            e.preventDefault();

            if (!onCommand) {
                return;
            }

            const value = ref.current.innerText.toLowerCase();
            const command = commands.find(element => element.command === value);
            if (command) {
                onCommand(value, command.action);
            }

            // clear the prompt regardless
            ref.current.innerHTML = "";
        }
    };

    const handleEscape = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === "escape") {
            onEscape && onEscape();
        }
    };

    useEffect(() => {
        handleFocus();
        onRendered && onRendered();
    });

    const style = {
        // caretColor: "transparent",
        border: 0,
        outline: 0,
    };

    return (
        <div className={css} onClick={handleFocus}>
            {prompt && <span className={"prompt"}>{prompt}</span>}
            <span
                contentEditable={true}
                className={"input"}
                tabIndex={-1}
                style={style}
                ref={ref}
                onKeyPress={handleKeypress}
                onKeyUp={handleEscape}
            ></span>
        </div>
    );
};

export default Prompt;
