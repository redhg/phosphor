import React, { Component, ReactElement } from "react";

// modules
import { nanoid } from "nanoid";

// components
import Link from "../Link";
import Text from "../Text";
import Image from "../Image";

// import sample data for development purposes
import json from "../../data/sample.json";
import Teletype from "../Teletype";

interface AppState {
    screens: Screen[];
    activeScreen: string;
    loadingQueue: any[];
    status: AppStatus;
}

enum ScreenType {
    Unknown = 0,
    Screen,
}

enum ScreenDataType {
    Unknown = 0,
    Text,
    Link,
    Image,
}

enum ScreenDataState {
    Unloaded = 0,
    Ready,
    Active,
    Done,
}

interface ScreenData {
    id: string;
    type: ScreenDataType;
    state: ScreenDataState;

    [key: string]: any; // arbitrary members
}

interface Screen {
    id: string;
    type: ScreenType;
    content: ScreenData[];
}

enum AppStatus {
    Unset = 0,
    Ready,
    Active,
    Done,
}

class Phosphor extends Component<any, AppState> {
    constructor(props: any) {
        super(props);

        this.state = {
            screens: [],
            activeScreen: null,
            loadingQueue: [],
            status: AppStatus.Unset,
        };

        this._changeScreen = this._changeScreen.bind(this);
        this._setElementState = this._setElementState.bind(this);
    }

    public render(): ReactElement {
        const {
            screens
        } = this.state;

        return (
            <div className="phosphor">
                <section style={{ whiteSpace: "pre" }}>
                    {screens && this._renderScreen()}
                </section>
            </div>
        );
    }

    public componentDidMount(): void {
        console.log("component did mount");

        // parse the data & prep the screens
        this._parseScreens();
    }

    public componentDidUpdate(prevProps: any, prevState: AppState): void {
        console.log("this.componentDidUpdate");
    }

    private _parseScreens(): void {
        const screens = json.screens.map((element) => {
            return this._buildScreen(element);
        });

        if (!screens.length) {
            return;
        }

        // todo: support config option to set starting screen
        const activeScreen = 0;
        this.setState({
            screens,
        }, () => this._setActiveScreen(activeScreen));
    }

    private _setActiveScreen(index: number): void {
        const { screens, } = this.state;
        const activeScreen = screens[index].id
        this.setState({
            activeScreen,
        }, () => this._activateScreen());
    }

