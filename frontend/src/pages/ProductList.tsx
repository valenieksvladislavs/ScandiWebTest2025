import { useQuery, gql } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';

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

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
`;

const ProductCard = styled(Link)`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: relative;
  &:hover {
    transform: translateY(-4px);
    .add-to-cart-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductName = styled.h2`
  margin: 1rem 0;
  font-size: 1.2rem;
  color: #333;
`;

const ProductBrand = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.p`
  font-weight: 600;
  color: #333;
  margin: 0.5rem 0;
`;

const OutOfStock = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 4px;
  font-weight: 600;
  color: #333;
`;

const AddToCartBtn = styled.button`
  position: absolute;
  right: 24px;
  bottom: 24px;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 2;
  svg {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
`;

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const { addToCart } = useCart();

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { category }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ProductGrid>
      {data?.products.map((product: any) => {
        const price = product.prices[0];
        return (
          <ProductCard key={product.id} to={`/product/${product.id}`}>
            <div style={{ position: 'relative' }}>
              <ProductImage src={product.gallery[0]} alt={product.name} />
              {!product.inStock && <OutOfStock>OUT OF STOCK</OutOfStock>}
              {product.inStock && (
                <AddToCartBtn
                  className="add-to-cart-btn"
                  title="Add to card"
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: price.amount,
                      quantity: 1,
                      attributes: {},
                      image: product.gallery?.[0]
                    })
                  }}
                >
                  <CartIcon color='#fff' />
                </AddToCartBtn>
              )}
            </div>
            <ProductName>{product.name}</ProductName>
            <ProductBrand>{product.brand}</ProductBrand>
            {product.prices.map((price: any) => (
              <ProductPrice key={price.currency.label}>
                {price.currency.symbol}{price.amount}
              </ProductPrice>
            ))}
          </ProductCard>
        );
      })}
    </ProductGrid>
  );
};

export default ProductList;
