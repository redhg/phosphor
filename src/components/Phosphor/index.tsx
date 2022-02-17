import React, { Component, ReactElement } from "react";

// css
import "./style.scss";

// modules
import { nanoid } from "nanoid";

// components
import Teletype from "../Teletype";
import Link from "../Link";
import Text from "../Text";
import Bitmap from "../Bitmap";
import Prompt, { PROMPT_DEFAULT } from "../Prompt";
import Toggle from "../Toggle";

import Modal from "../Modal";
import Scanlines from "../Scanlines";

// for different content, edit sample.json, or,
// preferrably, create a new JSON and load it here
import json from "../../data/ypsilon14.json";

interface AppState {
    screens: Screen[];
    dialogs: any[];
    activeScreenId: string;
    activeElementId: string; // which element, if any, is active
    activeDialogId: string; // which element, if any, is active
    loadingQueue: any[];
    status: AppStatus;

    renderScanlines: boolean; // should scanlines be enabled?
}

enum DialogType {
    Unknown = 0,
    Alert, // simple message box
    Confirm, // yes/no box; currently unsupported
    Dialog, // has arbitrary content; currently unsupported
}

interface Dialog {
    id: string;
    type: DialogType;

    [key: string]: any; // arbitrary members
}

enum ScreenType {
    Unknown = 0,
    Screen,
    Static,
}

enum ScreenDataType {
    Unknown = 0,
    Text,
    Link,
    Bitmap,
    Prompt,
    Toggle,
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
    private _containerRef: React.RefObject<HTMLElement>;
    private _lineheight: number = null;
    private _colwidth: number = null;

    constructor(props: any) {
        super(props);

        this._containerRef = React.createRef<HTMLElement>();

        this.state = {
            screens: [],
            dialogs: [],
            activeScreenId: null,
            activeElementId: null,
            activeDialogId: null,
            loadingQueue: [],
            status: AppStatus.Unset,
            renderScanlines: true, // TODO: support option to disable this effect
        };

        this._changeScreen = this._changeScreen.bind(this);
        this._setElementState = this._setElementState.bind(this);
        this._handlePromptCommand = this._handlePromptCommand.bind(this);
        this._handleTeletypeNewLine = this._handleTeletypeNewLine.bind(this);
        this._handleLinkClick = this._handleLinkClick.bind(this);
    }

    public render(): ReactElement {
        const {
            activeScreenId,
            activeDialogId,
            renderScanlines,
        } = this.state;

        return (
            <div className="phosphor">
                <section className={"__main__"} ref={this._containerRef}>
                    {activeScreenId && this._renderScreen()}
                </section>

                {activeDialogId && this._renderDialog()}

                {/* scanlines should be the last child */}
                {renderScanlines && <Scanlines />}
            </div>

        );
    }

    // public react events
    public componentDidMount(): void {
        // parse the data & prep the screens
        this._parseScreens();
        this._parseDialogs();
    }

    // private methods
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

    private _parseDialogs(): void {
        const dialogs = json.dialogs.map((element) => {
            return this._buildDialog(element);
        });

        if (!dialogs.length) {
            return;
        }

        this.setState({
            dialogs,
        });
    }

    private _buildDialog(src: any): Dialog {
        const id = src.id || null;
        const type = this._getDialogType(src.type);

        // TODO: support other dialog types
        let content: any [] = null;
        if (type === DialogType.Alert) {
            content = src.content;
        }

        return {
            id,
            type,
            content,
        };
    }

    private _getDialogType(type: string): DialogType {
        switch (type.toLowerCase()) {
            case "alert":
                return DialogType.Alert;

            case "confirm":
                return DialogType.Confirm;

            case "dialog":
                return DialogType.Dialog;

            default:
                return DialogType.Unknown;
        }
    }

    private _setActiveScreen(index: number): void {
        const { screens, } = this.state;
        const activeScreen = screens[index].id
        this.setState({
            activeScreenId: activeScreen,
        }, () => this._activateScreen());
    }

