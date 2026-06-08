// 로컬스토리지에서 장바구니 읽기
export function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem("cart")) || [];
  } catch (error) {
    // 에러가 나면 콘솔에 메시지와 무슨 에러인지 출력
    console.error("장바구니 데이터를 읽는 중 오류 발생", error);
    return [];
  }
}

// 장바구니 총 상품 개수 구하기, 상품의 종류가 아닌 전체 개수 구하기
export function getCartCount() {
  const cart = readCart();
  // reduce : 0부터 시작해서 배열 요소 하나하나를 item으로, 누적값을 total로 받아서 각각 더한다.
  return cart.reduce((total, item) => total + item.qty, 0);
}

// 로컬스토리지에서 장바구니 쓰기
export function writeCart(cart) {
  window.localStorage.setItem("cart", JSON.stringify(cart));
}

// 헤더 상단 장바구니 개수 출력
export function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (!cartCount) return;
  cartCount.textContent = getCartCount();
}

// 장바구니 버튼 클릭시 장바구니 추가
export function addToCart(product, qty = 1) {
  // 매개변수 안들어오면 아무것도 안하게 막기 (가드)
  if (!product) return;
  const cart = readCart();

  // 기존 장바구니 확인하고, 이미 담긴 상품이면 그 상품의 수량을 올려주고, 아니라면 새 상품을 추가
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    // 그 상품의 수량을 증가
    existingItem.qty += qty;
  } else {
    // 장바구니 객체의 맨 뒤에 새 상품 추가, 수량1
    cart.push({
      id: product.id,
      title: product.title,
      brand: product.brand,
      thumb: product.thumbnail,
      price: product.price,
      qty: qty,
    });
  }
  writeCart(cart);
  updateCartCount();
}
