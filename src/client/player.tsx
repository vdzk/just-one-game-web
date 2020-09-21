import React, { useContext } from "react";
import { Avatar } from './avatar';
import { DataContext, SocketContext } from "./gameContext";
import { t } from "./translation_ru";

type UserProps = { id: UserId };

const PlayerHostControls = ({ id }: UserProps) => {
    const { hostId, userId, playerNames } = useContext(DataContext);
    const socket = useContext(SocketContext);
    const isHost = hostId === userId;
    const userHost = hostId === id;
    const self = id === userId;

    const removePlayer = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
        evt.stopPropagation();
        popup.confirm(
            {content: `Removing ${playerNames[id]}?`},
            (evt) => evt.proceed && socket.emit("remove-player", id)
        );
    }

    const giveHost = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
        evt.stopPropagation();
        popup.confirm(
            {content: `Give host ${playerNames[id]}?`},
            (evt) => evt.proceed && socket.emit("give-host", id)
        );
    }

    return (
        <div className="player-host-controls">
            {isHost && !self && (<>
                <i className="material-icons host-button"
                    title="Give host"
                    onClick={giveHost}>
                    vpn_key
                </i>
                <i className="material-icons host-button"
                    title="Remove"
                    onClick={removePlayer}>
                    delete_forever
                </i>
            </>)}
            {userHost && (
                <i className="material-icons host-button inactive"
                    title="Game host">
                    stars
                </i>
            )}
        </div>
    )
}

const getPlayerShadowColor = ({theme, isReady=false, isMaster=false}) => {
    if (isMaster) {
        return 'cyan';
    } else if (isReady) {
        return '#7ace5a';
    } else {
        return theme.shadowColor;
    }
};

const getPlayerColor = ({isOffline=false, isMaster=false}) => {
    if (isOffline) {
        return '#adadad';
    } else if (isMaster) {
        return '#00bdbd';
    } else {
        return 'inherit';
    }
}

const StyledPlayer = styled.div`
    white-space: nowrap;
    user-select: none;
    display: inline-flex;
    margin: 6px 1px;
    filter: drop-shadow(0px 0px 2px ${getPlayerShadowColor});
    color: ${getPlayerColor};
`

const StyledPlayerInner = styled.div`
    height: 32px;
    overflow: hidden;
    clip-path: polygon(0 0, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%);
    background: ${({theme}) => theme.playerBg};
`

const PlayerAvatarSecion = styled.div`
    display: inline-block;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
`

const PlayerNameSection = styled.div`
    display: inline-flex;
    width: 147px;
    text-align: left;
    align-items: center;
    height: 100%;
    vertical-align: middle;
`

const PlayerName = styled.span`
    overflow: hidden;
    display: inline-block;
    margin: 0;
    padding-left: 6px;
    text-overflow: ellipsis;
    text-decoration: ${({textDecoration}) => textDecoration || 'none'};
`

const Player = ({ id }: UserProps) => {
    const {master, readyPlayers, onlinePlayers, userId, playerNames, playerScores} = useContext(DataContext);
    const isReady = readyPlayers.includes(id);
    const isMaster = id === master;
    const isOffline = onlinePlayers.incldes(id)
    const self = id === userId;
    const clickSaveAvatar = () => document.getElementById("avatar-input")?.click();

    return (
        <StyledPlayer  className={cs("player", {
            ready: isReady && !isMaster,
            offline: isOffline,
            self,
            master: isMaster,
        })} onTouchStart={(e) => (e.target as HTMLElement).focus()}>
            <div className="player-inner">
                <div className="player-avatar-section"
                        onTouchStart={(e) => (e.target as HTMLElement).focus()}
                        onClick={() => self && clickSaveAvatar()}>
                    <Avatar player={id}/>
                    {self && (<i 
                        className="change-avatar-icon material-icons"
                        title="Change avatar"
                    >
                        edit
                    </i>)}
                </div>
                <div className="player-name-section">
                    <span className="player-name">
                        {playerNames[id]}
                    </span>
                    &nbsp;
                    <PlayerHostControls id={id}/>
                    <span className="spacer"/>
                    <span className="score-cont">
                        <span className="score">
                            {playerScores[id] || 0}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}

const StyledPlayerList = styled.div`
    text-align: center;
`

const JoinButton = styled(StyledPlayer)`
    cursor: pointer;
`

export const PlayerList = () => {
    const { teamsLocked, players, userId } = useContext(DataContext);
    const isPlayer = players.includes(userId);
    const socket = useContext(SocketContext);

    const joinPlayersClick = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        evt.stopPropagation();
        if (!teamsLocked) socket.emit("players-join");
    }

    return (
        <StyledPlayerList>
            {players.map(id => <Player key={id} id={id} />)}
            {!isPlayer && !teamsLocked && (
                <JoinButton onClick={joinPlayersClick}>
                    <StyledPlayerInner>
                        <PlayerAvatarSecion>
                            <StyledAvatar />
                        </PlayerAvatarSecion>
                        <PlayerNameSection>
                            <PlayerName textDecoration={'underline'}>
                                {t('Enter')}
                            </PlayerName>
                        </PlayerNameSection>
                    </StyledPlayerInner>
                </JoinButton>
            )}
        </StyledPlayerList>
    );
}

const StyledSpectator = styled.span`
    font-weight: ${({self}) => (self) ? 'bold' : 'normal'};
`

const Spectator = ({ id }: UserProps) => {
    const { playerNames, userId, teamsLocked } = useContext(DataContext);
    const self = id === userId;
    return (
        <StyledSpectator self={self}>
            &nbsp;●&nbsp;
            <span>
                {playerNames[id]}
            </span>
            &nbsp;
            <PlayerHostControls id={id} />
        </StyledSpectator>
    )
}

const SpectatorPlaceholder = styled.div`
    height: 42px;
`

const SpectatorsSection = styled.div`
    text-align: center;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 2;
`

const StyledSpectators = styled.div`
    height: 20px;
    padding: 4px 6px;
    cursor: ${({teamsLocked}) => (teamsLocked) ? 'default' : 'pointer' };
    background: ${({theme}) => theme.overlayBg};
    user-select: none;
    white-space: nowrap;
    margin-left: 5px;
    line-height: 20px;
`

export const SpectatorList = () =>  {
    const { teamsLocked, spectators } = useContext(DataContext);
    const socket = useContext(SocketContext);
    const empty = spectators.length === 0;

    const spectate = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        evt.stopPropagation();
        if (!teamsLocked) socket.emit("spectators-join");
    }

    if (empty && teamsLocked) {
        return null;
    } else {
        return (
            <SpectatorPlaceholder>
                <SpectatorsSection>
                    <StyledSpectators
                        teamsLocked={teamsLocked}
                        onClick={spectate}
                    >
                        {t('Spectators')}:{empty && ' ...'}
                        {spectators.map(id => <Spectator key={id} id={id} /> )}
                    </StyledSpectators>
                </SpectatorsSection>
            </SpectatorPlaceholder>
        )
    }

}