import React, { useContext, useState } from "react";
import { SetParamType } from "../common/messages";
import { t } from "./translation_ru";
import { useDebouncedCallback } from 'use-debounce';
import { SocketContext, DataContext } from './gameContext';
import * as material, { Settings, StyledIconBase } from '@styled-icons/material';
import styled from 'styled-components';
import useHover from '@react-hook/hover';

const StyledValue = styled.span`
    vertical-align: middle;
    padding: 4.5px 0;
    padding-right: 27px;
    display: inline-block;
`

const StyledSettingInput = styled.input`
    width: 39px;
    background: transparent;
    border: 1px solid;
    color: ${(theme) => theme.color};
    padding: 2px;
    margin: 3px;
`

const InputIconWrapper = styled.div`
    ${StyledIconBase} {
        vertical-align: middle;
        margin-right: 2px;
    }
`

const InputContainer = styled.div`
    display: inline;
`

type GameSettingType = {
    param: SetParamType,
    label: string,
    icon: string,
    min?: number,
    max?: number
}

const gameSettings: GameSettingType[] = [
    { param: 'playerTime', label: 'player time', icon: 'Alarm', min: 0},
    { param: 'teamTime', label: 'team time', icon: 'Alarm', min: 0},
    { param: 'masterTime', label: 'master time', icon: 'AlarmOn', min: 0},
    { param: 'revealTime', label: 'reveal time', icon: 'AlarmOn', min: 0},
    { param: 'wordsLevel', label: 'words level', icon: 'School', min: 1, max: 4},
    { param: 'goal', label: 'goal', icon: 'flag', min: 1}
];

const SettingInput = ({ param, label, icon, min, max }: GameSettingType) => {
    const data = useContext(DataContext);
    const socket = useContext(SocketContext);
    const { hostId, userId, phase, paused } = data;
    const isHost = hostId === userId;
    const inProcess = phase !== 0 && !paused;
    const editable = isHost && !inProcess;
    const value = data[param];

    const [update] = useDebouncedCallback((newVal: number) => {
        if (!isNaN(newVal)) {
            socket.emit("set-param", param, newVal);
        }
    }, 100);
    const InputIcon = material[icon];

    return (
        <InputContainer>
            <InputIcon title={t(label)} />
            {(editable) ? (
                <StyledSettingInput
                    type="number"
                    defaultValue={value}
                    min={min}
                    max={max}
                    onChange={evt => update(evt.target.valueAsNumber)}
                />
            ) : (
                <StyledValue>
                    {value}
                </StyledValue>
            )}
        </InputContainer>
    )
}

const StyledGameSettings = styled.div`
    text-align: left;
    border-bottom: 1px solid;
    padding-bottom: 6px;
    height: 25px;
    margin-bottom: 9px;
`

const GameSettings = () => (
    <StyledGameSettings>
        <InputIconWrapper>
            {gameSettings.map((setting) => <SettingInput {...setting} />)}
        </InputIconWrapper>
    </StyledGameSettings>
)

const SideStyleWrapper = styled.div`
    ${StyledIconBase} {
        margin-right: 2px;
        cursor: pointer;

        &:hover {
            background: ${({theme}) => theme.settingHoverBg}
        }
    }
`

type HostControlsProps = { refreshState: () => void };

type ButtonProps = {
    icon: string;
    onClick: () => void;
}

const SideButtons = ( {refreshState }: HostControlsProps ) => {
    const { hostId, userId, phase, paused, teamsLocked, timed, playerNames } = useContext(DataContext);
    const socket = useContext(SocketContext);
    const isHost = hostId === userId;
    const inProcess = phase !== 0 && !paused;
    const buttons: ButtonProps[] = [];
    if (isHost) {
        buttons.push({
            icon: 'Store',
            onClick: () => socket.emit("set-room-mode", false)
        });
        buttons.push({
            icon: (inProcess) ? 'Pause' : 'PlayArrow',
            onClick: () => socket.emit("toggle-pause")
        });
        if (paused) {
            buttons.push({
                icon: (teamsLocked) ? 'LockOutline' : 'LockOpen',
                onClick: () => socket.emit("toggle-lock")
            });
            buttons.push({
                icon: (timed) ? 'Alarm' : 'AlarmOff',
                onClick: () => socket.emit("toggle-timed")
            });
            buttons.push({
                icon: 'Sync',
                onClick: () => popup.confirm(
                    {content: "Restart? Are you sure?"},
                    (evt) => evt.proceed && socket.emit("restart")
                )
            });
        }
    }

    const changeName = () => popup.prompt({
        content: "New name",
        value: playerNames[userId] || ""
    }, ({proceed, input_value}) => {
        const newName =  input_value?.trim();
        if (proceed && newName) {
            socket.emit("change-name", newName);
            localStorage.userName = newName;
        }
    })
    buttons.push({
        icon: 'Edit',
        onClick: changeName
    });

    const toggleMuteSounds = () => {
        localStorage.muteSounds = !parseInt(localStorage.muteSounds) ? 1 : 0;
        refreshState();
    };
    buttons.push({
        icon: (parseInt(localStorage.muteSounds)) ? 'VolumeOff' : 'VolumeUp', 
        onClick: toggleMuteSounds
    });

    const toggleTheme = () => {
        localStorage.darkThemeDixit = !parseInt(localStorage.darkThemeDixit) ? 1 : 0;
        document.body.classList.toggle("dark-theme");
        refreshState();
    };
    buttons.push({
        icon: (parseInt(localStorage.darkThemeDixit)) ? 'WbSunny' : 'Brightness2', 
        onClick: toggleTheme
    });

    return (
        <SideStyleWrapper>
            {buttons.map(({onClick, icon}) => {
                const SideIcon = material[icon];
                retrn (
                    <SideIcon onClick={onClick} />
                )
            })}
        </SideStyleWrapper>
    )
}

const StyledHostControls = styled.div`
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 6px;
    background: ${({theme}) => theme.overlayBg};
    user-select: none;
    cursor: default;
    text-align: right;
    z-index: 1;
    box-shadow: 0 0 4px 1px ${({theme}) => theme.shadowColor};
`

const StyledSettings = styled(Settings)`
    padding: 2px;
`

const HoverSettings = (props) => {
    const target = React.useRef(null);
    const isHovering = useHover(target, {enterDelay: 200, leaveDelay: 200});
    return (
        <StyledHostControls ref={target}>
            {isHovering && props.children}
            <StyledSettings />
        </StyledHostControls>
    )
}

const TapSettins = (props) => {
    const [show, setShow] = useState(false);
    return (
        <StyledHostControls onTouchStart={() => setShow(!show)}>
            {show && props.children}
            <StyledSettings />
        </StyledHostControls>
    )
}

//TODO: check on Androids and iPhones
export const HostControls = ( { refreshState }: HostControlsProps) => {
    const { timed } = useContext(DataContext);
    const canHover = window.matchMedia('(hover: none)').matches;
    const Container = (canHover) ? HoverSettings : TapSettings;
    return (
        <Container>
            {timed && <GameSettings />}
            <SideButtons refreshState={refreshState} />
        </Container>
    );
}