    // we're off to the races!
    private _activateScreen(): void {
        console.log("this._activateScreen");
        const screen = this._getScreen(this.state.activeScreen);
        screen.content[0].state = ScreenDataState.Active;

        // update the app status
        const status = AppStatus.Active;
        this.setState({
            status,
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

        // loop through the screen contents & render each element
        return screen.content.map((element, index) => {
            // wrap a div around the element based on its state

            // if it's ready, do nothing
            if (element.state === ScreenDataState.Ready) {
                return null;
            }

            // if it's active, render it animated
            if (element.state === ScreenDataState.Active) {
                return (
                    <div className="rendered" key={index}>
                        {this._renderActiveElement(element, index)}
                    </div>
                );
            }

            // if it's done, render it static
            if (element.state === ScreenDataState.Done) {
                return (
                    <div className="rendered" key={index}>
                        {this._renderStaticElement(element, index)}
                    </div>
                );
            }

            // unknown
            return null;
        });
    }

    private _getScreen(id: string): Screen {
        return this.state.screens.find(element => element.id === id);
    }

    private _parseScreenContent(content: any[]): ScreenData[] {
        const parsed = content.map(element => this._parseScreenContentElement(element)).flat();
        return parsed.map(element => this._generateScreenData(element));
    }

    private _generateScreenData(element: any): ScreenData {
        // TODO: build the data object based on the element type
        // e.g. typeof element === "string" --> create a new ScreenData Text object
        const id = nanoid();

        // if an element has "load" property, its requires more work
        // to prepare so it's can't yet be considered "ready".
        const onLoad = element.onLoad || null;
        // if an element requires more loading, we'll shove its id in the queue
        if (onLoad) {
            const loadingQueue = [...this.state.loadingQueue];
            loadingQueue.push(element.id);
            this.setState({
                loadingQueue
            });
        }
        const state = onLoad ? ScreenDataState.Unloaded : ScreenDataState.Ready;

        // text-only elements can be added as strings in the JSON data; they don't need any object wrappers
        if (typeof element === "string") {
            return {
                id,
                type: ScreenDataType.Text,
                text: element,
                state,
                onLoad,
            }
        }

        // everything else requires a wrapper containing a "type" attribute, so we'll need to parse those here
        if (!element.type) {
            return;
        }

        switch (element.type.toLowerCase()) {
            case "link":
                return {
                    id,
                    type: ScreenDataType.Link,
                    target: element.target,
                    text: element.text,
                    state,
                    onLoad,
                };

            case "image":
                return {
                    id,
                    type: ScreenDataType.Image,
                    src: element.src,
                    alt: element.alt,
                    state,
                    onLoad,
                };

            default:
                return;
        }
    }

    private _parseScreenContentElement(element: any): any {
        // if the element is a string, we'll want to
        // split it into chunks based on the new line character
        if (typeof element === "string") {
            return element.split("\n");
        }

        // otherwise, just return the element
        return element;
    }

    // based on the current active ScreenData, render the corresponding active element
    private _renderActiveElement(element: any, key: number): ReactElement {
        const activeData = this._getActiveScreenData();
        console.log(element);
        // if the element is text-based, like text or Link, render instead a
        // teletype component
        if (element.type === ScreenDataType.Text || element.type === ScreenDataType.Link) {
            const handleRendered = () => this._activateNextScreenData();
            return (
                <Teletype
                    key={key}
                    text={element.text}
                    onRendered={handleRendered}
                />
            );
        }
        return null;
    }

    // renders the final, interactive element to the screen
    private _renderStaticElement(element: any, key: number): ReactElement {
        const className = element.className || "";
        const handleRendered = () => {
            this._setElementState(element.id, ScreenDataState.Done);
        };

        if (element.type === ScreenDataType.Text) {
            // \0 is the ASCII null character to ensure empty lines aren't collapsed
            // https://en.wikipedia.org/wiki/Null_character
            const text = element.text.length ? element.text : "\0";
            return (
                <Text
                    key={key}
                    className={className}
                    text={text}
                    onRendered={handleRendered}
                />
            );
        }

        // link
        if (element.type === ScreenDataType.Link) {
            return (
                <Link
                    key={key}
                    text={element.text}
                    target={element.target}
                    className={className}
                    onClick={this._changeScreen}
                    onRendered={handleRendered}
                />
            );
        }

        // image
        if (element.type === ScreenDataType.Image) {
            return (
                <Image
                    key={key}
                    className={className}
                    src={element.src}
                    alt={element.alt}
                />
            );
        }

        return null;
    }

    private _changeScreen(activeScreen: string): void {
        // unload the current screen first
        this._unloadScreen();

        this.setState({
            activeScreen,
        });
    }

    private _setElementState(id: string, state: ScreenDataState): void {
        const screen = this._getScreen(this.state.activeScreen);
        const content = screen.content.find(element => element.id === id);

        // only change the state if we need to
        if (content && (content.state !== state)) {
            console.log("changing state", ScreenDataState[state]);
            content.state = state;
        }
;   }

    private _unloadScreen(): void {
        // go through the current screen elements, setting
        // their states to ScreenDataState.Ready
        const screen = this._getScreen(this.state.activeScreen);
        screen.content.forEach(element => {
            element.state = ScreenDataState.Unloaded;
        });
    }

    private _getScreenDataById(id: string): any {
        const screen = this._getScreen(this.state.activeScreen);
        return screen.content.find(element => element.id === id);
    }

    // find the currently active element and, fi possible,
    private _activateNextScreenData(): void {
        console.log("_activateNextScreenData");
        const screen = this._getScreen(this.state.activeScreen);
        const activeIndex = screen.content.findIndex(element => element.state === ScreenDataState.Active);

        // nothing is active
        if (activeIndex === -1) {
            return;
        }

        // we're done with this element now
        screen.content[activeIndex].state = ScreenDataState.Done;

        // we're at the end of the array so there is no next
        if (activeIndex === screen.content.length - 1) {
            // todo: indicate everything's done
            return;
        }

        // otherwise, activate the next one
        screen.content[activeIndex + 1].state = ScreenDataState.Active;
    }

    private _getActiveScreenData(): ScreenData {
        const screen = this._getScreen(this.state.activeScreen);
        const activeIndex = screen.content.findIndex(element => element.state === ScreenDataState.Active);

        // is something active?
        if (activeIndex > -1) {
            return screen.content[activeIndex];
        }

        // otherwise set & return the first element
        const firstData = screen.content[0];

        // unless that element is already done or not yet loaded
        if (firstData.state === ScreenDataState.Done || firstData.state === ScreenDataState.Unloaded) {
            return null;
        }


        firstData.state = ScreenDataState.Active;
        return firstData;
    }

    private _setActiveScreenDataByIndex(index: number): void {
        const screen = this._getScreen(this.state.activeScreen);
        screen.content[index].state = ScreenDataState.Active;
    }
}

export default Phosphor;
