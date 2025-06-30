// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      link: string;
      linkHover: string;
      text: string;
      textLight: string;
      background: string;
      backgroundLight: string;
      button: string;
      buttonLight: string;
      accent: string;
      logoShadow: string;
      reactLogoShadow: string;
      cardText: string;
      error: string;
      primaryHover: string;
      disabled: string;
      outOfStock: string;
      borderLight: string;
      border: string;
      white: string;
    };
    sizes: {
      rootMaxWidth: string;
      rootPadding: string;
      logoHeight: string;
      logoPadding: string;
      cardPadding: string;
      buttonPadding: string;
      buttonFontSize: string;
      h1FontSize: string;
    };
  }
}
