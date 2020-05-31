import React, { Component, ReactElement } from "react";

// components
import Link from "../Link";

// import sample data for development purposes
import json from "../../data/sample.json";

interface AppState {
    screens: Screen[];
    activeScreen: string;
}

enum ScreenType {
    Unknown = 0,
    Screen,
}

enum ScreenDataType {
    Unknown = 0,
    Text,
    Link,
}

interface ScreenData {
    id: string;
    type: ScreenDataType;
    [key: string]: any; // arbitrary members
}

interface Screen {
    id: string;
    type: ScreenType;
    content: any[];
    rendered?: boolean; // if true, element has already been rendered to the screen
}

class Phosphor extends Component<any, AppState> {
    constructor(props: any) {
        super(props);

        this.state = {
            screens: [],
            activeScreen: null,
        };

        this.linkClick = this.linkClick.bind(this);
    }

    public render(): ReactElement {
        const {
            screens
        } = this.state;

        return (
            <div className="phosphor">
                <section style={{ whiteSpace: "pre" }}>{screens && this._renderScreen()}</section>
            </div>
        );
    }

    public componentDidMount(): void {
        this._parseScreens();
    }

    private _parseScreens(): void {
        const screens = json.screens.map((element) => {
            return this._buildScreen(element);
        });

        if (!screens.length) {
            return;
        }

        // todo: support config option to set starting screen
        const activeScreen = screens[0].id;

        this.setState({
            screens,
            activeScreen,
        });
    }

    private _buildScreen(src: any): Screen {
        // try to parse & build the screen
        const id = src.id || null;
        const type = this._getScreenType(src.type);
        const content = this._parseScreenContent(src.content).flat(); // flatten to one dimension

        // if this screen is invalid for any reason, skip it
        if (!id || !type || !content.length) {
            return;
        }

        return {
            id,
            type,
            content,
        };
    }

    private _getScreenType(type: string): ScreenType {
        switch (type.toLowerCase()) {
            case "screen":
                return ScreenType.Screen;

            default:
                return ScreenType.Unknown;
        }
    }

    private _renderScreen(): ReactElement[] {
        // get the active screen
        const screen = this._getScreen(this.state.activeScreen);
        if (!screen) {
            return;
        }

        const content = screen.content;
        return content.map((element, index) => this._renderStatic(element, index));
    }

    private _getScreen(id: string): Screen {
        return this.state.screens.find(element => element.id === id);
    }

    private _parseScreenContent(content: any[]): any[] {
        return content.map(element => this._parseScreenContentElement(element));
    }

    private _getScreenData(element: any): ScreenData {
        // TODO: build the data object based on the element type
        // e.g. typeof element === "string" --> create a new ScreenData Text object
        const id = `id${Math.random()}`; // generate id
        const type = ScreenDataType.Unknown;
        return {
            id,
            type,
            element,
        };
    }

    private _parseScreenContentElement(element: any): any {
        // split strings in multiples based on the new line character
        if (typeof element === "string") {
            return element.split("\n");
        }
        return element;
    }

    private _renderElement(element: any, key: number): ReactElement {
        // text
        if (typeof element === "string") {
            return <div key={key}>{element.length ? element : "\0"}</div>;
        }

        // link
        return (
            <Link
                key={key}
                text={element.text}
                target={element.target}
                onClick={this.linkClick}
            />
        );
    }

    private _renderStatic(element: any, key: number): ReactElement {
         // text
         if (typeof element === "string") {
            return <div key={key}>{element.length ? element : "\0"}</div>;
        }

        // link
        return (
            <Link
                key={key}
                text={element.text}
                target={element.target}
                onClick={this.linkClick}
            />
        );
    }

    private linkClick(target: string): void {
        const activeScreen = target;
        this.setState({
            activeScreen,
        });
    }
}

export default Phosphor;
