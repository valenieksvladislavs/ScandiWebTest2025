import type { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: '#5ECE7B',
    secondary: '#5ECE7B',
    link: '#646cff',
    linkHover: '#535bf2',
    text: '#213547',
    textLight: 'rgba(255, 255, 255, 0.87)',
    background: '#242424',
    backgroundLight: '#ffffff',
    button: '#1a1a1a',
    buttonLight: '#f9f9f9',
    accent: '#747bff',
    logoShadow: '#646cffaa',
    reactLogoShadow: '#61dafbaa',
    cardText: '#888',
    error: '#d00',
    primaryHover: '#4dbd6a',
    disabled: '#ccc',
    outOfStock: '#8d8f9a',
    borderLight: '#eee',
    border: '#1d1f22',
    white: '#fff',
  },
  sizes: {
    rootMaxWidth: '1280px',
    rootPadding: '2rem',
    logoHeight: '6em',
    logoPadding: '1.5em',
    cardPadding: '2em',
    buttonPadding: '0.6em 1.2em',
    buttonFontSize: '1em',
    h1FontSize: '3.2em',
  }
};
