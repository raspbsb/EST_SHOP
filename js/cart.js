import { readCart, updateCartCount, addToCart } from "./utils/common.js";

// 장바구니 페이지 상품 목록 출력

// 클래스명 cart-list의 내용의 뒤에 태그 생성
// 로컬스토리지에서 상품의 내용을 가져와서 상품 카드 생성

const localCart = readCart();
const cartList = document.querySelector(".cart-list");
console.log(readCart());

const productHTML = localCart.map(
  p => `
  <article class="cart-item">
    <span class="item-check"><span class="check-box" aria-hidden="true"></span></span>
    <div class="cart-thumb">
      <img
        src="${p.thumb}"
        alt="${p.title}"
      />
    </div>
    <div class="cart-item-info">
      <h2>${p.title}</h2>
      <p>${p.brand} | 블랙</p>
      <strong>${p.price} $</strong>
    </div>
    <div class="quantity-box" aria-label="수량">
      <button type="button" aria-label="수량 줄이기">-</button>
      <input id="quantity${p.id}" type="text" value="${p.qty}" aria-label="수량" />
      <button type="button" aria-label="수량 늘리기">+</button>
    </div>
    <button
      type="button"
      class="remove-item"
      aria-label="${p.title} 삭제"
    ></button>
  </article>
    `,
);
cartList.innerHTML = productHTML.join("");

// 장바구니 수 업데이트
updateCartCount();