    // we're off to the races!
    private _activateScreen(): void {
        const screen = this._getScreen(this.state.activeScreenId);

        // update the app status
        const status = AppStatus.Active;

        // depending on the screen type, we perform different actions here
        switch (screen.type) {
            case ScreenType.Static:
                this.setState({
                    status,
                });
                break;

            case ScreenType.Screen:
                screen.content[0].state = ScreenDataState.Active;

                this.setState({
                    status,
                    activeElementId: screen.content[0].id,
                });
                break;

            default: // do nothing
                break;
        }
    }

    private _buildScreen(src: any): Screen {
        // try to parse & build the screen
        const id = src.id || null;
        const type = this._getScreenType(src.type);
        const content = this._parseScreenContent(src.content).flat(); // flatten to one dimension

        // if this screen is invalid for any reason, skip it
        if (!id || !type) {
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

            case "static":
                return ScreenType.Static;

            default:
                return ScreenType.Unknown;
        }
    }

    private _renderScreen(): ReactElement[] {
        // get the active screen
        const screen = this._getScreen(this.state.activeScreenId);
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
                    <div className="active" key={index}>
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
        if (!content) {
            return [];
        }

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
            case "text":
                return {
                    id,
                    type: ScreenDataType.Text,
                    text: element.text,
                    className: element.className,
                    state,
                    onLoad,
                }

            case "link":
                return {
                    id,
                    type: ScreenDataType.Link,
                    target: element.target,
                    className: element.className,
                    text: element.text,
                    state,
                    onLoad,
                };

            case "image":
            case "bitmap":
                return {
                    id,
                    type: ScreenDataType.Bitmap,
                    src: element.src,
                    alt: element.alt,
                    className: element.className,
                    state,
                    onLoad,
                };

            case "prompt":
                return {
                    id,
                    type: ScreenDataType.Prompt,
                    prompt: element.prompt || PROMPT_DEFAULT,
                    className: element.className,
                    commands: element.commands,
                    state,
                    onLoad,
                };

            case "toggle":
                return {
                    id,
                    type: ScreenDataType.Toggle,
                    states: element.states,
                    state,
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
        const type = element.type;

        // if the element is text-based, like text or Link, render instead a
        // teletype component
        if (type === ScreenDataType.Text || type === ScreenDataType.Link || type === ScreenDataType.Prompt
        ) {
            const text = type === ScreenDataType.Prompt ? element.prompt : element.text;
            const handleRendered = () => this._activateNextScreenData();
            return (
                <Teletype
                    key={key}
                    text={text}
                    onComplete={handleRendered}
                    onNewLine={this._handleTeletypeNewLine}
                    autocomplete={false}
                    className={element.className}
                />
            );
        }

        // the toggle gets its text from the states array
        if (type === ScreenDataType.Toggle) {
            const text = element.states.find((item: any) => item.active === true).text;
            const handleRendered = () => this._activateNextScreenData();
            return (
                <Teletype
                    key={key}
                    text={text}
                    onComplete={handleRendered}
                    onNewLine={this._handleTeletypeNewLine}
                    autocomplete={false}
                    className={element.className}
                />
            );
        }

        if (type === ScreenDataType.Bitmap) {
            const handleRendered = () => this._activateNextScreenData();
            return (
                <Bitmap
                    key={key}
                    className={element.className}
                    src={element.src}
                    alt={element.alt}
                    onComplete={handleRendered}
                />
            );
        }

        // otherwise, just activate the next element
        this._activateNextScreenData();
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
                    onClick={this._handleLinkClick}
                    onRendered={handleRendered}
                />
            );
        }

        // bitmap
        if (element.type === ScreenDataType.Bitmap) {
            const onComplete = () => {
                // this._activateNextScreenData();
                this._setElementState(element.id, ScreenDataState.Done);
            };
            return (
                <Bitmap
                    key={key}
                    className={className}
                    src={element.src}
                    alt={element.alt}
                    onComplete={onComplete}
                    autocomplete={true}
                />
            );
        }

        // prompt
        if (element.type === ScreenDataType.Prompt) {
            return (
                <Prompt
                    key={key}
                    className={className}
                    disabled={!!this.state.activeDialogId}
                    prompt={element.prompt}
                    commands={element.commands}
                    onCommand={this._handlePromptCommand}
                />
            );
        }

