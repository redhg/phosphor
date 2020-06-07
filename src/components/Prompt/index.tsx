import React, { SFC, useEffect, useRef, RefObject, useState, } from "react";

// css
import "./style.scss";

export interface PromptProps {
    prompt?: string;
    commands?: any[];
    className?: string;
    disabled?: boolean;

    onCommand?: (command: string, action: string) => void;
    onEscape?: () => void;
    onRendered?: () => void;
}

export const PROMPT_DEFAULT = "$> ";

const Prompt: SFC<PromptProps> = (props) => {
    const { disabled, prompt, className, commands, onCommand, onRendered, } = props;
    const ref: RefObject<HTMLSpanElement> = useRef();
    const css = [
        "__prompt__",
        disabled ? "disabled" : null,
        className ? className : null,
    ].join(" ").trim();

    const [value, setValue] = useState("");

    // events
    const handleFocus = () => ref.current.focus();

    const handleCommand = () => {
        if (!onCommand) {
            return;
        }

        const command = commands.find(element => element.command === value);
        setValue("");

        if (command) {
            onCommand(value, command.action);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (disabled) {
            setValue("");
            return;
        }

        e.preventDefault();

        const key = e.key.toLowerCase();
        switch (key) {
            case "backspace":
                value.length && setValue(value.slice(0, -1));
                break;

            case "enter":
                handleCommand();
                break;

            default:
                // support alphanumeric, space, and limited puntuation only
                const re = /[a-z0-9,.<>/?[\]{}'";:*&^%$#@!~]/
                if (key.length === 1 && key.match(re)) {
                    setValue(value + key);
                }
                break;
        }
    };

    // render effects
    useEffect(() => {
        // mount
        onRendered && onRendered();
        document.addEventListener("keydown", handleKeyDown);

        // unmount
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <div className={css} onClick={handleFocus}>
            {prompt && <span className={"prompt"}>{prompt}</span>}
            <span className={"input"} ref={ref}>{value}</span>
        </div>
    );
};

export default Prompt;
