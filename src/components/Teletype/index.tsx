import React, { Component, ReactElement } from "react";

interface TeletypeProps {
    text: string;
    onRendered?: () => void;
}

interface TeletypeState {

}

class Teletype extends Component<TeletypeProps, TeletypeState> {
    constructor(props: TeletypeProps) {
        super(props);

        this.state = {

        };
    }

    public render(): ReactElement {
        return <h2>{this.props.text}</h2>;
    }

    public componentDidMount(): void {
        const { onRendered } = this.props;
        onRendered && onRendered();
    }
}

export default Teletype;
