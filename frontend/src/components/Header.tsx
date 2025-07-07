import { useQuery, gql } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import { useCartUI } from '../context/CartUIContext';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
    }
  }
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.theme.colors.backgroundLight};
`;

const HeaderContent = styled.div`
  max-width: ${({ theme }) => theme.sizes.rootMaxWidth};
  height: ${({ theme }) => theme.sizes.headerHeight};
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoriesMenu = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const CategoryLink = styled(Link) <{ $active?: boolean }>`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.sizes.headerHeight};
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-weight: 500;
  line-height: 120%;
  text-transform: uppercase;
  padding: 0 16px;
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
  color: ${props => props.theme.colors.text};
  position: relative;

  &:hover svg {
    color: ${props => props.theme.colors.primary};
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
  background: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.backgroundLight};
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
  const { toggle, isOpen } = useCartUI();
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const selectedCategory = pathParts[0] || null;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const noSelectedCategory = !selectedCategory || selectedCategory === 'all';

  return (
    <HeaderContainer>
      <HeaderContent style={{ position: 'relative' }}>
        <CategoriesMenu>
          <CategoryLink
            data-testid={`${noSelectedCategory ? 'active-' : ''}category-link`}
            key='all'
            to='/all'
            $active={noSelectedCategory}
            onClick={() => {
              if (isOpen) {
                toggle();
              }
            }}
          >
            All
          </CategoryLink>

          {data?.categories.map((category: { name: string }) => {
            const active = selectedCategory === category.name;
            return (
              <CategoryLink
                data-testid={`${active ? 'active-' : ''}category-link`}
                key={category.name}
                to={`/${category.name}`}
                $active={active}
                onClick={() => {
                  if (isOpen) {
                    toggle();
                  }
                }}
              >
                {category.name}
              </CategoryLink>
            )
          })}
        </CategoriesMenu>
        <CartButton onClick={toggle}>
          <CartIcon style={{ color: '#43464E' }} />
          {totalCount > 0 && <CartCount>{totalCount}</CartCount>}
        </CartButton>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
