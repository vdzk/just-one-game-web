import React, { Component } from "react";
import { render } from "react-dom";
import { StatusBar } from './statusBar';
import { Hints } from './hint';
import { PlayerList, SpectatorList } from './player';
import { HostControls } from './hostControls';
import { AvatarSaver } from './avatar';
import { InitUserArgs, RoomState, PlayerState } from '../common/messages';

declare global {
    interface WebSocketChannel {
        on(messageName: string, callback: (d: any) => any): WebSocketChannel;
        emit(messageName: string, ...data: any[]): any;
    }

    const hyphenationPatternsRu: any;
    const createHyphenator: any;

    interface Window {
        wssToken: string;
        socket: WebSocketWrapper;
        hyphenate: (text: string) => string;
        CommonRoom: CommonRoomComponent;
    }

    type CommonRoomComponent =
        (new() => Component<{state: FullState, app: Game}>)
        & { processCommonRoom: (serverState: any, clientState: any) => any };

    const CommonRoom: CommonRoomComponent;

    type PopupEvt = {
        proceed?: boolean;
        input_value?: string;
    }

    type popupModal = (
        options: object,
        callback?: (evt: PopupEvt) => any
    ) => void;

    const popup: {
        alert: popupModal;
        prompt: popupModal;
        confirm: popupModal;
    };

    const cs: (...args: any[]) => string;

    type UserId = string;

    type HollowState = {
        inited: false;
    }

    type FullState = RoomState & PlayerState & {
        inited: true;
        userId: UserId;
    }

    type DisconnectedState = Partial<RoomState> & {
        inited: false;
        disconnected: true;
        disconnectReason: any;
    }

    type GameCompState = HollowState | FullState | DisconnectedState;
}

window.hyphenate = createHyphenator(hyphenationPatternsRu);

interface WebSocketWrapper {
    of(channelName: string): WebSocketChannel;
    on(messageName: string, callback: (data: any) => any): void;
}


