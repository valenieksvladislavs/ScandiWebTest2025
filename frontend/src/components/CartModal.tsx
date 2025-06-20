import React from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import { useQuery, gql } from '@apollo/client';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
`;

const ModalContent = styled.div`
  background: #fff;
  margin: 24px 24px 0 0;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  min-width: 340px;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px 24px 16px 24px;
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

const CartItemRow = styled.li`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 0;
  border-bottom: 1px solid #eee;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1d1f22;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  color: #1d1f22;
  font-weight: 700;
  margin-bottom: 8px;
`;

const AttributeRow = styled.div`
  margin: 4px 0 8px 0;
  font-size: 0.95em;
  display: flex;
  align-items: center;
`;

const AttributeLabel = styled.span`
  margin-right: 8px;
  font-weight: 500;
`;

const AttributeBtnGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const AttributeBtn = styled.button<{ active?: boolean }>`
  min-width: 32px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid #1d1f22;
  background: ${({ active }) => (active ? '#1d1f22' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#1d1f22')};
  font-weight: 500;
  font-size: 1em;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s;
`;

const ColorBtn = styled.button<{ color: string; active?: boolean }>`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ active, color }) => (active ? '#5ece7b' : color === '#fff' ? '#ccc' : '#eee')};
  background: ${({ color }) => color};
  cursor: pointer;
  border-radius: 2px;
  margin-right: 4px;
  outline: ${({ active }) => (active ? '2px solid #5ece7b' : 'none')};
`;

const QuantityControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;

const QtyBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #1d1f22;
  background: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 2px;
  font-weight: 500;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #d00;
  font-size: 1.2rem;
  cursor: pointer;
`;

const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
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
  transition: background 0.2s;
  &:hover {
    background: #4dbd6a;
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

interface CartModalProps {
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { items, addToCart, removeFromCart, updateAttributes } = useCart();
  const { data: productsData } = useQuery(GET_PRODUCTS);

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
      </AttributeRow>
    ));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CartTitle>My Bag,<span> {totalCount} items</span></CartTitle>
        {items.length === 0 ? (
          <Empty>Корзина пуста</Empty>
        ) : (
          <CartList>
            {items.map(item => (
              <CartItemRow key={item.id}>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                  {renderAttributes(item)}
                </ItemInfo>
                <QuantityControls>
                  <QtyBtn onClick={() => handleInc(item)}>+</QtyBtn>
                  <span>{item.quantity}</span>
                  <QtyBtn onClick={() => handleDec(item)}>-</QtyBtn>
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
        <PlaceOrderBtn>PLACE ORDER</PlaceOrderBtn>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CartModal; 