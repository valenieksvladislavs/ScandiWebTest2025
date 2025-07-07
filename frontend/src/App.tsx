import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './constants/theme';
import { CartProvider } from './context/CartContext';
import { CartUIProvider, useCartUI } from './context/CartUIContext';
import CartModal from './components/CartModal';

const client = new ApolloClient({
  uri: 'http://swtest.local/graphql/',
  cache: new InMemoryCache()
});

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
`;

const MainContent = styled.main`
  max-width: ${({ theme }) => theme.sizes.rootMaxWidth};
  margin: 0 auto;
  padding: 20px;
  padding-top: calc(${({ theme }) => theme.sizes.headerHeight} + 20px);
`;

function CartModalGlobal() {
  const { isOpen, close } = useCartUI();
  return isOpen ? <CartModal onClose={close} /> : null;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CartProvider>
          <CartUIProvider>
            <Router>
              <AppContainer>
                <Header />
                <CartModalGlobal />
                <MainContent>
                  <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path=":category" element={<ProductList />} />
                    <Route path=":category/:id" element={<ProductDetails />} />
                  </Routes>
                </MainContent>
              </AppContainer>
            </Router>
          </CartUIProvider>
        </CartProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
