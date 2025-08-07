import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useRef, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
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
  margin: 60px auto 0 auto;
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
  gap: 40px;
`;

const Thumbnails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Thumbnail = styled.img<{ checked?: boolean }>`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid ${({ checked, theme }) => (checked ? theme.colors.primary : 'transparent')};
  cursor: pointer;
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
  background: rgba(0,0,0,0.73);
  border: none;
  width: 32px;
  height: 32px;
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
  left: 16px;
`;
const ArrowRightBtn = styled(ArrowBtn)`
  right: 16px;
`;

const InfoCol = styled.div`
  display: flex;
  width: 300px;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const ProductName = styled.h1`
  font-size: 30px;
  line-height: 27px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 32px;
`;

const AttributeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 33px;
  margin-bottom: 27px;
`;

const AttributeRow = styled.div`
`;

const AttributeLabel = styled.div`
  color: ${props => props.theme.colors.text};
  font-family: "Roboto Condensed";
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const AttributeBtnGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const AttributeBtn = styled.button<{ checked?: boolean }>`
  border: 1px solid ${props => props.theme.colors.text};
  background: ${({ checked, theme }) => (checked ? theme.colors.text : theme.colors.backgroundLight)};
  color: ${({ checked, theme }) => (checked ? theme.colors.backgroundLight : theme.colors.text)};
  font-family: "Source Sans 3";
  min-width: 60px;
  padding: 12.5px 16px;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.15s;
`;

const ColorBtn = styled.button<{ color: string; checked?: boolean }>`
  width: 32px;
  height: 32px;
  background: ${({ color }) => color};
  cursor: pointer;
  border-radius: 0;
  outline: ${({ checked, theme }) => (checked ? `1px solid ${theme.colors.primary}` : 'none')}!important;
  outline-offset: 1px;
  padding: 0;
`;

const PriceLabel = styled.div`
  color: ${props => props.theme.colors.text};
  font-family: "Roboto Condensed";
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const Price = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 24px;
  font-weight: 700;
  line-height: 18px;
  padding: 14px 0;
  margin-bottom: 20px;
`;

const AddToCartButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.backgroundLight};
  border: none;
  padding: 16px;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 40px;
  border-radius: 0;
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const Description = styled.div`
  color: ${props => props.theme.colors.text};
  font-family: Roboto;
  font-size: 16px;
  line-height: 1.6;
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
              checked={index === selectedImage}
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
        <AttributeContainer>
          {product?.attributes.map((attribute: any) => (
            <AttributeRow key={attribute.name}>
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
                      checked={selectedAttributes[attribute.name] === item.value}
                      onClick={onClick}
                    />
                  ) : (
                    <AttributeBtn
                      data-testid={testId}
                      key={item.value}
                      checked={selectedAttributes[attribute.name] === item.value}
                      onClick={onClick}
                    >
                      {item.displayValue}
                    </AttributeBtn>
                  )
                })}
              </AttributeBtnGroup>
            </AttributeRow>
          ))}
        </AttributeContainer>
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
