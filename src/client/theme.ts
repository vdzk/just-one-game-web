import { DefaultTheme } from "styled-components/native";

declare module "styled-components" {
    export interface DefaultTheme {
        color: string;
        cardColor: string;
        background: string;
        shadowColor: string;
        avatarStubColor: string;
        overlayBg: string;
        settingHoverBg: string;
        playerBg: string;
    }
}

const darkTheme: DefaultTheme = {
    color: '#cccaca',
    cardColor: '#444',
    background: '#202020',
    shadowColor: '#050505',
    avatarStubColor: '#fcfcfc',
    overlayBg: 'rgba(54, 55, 57, 0.78)',
    settingHoverBg: '#363739',
    playerBg: '#363739',
};

const lightTheme: DefaultTheme = {
    color: '#444',
    cardColor: '#444',
    background: '#e5efde',
    shadowColor: '#969696',
    avatarStubColor: '#969696',
    overlayBg: 'rgba(255, 252, 245, 0.58)',
    settingHoverBg: '#f4e2e0',
    playerBg: 'white',
};

const themes = [darkTheme, lightTheme];

export const getTheme = () => themes[parseInt(localStorage.darkThemeDixit)];

export const mainRowSizes = {
    maxWidth: 760,
    padding: 10,
}