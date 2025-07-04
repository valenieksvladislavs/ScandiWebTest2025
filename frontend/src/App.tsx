import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './constants/theme';
import { CartProvider } from './context/CartContext';

const client = new ApolloClient({
  uri: import.meta.env.VITE_API_URL,
  cache: new InMemoryCache()
});

const AppContainer = styled.div`
  min-height: 100vh;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CartProvider>
          <Router>
            <AppContainer>
              <Header />
              <MainContent>
                <Routes>
                  <Route path="/" element={<ProductList />} />
                  <Route path=":category" element={<ProductList />} />
                  <Route path=":category/:id" element={<ProductDetails />} />
                </Routes>
              </MainContent>
            </AppContainer>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
