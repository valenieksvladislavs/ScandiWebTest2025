import React from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import { useQuery, gql, useMutation } from '@apollo/client';
import AddIcon from '../assets/images/add.svg?react';
import RemoveIcon from '../assets/images/remove.svg?react';
import { toKebabCase } from '../helpers/to-kebab-case';

const ModalOverlay = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.sizes.headerHeight};
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  justify-content: center;
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.rootMaxWidth};
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  background: ${props => props.theme.colors.backgroundLight};
  max-width: 325px;
  max-height: 100%;
  overflow-y: auto;
  padding: 32px 16px;
  margin: 0;
`;

const CartTitle = styled.h3`
  font-size: 16px;
  line-height: 1.6;
  span {
    font-weight: 500;
    color: ${props => props.theme.colors.text};
    font-size: 1rem;
  }
`;

const CartList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 40px;
  list-style: none;
  padding: 0;
`;

const CartItemRow = styled.li<{ $invalid?: boolean }>`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  line-height: 1.6;
`;

const ItemPrice = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
`;

const AttributeLabel = styled.span`
  display: block;
  font-size: 14px;
  line-height: 16px;
  padding: 8px 0;
  font-weight: 500;
`;

const AttributeItemGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const AttributeItem = styled.div<{ active?: boolean }>`
  display: inline-block;
  text-align: center;
  line-height: 1;
  padding: 4px;
  border: 1px solid ${props => props.theme.colors.text};
  background: ${({ active, theme }) => (active ? theme.colors.text : theme.colors.backgroundLight)};
  color: ${({ active, theme }) => (active ? theme.colors.backgroundLight : theme.colors.text)};
  font-weight: 500;
  font-size: 14px;
  cursor: default;
`;

const ColorBtn = styled.div<{ color: string; active?: boolean }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${({ color }) => color};
  outline: ${({ active, theme }) => (active ? `1px solid ${theme.colors.primary}` : 'none')};
  outline-offset: 1px;
`;

const QuantityControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  gap: 8px;
  justify-content: space-between;
`;

const QtyBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid ${props => props.theme.colors.text};
  border-radius: 0;
  background: ${props => props.theme.colors.backgroundLight};
  cursor: pointer;
  padding: 0;
`;

const ItemImage = styled.img`
  width: 120px;
  object-fit: contain;
`;

const Empty = styled.div`
  color: ${props => props.theme.colors.cardText};
  text-align: center;
  padding: 32px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 16px;
`;

const TotalHeader = styled.span`
  line-height: 18px;
  font-weight: 500;
`;

const TotalValue = styled.span`
  line-height: 1.6;
  font-weight: 700;
`;

const PlaceOrderBtn = styled.button`
  width: 100%;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.backgroundLight};
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  padding: 13px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      attributes {
        name
        type
        items {
          displayValue
          value
        }
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($items: [OrderItemInput!]!) {
    createOrder(items: $items)
  }
`;

interface CartModalProps {
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { items, addToCart, removeFromCart, clearCart } = useCart();
  const { data: productsData } = useQuery(GET_PRODUCTS);
  const [createOrder, { loading: orderLoading }] = useMutation(CREATE_ORDER);

  const getProductById = (id: string) =>
    productsData?.products.find((p: any) => p.id === id);

  const handleInc = (item: CartItem) => {
    addToCart({ ...item, quantity: 1 });
  };
  const handleDec = (item: CartItem) => {
    if (item.quantity > 1) {
      addToCart({ ...item, quantity: -1 });
    } else {
      removeFromCart(item.id);
    }
  };

  const renderAttributes = (item: CartItem) => {
    const product = getProductById(item.id);
    if (!product) return null;
    return product.attributes.map((attr: any) => (
      <div key={attr.name}>
        <AttributeLabel>{attr.name}:</AttributeLabel>
        <AttributeItemGroup data-testid={`cart-item-attribute-${toKebabCase(attr.name)}`}>
          {attr.items.map((option: any) => {
            const selected = item.attributes[attr.name] === option.value;
            const testIdAttr = `cart-item-attribute-${toKebabCase(attr.name)}-${option.value}${selected ? '-selected' : ''}`;

            return attr.type === 'swatch' ? (
              <ColorBtn
                key={option.value}
                color={option.value}
                active={selected}
                title={option.value}
                data-testid={testIdAttr}
              />
            ) : (
              <AttributeItem
                key={option.value}
                active={selected}
                data-testid={testIdAttr}
              >
                {option.displayValue}
              </AttributeItem>
            );
          })}
        </AttributeItemGroup>
      </div>
    ));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Check: are all required attributes selected for all items
  const allAttributesSelected = items.every(item => {
    const product = getProductById(item.id);
    if (!product || !product.attributes) return true;
    return product.attributes.every((attr: any) => item.attributes && item.attributes[attr.name]);
  });

  // For each item: true if not all attributes are selected
  const invalidItems = items.map(item => {
    const product = getProductById(item.id);
    if (!product || !product.attributes) return false;
    return !product.attributes.every((attr: any) => item.attributes && item.attributes[attr.name]);
  });

  const handlePlaceOrder = async () => {
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        attributes: JSON.stringify(item.attributes)
      }));
      const res = await createOrder({ variables: { items: orderItems } });
      if (res.data.createOrder) {
        clearCart();
        alert('Order successfully created!');
        onClose();
      } else {
        alert('Something went wrong');
      }
    } catch (e) {
      alert('Something went wrong');
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer>
        <ModalContent onClick={e => e.stopPropagation()} data-testid="cart-overlay">
          <CartTitle>My Bag,<span> {totalCount} items</span></CartTitle>
          {items.length === 0 ? (
            <Empty>Cart is empty</Empty>
          ) : (
            <CartList>
              {items.map((item, idx) => (
                <CartItemRow key={item.id} $invalid={invalidItems[idx]}>
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                    {renderAttributes(item)}
                  </ItemInfo>
                  <QuantityControls>
                    <QtyBtn onClick={() => handleInc(item)} data-testid='cart-item-amount-increase'><AddIcon width={16} height={16} /></QtyBtn>
                    <span>{item.quantity}</span>
                    <QtyBtn onClick={() => handleDec(item)} data-testid='cart-item-amount-decrease'><RemoveIcon width={16} height={16} /></QtyBtn>
                  </QuantityControls>
                  <ItemImage src={item.image} alt={item.name} />
                </CartItemRow>
              ))}
            </CartList>
          )}
          <TotalRow>
            <TotalHeader>Total</TotalHeader>
            <TotalValue>${total.toFixed(2)}</TotalValue>
          </TotalRow>
          <PlaceOrderBtn onClick={handlePlaceOrder} disabled={orderLoading || items.length === 0 || !allAttributesSelected}>
            {orderLoading ? 'Ordering...' : 'PLACE ORDER'}
          </PlaceOrderBtn>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CartModal;
