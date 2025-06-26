import { useQuery, gql } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import { useState } from 'react';
import CartModal from './CartModal';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
    }
  }
`;

const HeaderContainer = styled.header`
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoriesMenu = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const CategoryLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  line-height: 120%;
  text-transform: uppercase;
  padding: 30px 16px;
  transition: color 0.2s;
  border-bottom: 2px solid transparent;
  &:hover {
    color: ${props => props.theme.colors.primary};
    border-bottom: 2px solid ${props => props.theme.colors.primary};
  }
  ${props => props.$active && `
    color: ${props.theme.colors.primary};
    border-bottom: 2px solid ${props.theme.colors.primary};
  `}
`;

const CartButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  position: relative;

  &:hover svg {
    color: #5ece7b;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  font-size: 0.8em;
  line-height: 100%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transform: translate(50%, -50%);
`;

const Header = () => {
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  const { items } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <HeaderContainer>
      <HeaderContent style={{ position: 'relative' }}>
        <CategoriesMenu>
          {data?.categories.map((category: { name: string }) => {
            const active = selectedCategory === category.name;
            return (
              <CategoryLink
                data-testid={`${active ? 'active-' : ''}category-link`}
                key={category.name}
                to={`/?category=${category.name}`}
                $active={active}
              >
                {category.name}
              </CategoryLink>
            )
          })}
        </CategoriesMenu>
        <CartButton data-testid='cart-btn' onClick={() => setCartOpen(v => !v)}>
          <CartIcon style={{ color: '#43464E' }} />
          {totalCount > 0 && <CartCount>{totalCount}</CartCount>}
        </CartButton>
        {cartOpen && <CartModal onClose={() => setCartOpen(false)} />}
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 