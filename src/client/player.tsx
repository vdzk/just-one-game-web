import React, { Component } from "react";
import { Avatar } from './avatar';
import { t } from "./translation_ru";

class PlayerHostControls extends Component<{
    data: FullState,
    socket: WebSocketChannel,
    id: string
}> {
    removePlayer(id, evt) {
        evt.stopPropagation();
        popup.confirm(
            {content: `Removing ${this.props.data.playerNames[id]}?`},
            (evt) => evt.proceed && this.props.socket.emit("remove-player", id)
        );
    }

    giveHost(id, evt) {
        evt.stopPropagation();
        popup.confirm(
            {content: `Give host ${this.props.data.playerNames[id]}?`},
            (evt) => evt.proceed && this.props.socket.emit("give-host", id))
        ;
    }

    render() {
        const
            data = this.props.data,
            id = this.props.id;
        return (
            <div className="player-host-controls">
                {(data.hostId === data.userId && data.userId !== id) ? (
                    <i className="material-icons host-button"
                       title="Give host"
                       onClick={(evt) => this.giveHost(id, evt)}>
                        vpn_key
                    </i>) : ""}
                {(data.hostId === data.userId && data.userId !== id) ? (
                    <i className="material-icons host-button"
                       title="Remove"
                       onClick={(evt) => this.removePlayer(id, evt)}>
                        delete_forever
                    </i>) : ""}
                {(data.hostId === id) ? (
                    <i className="material-icons host-button inactive"
                       title="Game host">
                        stars
                    </i>
                ) : ""}
            </div>
        )
    }
}

class Player extends Component<{
    data: FullState,
    socket: WebSocketChannel,
    id: string
}> {

    clickSaveAvatar() {
        document.getElementById("avatar-input").click();
    }


    render() {
        const {data, socket, id} = this.props;
        const {master, readyPlayers} = data;
        const isReady = readyPlayers.includes(id);
        const isMaster = id === master;

        return (
            <div className={cs("player", {
                ready: isReady && !isMaster,
                offline: !~data.onlinePlayers.indexOf(id),
                self: id === data.userId,
                master: isMaster,
            })} onTouchStart={(e) => (e.target as HTMLElement).focus()}>
                <div className="player-inner">
                    <div className="player-avatar-section"
                         onTouchStart={(e) => (e.target as HTMLElement).focus()}
                         onClick={() => (id === data.userId) && this.clickSaveAvatar()}>
                        <Avatar data={data} player={id}/>
                        {id === data.userId ? (<i className="change-avatar-icon material-icons" title="Change avatar">
                            edit
                        </i>) : ""}
                    </div>
                    <div className="player-name-section">
                        <span className="player-name">
                            {data.playerNames[id]}
                        </span>
                        &nbsp;
                        <PlayerHostControls id={id} data={data} socket={socket}/>
                        <span className="spacer"/>
                        <span className="score-cont">
                            <span className="score">
                                {data.playerScores[id] || 0}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export class PlayerList extends ConnectedComponent {

    joinPlayersClick(evt) {
        evt.stopPropagation();
        if (!this.props.data.teamsLocked)
            this.props.socket.emit("players-join");
    }

    render() {
        const
            socket = this.props.socket,
            data = this.props.data;
        return (
            <div className="player-list-section">
                <div className="player-list">
                    {data.players.map((id => (
                        <Player key={id} data={data} id={id} socket={socket}/>
                    )))}
                    {!data.players.includes(data.userId) && (
                        <div
                            className="player join-button"
                            onClick={(evt) => this.joinPlayersClick(evt)}
                        >
                            <div className="player-inner">
                                <div className="player-avatar-section">
                                    <div className="avatar"/>
                                </div>
                                <div className="player-name-section">
                                <span className="player-name">
                                    {t('Enter')}
                                </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

class Spectator extends Component<{
    data: FullState,
    socket: WebSocketChannel,
    id: string
}> {
    render() {
        const
            data = this.props.data,
            socket = this.props.socket,
            id = this.props.id;
        return (
            <span className={cs("spectator", {self: id === data.userId})}>
                &nbsp;●&nbsp;
                <span className="spectator-name">{data.playerNames[id]}</span>
                &nbsp;
                <PlayerHostControls id={id} data={data} socket={socket}/>
            </span>
        )
    }
}

export class SpectatorList extends ConnectedComponent {
    joinSpectatorsClick(evt) {
        evt.stopPropagation();
        if (!this.props.data.teamsLocked)
            this.props.socket.emit("spectators-join");
    }

    render() {
        const
            data = this.props.data,
            socket = this.props.socket,
            empty = !data.spectators.length;
        return (
            <div className="spectator-placeholder">
                <div className={cs('spectators-section')}>
                    <div
                        className={cs("spectators", {empty: empty})}
                        onClick={(evt) => this.joinSpectatorsClick(evt)}
                    >
                        {t('Spectators')}:{empty && ' ...'}
                        {data.spectators.map((id => (
                            <Spectator key={id} data={data} id={id} socket={socket}/>
                        )))}
                    </div>
                </div>
            </div>
        )
    }
}