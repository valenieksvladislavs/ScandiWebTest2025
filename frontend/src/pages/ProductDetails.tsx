import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useRef, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/images/cart.svg?react';
import ArrowLeft from '../assets/images/arrow-left.svg?react';
import ArrowRight from '../assets/images/arrow-right.svg?react';
import { toKebabCase } from '../helpers/to-kebab-case';
import { useCartUI } from '../context/CartUIContext';
import parse from 'html-react-parser';
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

const PageContainer = styled.div`
  display: flex;
  gap: 40px;
  margin: 40px auto 0 auto;
  align-items: flex-start;
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Gallery = styled.div`
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 26px;
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
  border: 2px solid ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.theme.colors.buttonLight};
`;

const MainImageWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
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
  width: 400px;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const ProductName = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
`;

const AttributeBlock = styled.div`
  margin-bottom: 16px;
`;

const AttributeLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const AttributeBtnGroup = styled.div`
  margin: 0 -4px;
`;

const AttributeBtn = styled.button<{ active?: boolean }>`
  min-width: 48px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid ${props => props.theme.colors.text};
  background: ${({ active, theme }) => (active ? theme.colors.text : theme.colors.backgroundLight)};
  color: ${({ active, theme }) => (active ? theme.colors.backgroundLight : theme.colors.text)};
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
  border: 2px solid ${({ active, color, theme }) => (active ? theme.colors.primary : color === theme.colors.backgroundLight ? '#ccc' : '#eee')};
  background: ${({ color }) => color};
  cursor: pointer;
  border-radius: 0;
  margin-right: 8px;
  outline: ${({ active, theme }) => (active ? `2px solid ${theme.colors.primary}` : 'none')};
  padding: 0;
`;

const PriceLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 24px;
`;

const AddToCartButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.backgroundLight};
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
    background: ${props => props.theme.colors.primaryHover};
  }
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
  svg {
    width: 24px;
    height: 24px;
    fill: ${props => props.theme.colors.backgroundLight};
  }
`;

const Description = styled.div`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  margin-top: 8px;
  line-height: 1.5;
`;

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { toggle } = useCartUI();

  const mainImageRef = useRef<HTMLDivElement>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number>(0);

  const updateHeight = () => {
    if (mainImageRef.current) {
      setMainImageHeight(mainImageRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
    <PageContainer>
      <Gallery data-testid='product-gallery'>
        <Thumbnails style={{ maxHeight: mainImageHeight || undefined, overflowY: 'auto' }}>
          {gallery.map((image: string, index: number) => (
            <Thumbnail
              key={index}
              src={image}
              active={index === selectedImage}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </Thumbnails>
        <MainImageWrapper ref={mainImageRef}>
          <MainImage src={gallery[selectedImage]} alt={product?.name} onLoad={updateHeight} />
          {gallery.length > 1 && (
            <>
              <ArrowLeftBtn onClick={handlePrev} style={{ left: 12 }}><ArrowLeft /></ArrowLeftBtn>
              <ArrowRightBtn onClick={handleNext} style={{ right: 12 }}><ArrowRight /></ArrowRightBtn>
            </>
          )}
        </MainImageWrapper>
      </Gallery>
      <InfoCol>
        <ProductName>{product?.name}</ProductName>
        {product?.attributes.map((attribute: any) => (
          <AttributeBlock key={attribute.name}>
            <AttributeLabel>{attribute.name}:</AttributeLabel>
            <AttributeBtnGroup data-testid={`product-attribute-${toKebabCase(attribute.name)}`}>
              {attribute.items.map((item: any) => {
                const testId = `product-attribute-${toKebabCase(attribute.name)}-${item.value}`;
                const onClick = () => {
                  handleAttributeSelect(attribute.name, item.value);
                }

                return attribute.type === 'swatch' ? (
                  <ColorBtn
                    data-testid={testId}
                    key={item.value}
                    color={item.value}
                    active={selectedAttributes[attribute.name] === item.value}
                    onClick={onClick}
                  />
                ) : (
                  <AttributeBtn
                    data-testid={testId}
                    key={item.value}
                    active={selectedAttributes[attribute.name] === item.value}
                    onClick={onClick}
                  >
                    {item.displayValue}
                  </AttributeBtn>
                )
              })}
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
          data-testid='add-to-cart'
          disabled={!product?.inStock || !isAllAttributesSelected}
          onClick={() => {
            toggle();
            product && price && addToCart({
              id: product.id,
              name: product.name,
              price: price.amount,
              quantity: 1,
              attributes: selectedAttributes,
              image: product.gallery?.[0]
            });
          }}
        >
          <CartIcon />
          {!product?.inStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </AddToCartButton>
        <Description data-testid='product-description'>
          {parse(product?.description || '')}
        </Description>
      </InfoCol>
    </PageContainer>
  );
};

export default ProductDetails;