        // prompt
        if (element.type === ScreenDataType.Toggle) {
            return (
                <Toggle
                    key={key}
                    className={className}
                    states={element.states}
                />
            );
        }

        return null;
    }

    private _changeScreen(targetScreen: string): void {
        // todo: handle missing screen
        // unload the current screen first
        this._unloadScreen();

        // active the first element in the screen's content collection
        const screen = this._getScreen(targetScreen);
        const activeElement = screen.content[0];
        activeElement.state = ScreenDataState.Active;

        this.setState({
            activeScreenId: targetScreen,
            activeElementId: activeElement.id,
            status: AppStatus.Active,
        });
    }

    private _setElementState(id: string, state: ScreenDataState): void {
        const screen = this._getScreen(this.state.activeScreenId);
        const content = screen.content.find(element => element.id === id);

        // only change the state if we need to
        if (content && (content.state !== state)) {
            content.state = state;
        }
;   }

    private _unloadScreen(): void {
        // go through the current screen elements, setting
        // their states to ScreenDataState.Ready
        const screen = this._getScreen(this.state.activeScreenId);
        screen.content.forEach(element => {
            element.state = ScreenDataState.Unloaded;
        });
    }

    private _getScreenDataById(id: string): any {
        const screen = this._getScreen(this.state.activeScreenId);
        return screen.content.find(element => element.id === id);
    }

    // find the currently active element and, if possible, activate it
    private _activateNextScreenData(): void {
        const screen = this._getScreen(this.state.activeScreenId);
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
            this.setState({
                activeElementId: null,
                status: AppStatus.Done,
            });

            return;
        }

        // otherwise, activate the next one
        screen.content[activeIndex + 1].state = ScreenDataState.Active;

        // todo: indicate everything's done
        this.setState({
            activeElementId: screen.content[activeIndex + 1].id,
        });
    }

    private _getActiveScreenData(): ScreenData {
        const screen = this._getScreen(this.state.activeScreenId);
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
        const screen = this._getScreen(this.state.activeScreenId);
        screen.content[index].state = ScreenDataState.Active;
    }

    private _toggleDialog(dialogId?: string): void {
        // TODO: check if targetDialog is a valid dialog
        this.setState({
            activeDialogId: dialogId || null,
        });
    }

    private _handlePromptCommand(command: string, args?: any) {
        // handle the various commands
        if (!args || !args.type) {
            // display an error message
            return;
        }

        switch (args.type) {
            case "link":
                // fire the change screen event
                args.target && this._changeScreen(args.target);
                break;

            case "dialog":
                args.target && this._toggleDialog(args.target);
                break;

            case "console":
                console.log(command, args);
                break;

            default:
                // throw an error message
                break;
        }
    }

    private _renderDialog(): ReactElement {
        const { activeDialogId, dialogs, } = this.state;

        if (!activeDialogId) {
            return null;
        }

        const dialog = dialogs.find(element => element.id === activeDialogId);
        if (!dialog) {
            return null;
        }

        const handleClose = () => this._toggleDialog();

        return (
            <Modal
                text={dialog.content}
                onClose={handleClose}
            />
        );
    }

    private _handleTeletypeNewLine(): void {
        // TODO: handle lineheight/scrolling
        // const ref = this._containerRef;
        void 0;
        // console.log("scrolling!", ref);
        // const lineheight = this.props.measurements.lineHeight;
        // if (ref) {
        //     ref.current.scrollTop += lineheight;
        // }
    }

    private _handleLinkClick(target: string | any[], shiftKey: boolean): void {
        // if it's a string, it's a screen
        if (typeof target === "string") {
            this._changeScreen(target);
            return;
        }

        // otherwise, it's a LinkTarget array
        const linkTarget = (target as any[]).find(element => element.shiftKey === shiftKey);
        if (linkTarget) {
            // perform the appropriate action based on type
            // TODO: type-check the object
            if (linkTarget.type === "dialog") {
                this._toggleDialog(linkTarget.target);
                return;
            }

            if (linkTarget.type === "link") {
                this._changeScreen(linkTarget.target);
                return;
            }
        }
    }
}

export default Phosphor;
