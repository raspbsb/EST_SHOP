import { readCart, writeCart, updateCartCount, addToCart } from "./utils/common.js";

const cartList = document.querySelector(".cart-list");
const cartCountText = document.querySelector(".cart-count-text");
const selectAll = document.querySelector(".select-all");
const selectAllText = selectAll.querySelector("span");
const selectDeleteBtn = document.querySelector(".cart-list-header button");
const productAmount = document.querySelector(".order-row strong");
const totalAmount = document.querySelector(".order-total strong");

let cart = readCart();
let cartHTML = [];
let selectedIds = new Set();

// 장바구니 수 업데이트
updateCartCount();

// 상품 개수 텍스트
function updateCartCountFx() {
  cartCountText.textContent = `총 ${cart.length}개의 상품`;
}
updateCartCountFx();

// 상품금액, 결제금액 업데이트

function updateTotalAmount() {
  // cart 배열에 대해 : 초기값 0부터, cur(현재 인덱스)의 qty와 price를 곱한 것(cur.qty * cur.price)을, 배열을 넘어가며 acc에 더함(acc +)
  const sum = cart.reduce((acc, cur) => acc + cur.qty * cur.price, 0).toFixed(2);
  console.log(`가격 총합 = ${sum}`);

  productAmount.textContent = `$ ${sum}`;
  totalAmount.textContent = `$ ${sum}`;
}
updateTotalAmount();

// 이벤트(수량변경, 삭제버튼)
cartList.addEventListener("click", e => {
  const cartItem = e.target.closest(".cart-item");
  // 리스트를 눌렀는데 대상 위치에 상품이 없으면 취소
  if (!cartItem) return;
  console.log(cartItem);

  const id = Number(cartItem.dataset.id);
  console.log(`id = ${id}`);

  const targetItem = cart.find(item => item.id === id);
  console.log(targetItem);

  // 누른게 마이너스버튼이고 대상의 수량이 2이상이면 감소
  if (e.target.closest(".minusBtn")) {
    if (targetItem.qty > 1) {
      targetItem.qty--;
      console.log(`qty = ${targetItem.qty}`);
      // 로컬스토리지 저장
      saveCart();

      // 화면에 상품 생성
      renderCart();
    }
    return;
  }

  // 누른게 플러스버튼이면 증가
  if (e.target.closest(".plusBtn")) {
    targetItem.qty++;
    // 로컬스토리지 저장
    saveCart();

    // 화면 코드 생성
    renderCart();
    return;
  }

  // 누른게 삭제버튼이면 이 상품만 삭제
  if (e.target.closest(".remove-item")) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    return;
  }
});

// 이벤트 (체크시)
cartList.addEventListener("change", e => {
  if (e.target.matches(".cart-item .item-check input")) {
    updateSelectState();
  }
});

function updateSelectState() {
  const checkboxes = [...cartList.querySelectorAll(".cart-item .item-check input")];
  const checkedCount = checkboxes.filter(checkbox => checkbox.checked).length;
  console.log(checkedCount);
  selectAllText.textContent = `전체선택 (${checkedCount}/${checkboxes.length})`;
  console.log(checkboxes.length);
  // 모두 체크시 전체선택부분 체크
  selectAll.querySelector("input").checked = checkedCount > 0 && checkedCount === checkboxes.length;
  selectedIds = new Set(getCheckedIds());
}

function renderCart() {
  // 기존 항목을 모두 제거
  cartList.querySelectorAll(".cart-item").forEach(el => {
    el.remove();
  });
  cartHTML = [];

  console.log(cart);
  // 클래스명 cart-list의 내용의 뒤에 태그 생성
  // 로컬스토리지에서 상품의 내용을 가져와서 상품 카드 생성

  // 장바구니 페이지 상품 목록 출력, 담긴 상품 없으면 "장바구니가 비어있습니다." 출력
  if (cart.length === 0) {
    cartHTML.push(`
    <article class="cart-empty">
      장바구니가 비어있습니다.
    </article>`);
  } else {
    cartHTML = cart.map(
      p =>
        `
      <article class="cart-item" data-id="${p.id}">
        <label class="item-check">
          <input type="checkbox" ${selectedIds.has(p.id) ? "checked" : ""}/>
        </label>

        <div class="cart-thumb">
          <img
            src="${p.thumb}"
            alt="${p.title}"
          />
        </div>

        <div class="cart-item-info">
          <h2><a href="detail.html?id=${p.id}">${p.title}</a></h2>
          <p>${p.brand} | 블랙</p>
          <strong>$ ${p.price}</strong>
        </div>

        <div class="quantity-box" aria-label="수량">
          <button class="minusBtn" type="button" aria-label="수량 줄이기">-</button>
          <span>${p.qty}</span>
<!--          <input type="text" value="${p.qty}" aria-label="수량" /> -->
          <button class="plusBtn" type="button" aria-label="수량 늘리기">+</button>
        </div>

        <button
          type="button"
          class="remove-item"
          aria-label="${p.title} 삭제"
        ></button>
      </article>
    `,
    );
  }

  // cartList.innerHTML = cartHTML.join("");
  cartList.insertAdjacentHTML("beforeend", cartHTML.join(""));

  updateSelectState();
}

renderCart();

function saveCart() {
  writeCart(cart);
  updateCartCount();
  updateTotalAmount();
  updateCartCountFx();
}

saveCart();

//선택 삭제
selectDeleteBtn.addEventListener("click", () => {
  // 체크된 상품 id를 파악
  const checkedIds = getCheckedIds();
  console.log(checkedIds);
  if (checkedIds.length === 0) return;
  // cart배열에서 id와 일치하는 요소를 제외
  cart = cart.filter(item => !checkedIds.includes(item.id));

  selectedIds = checkedIds;
  // saveCart 실행
  saveCart();
  // renderCart 실행
  renderCart();
});

function getCheckBoxes() {
  return [...cartList.querySelectorAll(".cart-item .item-check input")];
}

selectAll.querySelector("input").addEventListener("change", e => {
  const checkboxes = getCheckBoxes();
  if (e.target.checked) {
    checkboxes.forEach(checkbox => (checkbox.checked = true));
  } else {
    checkboxes.forEach(checkbox => (checkbox.checked = false));
  }
  updateSelectState();
});

function getCheckedIds() {
  const checkboxes = getCheckBoxes();
  return checkboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => Number(checkbox.closest(".cart-item").dataset.id));
  console.log(checkedIds);
}
