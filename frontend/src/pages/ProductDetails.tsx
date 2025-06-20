import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';

const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      brand
      inStock
      description
      gallery
      category
      attributes {
        name
        type
        items {
          displayValue
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

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem 0;
`;

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1rem;
`;

const Thumbnails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Thumbnail = styled.img<{ active?: boolean }>`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: ${props => props.active ? '2px solid #5ece7b' : '1px solid #ddd'};
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #5ece7b;
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const ProductBrand = styled.p`
  font-size: 1.5rem;
  color: #666;
  margin: 0;
`;

const AttributeSet = styled.div`
  margin: 1rem 0;
`;

const AttributeName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const AttributeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const AttributeOption = styled.button<{ selected?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  background: ${props => props.selected ? '#333' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
    color: white;
  }
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0;
`;

const AddToCartButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  &:hover {
    background: #4dbd6a;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  svg {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const { addToCart } = useCart();

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const product = data?.product;
  const price = product?.prices[0];

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev: Record<string, string>) => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const isAllAttributesSelected = product?.attributes.every(
    (attr: any) => selectedAttributes[attr.name]
  );

  return (
    <ProductContainer>
      <GalleryContainer>
        <Thumbnails>
          {product?.gallery.map((image: string, index: number) => (
            <Thumbnail
              key={index}
              src={image}
              active={index === selectedImage}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </Thumbnails>
        <MainImage src={product?.gallery[selectedImage]} alt={product?.name} />
      </GalleryContainer>

      <ProductInfo>
        <ProductName>{product?.name}</ProductName>
        <ProductBrand>{product?.brand}</ProductBrand>

        {product?.attributes.map((attribute: any) => (
          <AttributeSet key={attribute.name}>
            <AttributeName>{attribute.name}</AttributeName>
            <AttributeOptions>
              {attribute.items.map((item: any) => (
                <AttributeOption
                  key={item.value}
                  selected={selectedAttributes[attribute.name] === item.value}
                  onClick={() => handleAttributeSelect(attribute.name, item.value)}
                >
                  {item.displayValue}
                </AttributeOption>
              ))}
            </AttributeOptions>
          </AttributeSet>
        ))}

        <Price>
          {product?.prices.map((price: any) => (
            <div key={price.currency.label}>
              {price.currency.symbol}{price.amount}
            </div>
          ))}
        </Price>

        <AddToCartButton
          disabled={!product?.inStock || !isAllAttributesSelected}
          onClick={() => product && price && addToCart({
            id: product.id,
            name: product.name,
            price: price.amount,
            quantity: 1,
            attributes: selectedAttributes,
            image: product.gallery?.[0]
          })}
        >
          <CartIcon />
          {!product?.inStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </AddToCartButton>

        <div dangerouslySetInnerHTML={{ __html: product?.description || '' }} />
      </ProductInfo>
    </ProductContainer>
  );
};

export default ProductDetails;
