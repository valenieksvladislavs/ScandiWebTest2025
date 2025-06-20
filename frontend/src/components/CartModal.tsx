import React from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import { useQuery, gql, useMutation } from '@apollo/client';
import AddIcon from '../assets/images/add.svg?react';
import RemoveIcon from '../assets/images/remove.svg?react';

const HEADER_HEIGHT = 80;
const CONTAINER_WIDTH = 1200;

const ModalOverlay = styled.div`
  position: fixed;
  top: ${HEADER_HEIGHT}px;
  left: 0;
  width: 100vw;
  height: calc(100vh - ${HEADER_HEIGHT}px);
  background: rgba(0,0,0,0.2);
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: fixed;
  top: ${HEADER_HEIGHT}px;
  right: calc((100vw - ${CONTAINER_WIDTH}px) / 2);
  background: #fff;
  min-width: 340px;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px 24px 16px 24px;
  margin: 0;
`;

const CartTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 700;
  span {
    font-weight: 400;
    color: #1d1f22;
    font-size: 1rem;
    margin-left: 4px;
  }
`;

const CartList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const CartItemRow = styled.li<{ $invalid?: boolean }>`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 0;
  border-bottom: 1px solid #eee;
  background: ${({ $invalid }) => $invalid ? 'rgba(255, 0, 0, 0.06)' : 'transparent'};
  border-left: ${({ $invalid }) => $invalid ? '3px solid #d00' : 'none'};
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.div`
  font-size: 1.2rem;
  color: #1d1f22;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  color: #1d1f22;
  font-weight: 600;
  margin-bottom: 1.2rem;
`;

const AttributeRow = styled.div`
  margin: 4px 0 8px 0;
  font-size: 0.95em;
`;

const AttributeLabel = styled.span`
  margin-right: 8px;
  font-weight: 500;
`;

const AttributeBtnGroup = styled.div`
  margin: 0 -4px;
`;

const AttributeBtn = styled.button<{ active?: boolean }>`
  min-width: 32px;
  min-height: 32px;
  margin: 4px;
  padding: 0 10px;
  border: 1px solid #1d1f22;
  background: ${({ active }) => (active ? '#1d1f22' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#1d1f22')};
  font-weight: 500;
  font-size: 1em;
  border-radius: 0;
  transition: all 0.15s;
`;

const ColorBtn = styled.button<{ color: string; active?: boolean }>`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ active, color }) => (active ? '#5ece7b' : color === '#fff' ? '#ccc' : '#eee')};
  background: ${({ color }) => color};
  border-radius: 0;
  margin: 4px;
  outline: ${({ active }) => (active ? '2px solid #5ece7b' : 'none')};
  padding: 0;
`;

const QuantityControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const QtyBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid #1d1f22;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  padding: 0;
`;

const ItemImage = styled.img`
  width: 120px;
  object-fit: contain;
`;

const Empty = styled.div`
  color: #888;
  text-align: center;
  padding: 32px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 24px 0 16px 0;
`;

const Warning = styled.div`
  color: #d00;
  font-size: 0.95em;
  margin-top: 6px;
`;

const DisabledHint = styled.div`
  color: #d00;
  font-size: 0.98em;
  margin-top: 8px;
  text-align: center;
`;

const PlaceOrderBtn = styled.button`
  width: 100%;
  background: #5ece7b;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 16px 0;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s, opacity 0.2s;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    background: #4dbd6a;
  }
`;

const AttributeWarning = styled.div`
  color: #d00;
  font-size: 0.95em;
  margin-top: 4px;
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
  const { items, addToCart, removeFromCart, updateAttributes, clearCart } = useCart();
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
    return product.attributes.map((attr: any) => {
      const isSelected = item.attributes && item.attributes[attr.name];
      return (
        <AttributeRow key={attr.name}>
          <AttributeLabel>{attr.name}:</AttributeLabel>
          <AttributeBtnGroup>
            {attr.items.map((option: any) =>
              attr.type === 'swatch' ? (
                <ColorBtn
                  key={option.value}
                  color={option.value}
                  active={item.attributes[attr.name] === option.value}
                  onClick={() => updateAttributes(item.id, { ...item.attributes, [attr.name]: option.value })}
                  title={option.value}
                />
              ) : (
                <AttributeBtn
                  key={option.value}
                  active={item.attributes[attr.name] === option.value}
                  onClick={() => updateAttributes(item.id, { ...item.attributes, [attr.name]: option.value })}
                >
                  {option.displayValue}
                </AttributeBtn>
              )
            )}
          </AttributeBtnGroup>
          {!isSelected && <AttributeWarning>Choose {attr.name.toLowerCase()}</AttributeWarning>}
        </AttributeRow>
      );
    });
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Проверка: у всех ли товаров выбраны все обязательные атрибуты
  const allAttributesSelected = items.every(item => {
    const product = getProductById(item.id);
    if (!product || !product.attributes) return true;
    return product.attributes.every((attr: any) => item.attributes && item.attributes[attr.name]);
  });

  // Для каждого товара: true если не все атрибуты выбраны
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
      <ModalContent onClick={e => e.stopPropagation()}>
        <CartTitle>My Bag,<span> {totalCount} items</span></CartTitle>
        {items.length === 0 ? (
          <Empty>Корзина пуста</Empty>
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
                  <QtyBtn onClick={() => handleInc(item)}><AddIcon /></QtyBtn>
                  <span>{item.quantity}</span>
                  <QtyBtn onClick={() => handleDec(item)}><RemoveIcon /></QtyBtn>
                </QuantityControls>
                <ItemImage src={item.image} alt={item.name} />
              </CartItemRow>
            ))}
          </CartList>
        )}
        <TotalRow>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </TotalRow>
        <PlaceOrderBtn onClick={handlePlaceOrder} disabled={orderLoading || items.length === 0 || !allAttributesSelected}>
          {orderLoading ? 'Ordering...' : 'PLACE ORDER'}
        </PlaceOrderBtn>
        {!allAttributesSelected && <DisabledHint>Choose all options</DisabledHint>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default CartModal;
