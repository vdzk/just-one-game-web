import React, { useContext } from "react";
import { SocketContext, DataContext } from './gameContext';
import { getMessy } from './messy';
import { mainRowSizes } from './theme';
import { Card, CardLogo, ScoreChange, CardAvatar } from './card'
import { Favorite, FavoriteOutline, Warning } from '@styled-icons/material';
import styled from 'styled-components';

const StyledHint = styled(Card).attr({
  style: props => props.style
})`
    font-family: 'Bad Script', cursive;
    font-size: 40px;
    line-height: 40px;
    background: url(/just-one/crumpled.jpg);
    padding: 5px;
    background-size: 92%;
    opacity: ${({banned}) => (banned) ? 0.7 : 1};
`

const BannedHintText = styled.div`
    position: relative;

    &:after {
        border-top: 2px solid #000;
        position: absolute;
        content: "";
        right: 0;
        top: 54%;
        left: 0;
    }
`

const HintCardLogo = styled(CardLogo).attr({
  style: props => props.style
})`
    height: 55%;
    background-image: url(/just-one/logo-paper.png);
    opacity: 0.4;
`

const MarkButton = styled.div`
    position: absolute;
    right: 0px;
    top: 0px;
    color: #363739;
    cursor: pointer;
    padding: 5px;
`

const LikeButton = styled(MarkButton)`
    color: #f939a1;
`

const BanButton = styled(MarkButton)`
    color: {(banned) => (banned) ? '#c14646' : '#363739'};
`

type HintProps = {
    player: UserId;
    index: number;
}

const Hint = ({ player, index }: HintProps ) => {
    const socket = useContext(SocketContext);
    const {
        bannedHints, hints, closedHints, playerLiked, userId,
        master, phase, wordGuessed, scoreChanges, rounds
    } = useContext(DataContext);
    const banned = bannedHints[player];
    const isMaster = userId === master;
    const isLiked = playerLiked === player;
    const origText = hints[player] || (closedHints && closedHints[player]);
    const text = origText ? window.hyphenate(origText) : null;

    const corners = [];
    if (!isMaster || playerLiked || (phase === 4 && !wordGuessed)) {
        corners.push( <CardAvatar player={player}/> );
    }
    if (phase === 2 || (phase === 4 && banned)) {
        corners.push(
            <BanButton
                banned={banned}
                onClick={() => socket.emit("toggle-hint-ban", player)}
            >
                <Warning size={32} />
            </BanButton>
        )
    }
    if (
        isLiked
        || (phase === 4 && !banned && isMaster && playerLiked == null && wordGuessed)
    ) {
        corners.push(
            <LikeButton onClick={() => socket.emit("set-like", player)}>
                {(isLiked) ? <Favorite size={31}/> : <FavoriteOutline size={31}/>}
            </LikeButton>
        )
    }
    const delta = scoreChanges[player];
    if (delta) {
        const changeText = ((delta > 0) ? '+' : '') + delta;
        corners.push(
            <ScoreChange>
                {changeText}
            </ScoreChange>
        );
    }

    const messyKey = rounds + '_' + index;
    let content
    if (text != null) {
        if (banned) {
            content = <BannedHintText>{text}</BannedHintText>
        } else {
            content = <div>{text}</div>;
        }
    } else {
        content = <HintCardLogo style={getMessy('card-logo', messyKey)}/>;
    }

    return (
        <StyledHint banned={banned} style={getMessy('card', messyKey)}>
            {content}
            {corners}
        </StyledHint>
    )
}

const cardMinWidth = 210;
const cardGap = 25;

const getOptimalWidth = ( numCards: number ): number => {
    const contWidth = window.innerWidth - 2 * mainRowSizes.padding; //approximate
    if (numCards <= 6 || contWidth < mainRowSizes.maxWidth) {
        return mainRowSizes.maxWidth;
    } else {
        const cardWidth = cardMinWidth + cardGap; //approximate
        const originalNumCols = Math.floor(contWidth / cardWidth);
        const originalNumRows = Math.ceil(numCards / originalNumCols);
        let numRows = originalNumRows;
        let numCols = originalNumCols;
        while (numRows === originalNumRows || numRows <= 2) {
            numCols-- ;
            numRows = Math.ceil(numCards / numCols);
        };
        numCols++;
        return numCols * cardWidth;
    }
}

const StyledHints = styled.div<{ maxCards: number }>`
    max-width: ${({maxCards}) => getOptimalWidth(maxCards)}px;
    margin: 0 auto;
    padding: 0 ${mainRowSizes.padding}px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(${cardMinWidth}px, 1fr));
    gap: ${cardGap}px;
    filter: drop-shadow(0px 0px 2px ${({theme}) => theme.shadowColor});
`

export const Hints = () => {
    const { players, playerHints } = useContext(DataContext);
    const maxCards = Math.max(players.length - 1, playerHints.length);
    return (
        <StyledHints maxCards={maxCards}>
            {playerHints.map((player, i) => 
                <Hint player={player} key={i} index={i}/>
            )}
        </StyledHints>
    );
}