import React, { SFC, useCallback, useEffect, useState } from "react";

import "./style.scss";

export interface ToggleState {
    text: string;
    active?: boolean;
}

export interface ToggleProps {
    states: ToggleState[];
    className?: string;
    onRendered?: () => void;
    onClick?: () => void;
}

const Toggle: SFC<ToggleProps> = (props) => {
    const { className, states, onRendered } = props;
    const css = [
        "__toggle__",
        className ? className : null,
    ].join(" ").trim();

    // find the active state
    const state = states.find(element => element.active === true);
    const text = (state && state.text) || "";

    // set the new active one
    const [active, setActive] = useState(state);

    // events
    const handleRendered = () => (onRendered && onRendered());
    const handleClick = useCallback(() => {
        if (active) {
            // get the active index;
            const index = states.findIndex(element => element === active);
            // unset everything
            states.forEach(element => element.active = false);
            // set the next active element
            const next = states[index + 1 === states.length ? 0 : index + 1];
            next.active = true;
            setActive(next);
        }
    }, [states, active, setActive]);

    // this should fire on mount/update
    useEffect(() => handleRendered());

    return <div className={css} onClick={handleClick}>{text}</div>;
};

export default Toggle;
