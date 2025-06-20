import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import ArrowLeft from '../assets/images/arrow-left.svg?react';
import ArrowRight from '../assets/images/arrow-right.svg?react';

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

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 40px auto 0 auto;
`;

const Thumbnails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Thumbnail = styled.img<{ active?: boolean }>`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 2px solid ${({ active }) => (active ? '#5ece7b' : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  background: #f9f9f9;
`;

const MainImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.8);
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 0;
  svg {
    width: 18px;
    height: 18px;
    stroke: #fff;
  }
`;

const ArrowLeftBtn = styled(ArrowBtn)`
  left: 12px;
`;
const ArrowRightBtn = styled(ArrowBtn)`
  right: 12px;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #1d1f22;
  margin: 0 0 16px 0;
`;

const AttributeBlock = styled.div`
  margin-bottom: 16px;
`;

const AttributeLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1d1f22;
  margin-bottom: 8px;
`;

const AttributeBtnGroup = styled.div`
  margin: 0 -4px;
`;

const AttributeBtn = styled.button<{ active?: boolean }>`
  min-width: 48px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #1d1f22;
  background: ${({ active }) => (active ? '#1d1f22' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#1d1f22')};
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.15s;
  margin: 4px;
`;

const ColorBtn = styled.button<{ color: string; active?: boolean }>`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ active, color }) => (active ? '#5ece7b' : color === '#fff' ? '#ccc' : '#eee')};
  background: ${({ color }) => color};
  cursor: pointer;
  border-radius: 0;
  margin-right: 8px;
  outline: ${({ active }) => (active ? '2px solid #5ece7b' : 'none')};
  padding: 0;
`;

const PriceLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1d1f22;
  margin-bottom: 8px;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1f22;
  margin-bottom: 24px;
`;

const AddToCartButton = styled.button`
  background: #5ece7b;
  color: white;
  border: none;
  padding: 18px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 24px;
  border-radius: 0;
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

const Description = styled.div`
  font-size: 1rem;
  color: #1d1f22;
  margin-top: 8px;
  line-height: 1.5;
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
  const gallery = product?.gallery || [];

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev: Record<string, string>) => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const isAllAttributesSelected = product?.attributes.every(
    (attr: any) => selectedAttributes[attr.name]
  );

  const handlePrev = () => {
    setSelectedImage((prev) => (prev - 1 + gallery.length) % gallery.length);
  };
  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % gallery.length);
  };

  return (
    <PageGrid>
      <Thumbnails>
        {gallery.map((image: string, index: number) => (
          <Thumbnail
            key={index}
            src={image}
            active={index === selectedImage}
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </Thumbnails>
      <MainImageWrapper>
        <MainImage src={gallery[selectedImage]} alt={product?.name} />
        {gallery.length > 1 && (
          <>
            <ArrowLeftBtn onClick={handlePrev} style={{ left: 12 }}><ArrowLeft /></ArrowLeftBtn>
            <ArrowRightBtn onClick={handleNext} style={{ right: 12 }}><ArrowRight /></ArrowRightBtn>
          </>
        )}
      </MainImageWrapper>
      <InfoCol>
        <ProductName>{product?.name}</ProductName>
        {product?.attributes.map((attribute: any) => (
          <AttributeBlock key={attribute.name}>
            <AttributeLabel>{attribute.name}:</AttributeLabel>
            <AttributeBtnGroup>
              {attribute.items.map((item: any) =>
                attribute.type === 'swatch' ? (
                  <ColorBtn
                    key={item.value}
                    color={item.value}
                    active={selectedAttributes[attribute.name] === item.value}
                    onClick={() => handleAttributeSelect(attribute.name, item.value)}
                  />
                ) : (
                  <AttributeBtn
                    key={item.value}
                    active={selectedAttributes[attribute.name] === item.value}
                    onClick={() => handleAttributeSelect(attribute.name, item.value)}
                  >
                    {item.displayValue}
                  </AttributeBtn>
                )
              )}
            </AttributeBtnGroup>
          </AttributeBlock>
        ))}
        <div>
          <PriceLabel>PRICE:</PriceLabel>
          <Price>
            {price?.currency.symbol}{price?.amount.toFixed(2)}
          </Price>
        </div>
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
        <Description dangerouslySetInnerHTML={{ __html: product?.description || '' }} />
      </InfoCol>
    </PageGrid>
  );
};

export default ProductDetails;
