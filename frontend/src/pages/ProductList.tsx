import { useQuery, gql } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import { toKebabCase } from '../helpers/to-kebab-case';

const GET_PRODUCTS = gql`
  query GetProducts($category: String) {
    products(category: $category) {
      id
      name
      brand
      inStock
      gallery
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
  font-size: 2rem;
  font-weight: 400;
  margin: 32px 0 24px 0;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px 24px;
  padding: 0 0 2rem 0;
`;

const ProductCard = styled(Link)`
  background: ${props => props.theme.colors.backgroundLight};
  box-shadow: 0 2px 8px rgba(168, 172, 176, 0.19);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  padding: 20px;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(168, 172, 176, 0.25);
    transform: translateY(-2px);
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
  font-size: 1.5rem;
  color: ${props => props.theme.colors.outOfStock};
  font-weight: 400;
  z-index: 2;
  pointer-events: none;
`;

const ProductInfo = styled.div`
  padding: 16px 16px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductName = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  font-weight: 300;
  margin-bottom: 4px;
`;

const ProductPrice = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
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
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const { addToCart } = useCart();

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { category: category === 'All' ? null : category }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <CategoryTitle>{category}</CategoryTitle>
      <ProductGrid>
        {data?.products.map((product: any) => {
          const price = product.prices[0];
          const outOfStock = !product.inStock;
          return (
            <ProductCard data-testid={`product-${toKebabCase(product.name)}`} key={product.id} to={`/product/${product.id}?category=${category}`} style={{ opacity: outOfStock ? 0.5 : 1 }}>
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
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: price.amount,
                        quantity: 1,
                        attributes: {},
                        image: product.gallery?.[0]
                      });
                    }}
                  >
                    <CartIcon />
                  </AddToCartBtn>
                )}
              </ProductImageWrapper>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
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