function makeId() {
    let text = "";
    const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

class Game extends Component<{}, GameCompState> {

    phase2StatusBar?: () => void;
    
    userId = localStorage.dixitUserId;
    userToken = localStorage.dixitUserToken;
    socket = window.socket.of("just-one");
    sounds: Record<string, HTMLAudioElement> = {};

    constructor(props: object) {
        super(props);
        this.state = {
            inited: false
        }
    }

    componentDidMount() {
        const initArgs : InitUserArgs = {
            avatarId: localStorage.avatarId,
            roomId: location.hash.substr(1),
            userId: this.userId,
            token: this.userToken,
            userName: localStorage.userName,
            wssToken: window.wssToken
        };
        if (!parseInt(localStorage.darkThemeDixit))
            document.body.classList.add("dark-theme");
        if (!localStorage.dixitUserId || !localStorage.dixitUserToken) {
            while (!localStorage.userName)
                localStorage.userName = prompt("Your name");
            localStorage.dixitUserId = makeId();
            localStorage.dixitUserToken = makeId();
        }
        if (!location.hash)
            history.replaceState(undefined, '', location.origin + location.pathname + "#" + makeId());
        else
            history.replaceState(undefined, '', location.origin + location.pathname + location.hash);
        if (localStorage.acceptDelete) {
            initArgs.acceptDelete = localStorage.acceptDelete;
            delete localStorage.acceptDelete;
        }
        this.socket.on("state", (state: RoomState) => {
            //Temporary hack to accommodate slow-loading standalone babel script
            setTimeout(() => {
                CommonRoom.processCommonRoom(state, this.state);
                this.refreshState();
            }, 1000);
            if (this.state.inited) {
                if (this.state.phase && state.phase !== 0 && !parseInt(localStorage.muteSounds)) {
                    if (this.state.master !== this.userId && state.master === this.userId)
                        this.sounds.master.play();
                    else if (this.state.phase === 1 && state.phase === 2)
                        this.sounds.start.play();
                    else if (this.state.phase === 2 && state.phase === 3)
                        this.sounds.reveal.play();
                    else if (state.phase === 2 && this.state.readyPlayers.length !== state.readyPlayers.length)
                        this.sounds.tap.play();
                }
                if (this.state.phase !== 2 && state.phase === 2)
                    this.phase2StatusBar && this.phase2StatusBar();
            }
            this.setState(Object.assign({
                userId: this.userId
            }, state));
        });
        this.socket.on("player-state", (state: PlayerState) => {
            this.setState(Object.assign(this.state, state));
        });
        this.socket.on("message", text => {
            popup.alert({content: text});
        });
        window.socket.on("disconnect", (event) => {
            this.setState({
                inited: false,
                disconnected: true,
                disconnectReason: event.reason
            });
        });
        this.socket.on("reload", () => {
            setTimeout(() => window.location.reload(), 3000);
        });
        this.socket.on("auth-required", () => {
            this.setState(Object.assign({}, this.state, {
                userId: this.userId,
                authRequired: true
            }));
            setTimeout(() => window.location.reload(), 3000)
        });
        this.socket.on("prompt-delete-prev-room", (roomList) => {
            if (localStorage.acceptDelete =
                prompt(`Limit for hosting rooms per IP was reached: ${roomList.join(", ")}. Delete one of rooms?`, roomList[0]))
                location.reload();
        });
        this.socket.on("ping", (id) => {
            this.socket.emit("pong", id);
        });
        document.title = `Just one - ${initArgs.roomId}`;
        this.socket.emit("init", initArgs);

        const soundVolume: Record<string, number> = {
            master: 0.7,
            start: 0.4,
            reveal: 0.3,
            tap: 0.3
        }
        for (const name in soundVolume) {
            this.sounds[name] = new Audio(`/just-one/${name}.mp3`);
            this.sounds[name].volume = soundVolume[name];
        }
    }

    setTime(time: number) {
        this.setState(Object.assign({}, this.state, {time: time}));
    }

    refreshState() {
        this.setState(Object.assign({}, this.state));
    }

    //TODO: move to Hints component
    getOptimalWidth( numPlayers: number ): React.CSSProperties {
        const numCards = numPlayers - 1;
        const contWidth = window.innerWidth - 20; //approximate
        if (numCards <= 6 || contWidth < 760) {
            return {};
        } else {
            const cardWidth = 210 + 25; //approximate
            const originalNumCols = Math.floor(contWidth / cardWidth);
            const originalNumRows = Math.ceil(numCards / originalNumCols);
            let numRows = originalNumRows;
            let numCols = originalNumCols;
            while (numRows === originalNumRows) {
                numCols-- ;
                numRows = Math.ceil(numCards / numCols);
            };
            numCols++;
            return ({ maxWidth: numCols * cardWidth + 'px' });
        }

    }

    render() {
        if ('disconnected' in this.state && this.state.disconnected) {
            return (<div className="kicked">
                Disconnected{this.state.disconnectReason ? ` (${this.state.disconnectReason})` : ""}
            </div>);
        } else if (this.state.inited) {
            const
                data = this.state,
                isMaster = data.master === data.userId,
                socket = this.socket;
            return (
                <div className={cs("game", {timed: this.state.timed})}>
                    <div className={
                        cs("game-board", {
                            active: this.state.inited,
                            isMaster,
                            teamsLocked: data.teamsLocked
                    })}>
                        <SpectatorList data={data} socket={socket} />
                        <PlayerList data={data} socket={socket}  />
                        <div className="main-row">
                            <StatusBar data={data} socket={socket}
                                setTime={(time) => this.setTime(time)}
                                //Notify about phase 2
                                //https://stackoverflow.com/questions/37949981/call-child-method-from-parent#45582558
                                setPhase2={(cb: () => void) => this.phase2StatusBar = cb}
                            />
                        </div>
                        <div className="main-row" style={this.getOptimalWidth(data.players.length)}>
                            <Hints data={data} socket={socket} />
                        </div>
                        <AvatarSaver socket={socket}
                            userId={this.userId}
                            userToken={this.userToken}
                        />
                        <HostControls data={data} socket={socket}
                            refreshState={() => this.refreshState()}
                        />
                        {window.CommonRoom && <CommonRoom state={this.state} app={this}/>}
                    </div>
                </div>
            );
        } else {
            return (<div/>);
        }
    }
}

render(<Game/>, document.getElementById('root'));
