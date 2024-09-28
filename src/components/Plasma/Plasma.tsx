import React, { FC, ReactElement, useEffect, useState, CSSProperties, } from "react";
import { createNoise2D, NoiseFunction2D, } from "simplex-noise";

import { ScreenDimensions, getUnsetScreenDimenions, NOISE_MAP, } from ".";

type Props = {

};

const NOISE = createNoise2D();

export const Plasma: FC<Props> = (props: Props): ReactElement => {
    const [dimensions, setDimensions] = useState<ScreenDimensions>(getUnsetScreenDimenions());
    // const [noise, setNoise] = useState<NoiseFunction2D>(createNoise2D());
    const [plasma, setPlasma] = useState<ReactElement[]>(null);

    const calculateDimensions = () => {
        const { width, height, charWidth, charHeight, } = dimensions;

        // only continue if a dimension has changed
        if (window.innerWidth === width && window.innerHeight === height) {
            return;
        }

        // do some calculations
        const columns = Math.floor(window.innerWidth / charWidth);
        const rows = Math.floor(window.innerHeight / charHeight);

        const effectiveWidth = columns * charWidth;
        const effectiveHeight = rows * charHeight;

        const size: ScreenDimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
            charWidth,
            charHeight,
            columns,
            rows,
            effectiveWidth,
            effectiveHeight,
        };

        setDimensions(size);
    };

    const animatePlasma = () => {};

    useEffect(() => {
        calculateDimensions();
        if (!plasma) {
            setPlasma(renderPlasma(rows, columns));
        }

        window.addEventListener("resize", calculateDimensions);
        return () => {
            window.removeEventListener("resize", calculateDimensions);
        }
    }, [plasma]);

    // apply the width & height to the style object
    const { width, height, effectiveWidth, effectiveHeight, rows, columns, } = dimensions;
    const top = height && effectiveHeight ? Math.floor((height - effectiveHeight) * 0.5) : 0;
    const left = width && effectiveWidth ? Math.floor((width - effectiveWidth) * 0.5) : 0;
    const style = {
        width: effectiveWidth,
        height: effectiveHeight,
        background: "rgba(255, 0, 255, 0.25)",
        top,
        left,
        position: "absolute",
        overlfow: "hidden",
    } as CSSProperties;




    return (
        <div className="__plasma__" style={style}>
            {plasma}
        </div>
    );
};

const renderPlasma = (rows: number, columns: number): ReactElement[] => {
    if (!rows || !columns) {
        return;
    }

    let elements: ReactElement[] = [];

    for (let y = 0; y < rows; y++) {
        const key = `row${y}`;
        let text = "";

        for (let x = 0; x < columns; x++) {
            // get the noise value
            const n = (NOISE(x / 16, y / 16) + 1) / 2; // range is  -1 to +1, so this will normalize it
            text += mapNoiseToCharacter(n);
        }

        const row = <div className="__plasmarow__" key={key}>{text}</div>
        elements.push(row)
    }

    return elements;
};

const mapNoiseToCharacter = (n: number): string => {
    const noise = Math.floor(n * NOISE_MAP.length);
    return NOISE_MAP[noise];
}
