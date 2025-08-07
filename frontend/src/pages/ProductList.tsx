import { useQuery, gql } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import { toKebabCase } from '../helpers/to-kebab-case';
import { useCartUI } from '../context/CartUIContext';

const GET_PRODUCTS = gql`
  query GetProducts($category: String) {
    products(category: $category) {
      id
      name
      brand
      inStock
      gallery
      attributes {
        name
        items {
          value
        }
      }
      prices {
        amount
        currency {
          label
          symbol
        }
      }
    }
  }
`;

const CategoryTitle = styled.h1`
  font-size: 42px;
  line-height: 1.6;
  font-weight: 400;
  margin: 60px 0 103px 0;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 103px 40px;
  padding-bottom: 40px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const ProductCard = styled(Link)`
  background: ${props => props.theme.colors.backgroundLight};
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  padding: 16px;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 35px #A8ACB030;
    .add-to-cart-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  overflow: hidden;
`;

const OutOfStockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1.6;
  color: ${props => props.theme.colors.outOfStock};
  font-weight: 400;
  z-index: 2;
  pointer-events: none;
`;

const ProductInfo = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  line-height: 1.6;
`;

const ProductName = styled.div`
  font-weight: 300;
`;

const ProductPrice = styled.div<{disabled: boolean}>`
  font-weight: 400;
  color: ${props => props.disabled ? props.theme.colors.outOfStock : props.theme.colors.text};
`;

const AddToCartBtn = styled.button`
  position: absolute;
  right: 16px;
  bottom: -26px;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(94,206,123,0.15);
  padding: 0;
  svg {
    color: ${props => props.theme.colors.backgroundLight};
    width: 20px;
    height: 20px;
  }
`;

const ProductList = () => {
  const { category } = useParams();
  const currentCategory = category || 'all';
  const { toggle } = useCartUI();
  const { addToCart } = useCart();

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { category: currentCategory === 'all' ? null : currentCategory }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <CategoryTitle>{currentCategory}</CategoryTitle>
      <ProductGrid>
        {data?.products.map((product: any) => {
          const price = product.prices[0];
          const outOfStock = !product.inStock;
          return (
            <ProductCard
              data-testid={`product-${toKebabCase(product.name)}`}
              key={product.id}
              to={`/${currentCategory}/${product.id}`}
            >
              <ProductImageWrapper>
                <ProductImage src={product.gallery[0]} alt={product.name} />
                {outOfStock && <OutOfStockOverlay>OUT OF STOCK</OutOfStockOverlay>}
                {!outOfStock && (
                  <AddToCartBtn
                    className="add-to-cart-btn"
                    title="Add to cart"
                    data-testid='add-to-cart'
                    onClick={e => {
                      e.preventDefault();
                      const attributes: Record<string, string> = {};
                      if (product.attributes) {
                        product.attributes.forEach((attr: any) => {
                          if (attr.items && attr.items.length > 0) {
                            attributes[attr.name] = attr.items[0].value;
                          }
                        });
                      }
                      
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: price.amount,
                        quantity: 1,
                        attributes,
                        image: product.gallery?.[0]
                      });
                      toggle();
                    }}
                  >
                    <CartIcon />
                  </AddToCartBtn>
                )}
              </ProductImageWrapper>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice disabled={outOfStock}>
                  {price.currency.symbol}{price.amount.toFixed(2)}
                </ProductPrice>
              </ProductInfo>
            </ProductCard>
          );
        })}
      </ProductGrid>
    </>
  );
};

export default ProductList;
