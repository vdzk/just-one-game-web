import { Avatar } from "./avatar";
import styled from 'styled-components';

export const Card = styled.div`
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    text-align: center;
    color: ${({theme}) => theme.cardColor};
`

export const CardLogo = styled.div`
    background: url(/just-one/logo.png);
    background-size: contain;
    width: 100%;
    height: 81%;
    background-position: center;
    background-repeat: no-repeat;
`

export const ScoreChange = styled.div`
    position: absolute;
    left: 0px;
    top: 0px;
    color: green;
    font-weight: bold;
    font-family: 'Roboto Condensed', sans-serif;
    letter-spacing: 0.5px;
    font-size: 28px;
    padding-left: 6px;
`

export const CardAvatar = styled(Avatar)`
    position: absolute;
    left: 0px;
    bottom: 0px;
    padding: 5px;
    width: 41px;
    height: 30px;
    margin: 4px;
`