import React, { useContext } from "react";
import { SocketContext, DataContext } from './gameContext';
import styled from 'styled-components';
import { Person } from '@styled-icons/material';

type StyledAvatarProps = {
    image?: string;
    color?: string;
}

export const StyledAvatar = styled.div<StyledAvatarProps>`
    width: 44px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(0 0, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: ${({image}) => image || 'none'};
    background-color: ${({color}) => color || 'transparent'};
`;

const Stub = styled(Person)`
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({theme}) => theme.avatarStubColor};
`

type AvatarProps = { player: UserId | null };

export const Avatar = ({ player }: AvatarProps) => {
    const { playerAvatars, playerColors } = useContext(DataContext);
    if (player === null) {
        return null;
    } else {
        const hasAvatar = !!playerAvatars[player];
        if (hasAvatar) {
            const avatarURI = `/just-one/avatars/${player}/${playerAvatars[player]}.png`;
            return <StyledAvatar image={`url(${avatarURI})`} />
        } else {
            return (
                <StyledAvatar color={playerColors[player]}>
                    <Stub/>
                </StyledAvatar>
            )
        }
    }
}