import { updateCartCount, addToCart } from "./utils/common.js";

let product = {};
export async function fetchProduct() {
  // console.log(location.href); // http://127.0.0.1:5500/detail.html?id=3
  // console.log(location.search); // id=3
  // params = ?
  let params = new URLSearchParams(location.search);

  // console.log(params); // URLSearchParams
  // console.log(params.get("id")); // 3

  // productID = ?
  const productID = params.get("id"); // 3

  if (!productID) {
    alert("잘못된 접근입니다. 홈으로 이동합니다.");
    location.href = "./index.html";
  }
  try {
    //
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("로딩에 실패했습니다.");
    const data = await res.json();

    // 조회된 상품정보에서 상품의 id가 productID와 일치하는 요소를 변수 product에 할당
    product = data.products.find(p => p.id === Number(productID));

    if (!product) {
      alert("존재하지 않는 상품입니다.");
      location.href = "./index.html";
    }

    // product를 매개변수로 createContent를 실행
    createContent(product);
    createRecommendLists(data.products, product.category, Number(productID));
  } catch (e) {
    console.log(e);
  } finally {
    console.log("상품 조회를 종료했습니다.");
    console.log(product);
  }
}

//
function createContent(data) {
  if (!data) return;

  //
  const mainImage = document.querySelector(".product-gallery .main-image img");
  const title = document.querySelector("#product-title");
  const category = document.querySelector(".product-summary .product-category");
  const desc = document.querySelector(".product-summary .product-description");
  const discountRate = document.querySelector(".product-summary .discount-rate");
  const salePrice = document.querySelector(".product-summary .sale-price");
  const originPrice = document.querySelector(".product-summary .origin-price");
  const details = document.querySelector("#product-info");

  // mainImage의 HTML 대체
  mainImage.setAttribute("src", data.images[0], "alt", data.title);
  category.textContent = `${data.category}`;
  title.textContent = `${data.title}`;
  desc.textContent = `${data.description}`;
  discountRate.textContent = `${data.discountPercentage}%`;
  salePrice.textContent = `${Math.round(data.price * (100 - data.discountPercentage)) / 100}$`;
  // salePrice.textContent = (data.price / (1 - data.discountPercentage / 100)).toFixed(2);
  originPrice.textContent = `${data.price}$`;
  details.textContent = data.description;
}

// 상품 상세 tab
const detailTabMenus = document.querySelector(".detail-tabs");
const detailTabContents = document.querySelector(".tab-contents");
// detailTabMenus를 클릭하면,
// 변수명 target에 클릭한 요소의 href 속성의 값을 할당
// detailTabContents의 모든 자식 요소에서 active 제거
// detailTabContents의 자식 중 id가 target과 같은 요소에 active 추가
detailTabMenus.addEventListener("click", e => {
  e.preventDefault();
  const menu = e.target.closest("a");
  if (!menu) return;
  const target = menu.getAttribute("href");

  console.log(target);
  console.log(e.target);

  detailTabMenus.querySelectorAll("a").forEach(i => {
    i.classList.remove("active");
  });
  menu.classList.add("active");

  detailTabContents.querySelectorAll("section").forEach(i => {
    i.classList.remove("active");
  });

  const targetContent = detailTabContents.querySelector(target);

  if (targetContent) {
    targetContent.classList.add("active");
  }
});

function createRecommendLists(all, catrgory, id) {
  // all에서 category와 일치하는 요소를 걸러서 변수명 recommendList 배열에 값을 할당
  // recommend-grid에 recommendList배열의 데이터를 article 형태로 생성
  const recommendList = all.filter(p => p.category === catrgory && p.id !== id).slice(0, 4);
  console.log(recommendList);

  const recommendGrid = document.querySelector(".recommend-grid");

  const productHTML = recommendList.map(
    p => `
      <article class="product-card">
        <img
          src="${p.images[0]}"
          alt="${p.title}"
        />
        <div class="product-info">
          <h3><a href="#">${p.title}</a></h3>
          <p>${p.category}</p>
          <div class="product-bottom">
            <strong>${p.price} $</strong>
            <button
              type="button"
              class="cart-add"
              aria-label="${p.title} 장바구니 담기"
            ></button>
          </div>
        </div>
      </article>
    `,
  );

  recommendGrid.innerHTML = productHTML.join("");
}

fetchProduct();

// 상품의 수량 변경하기
const quantityControl = document.querySelector(".quantity-control");
const quantity = document.querySelector("#quantity");

// 이벤트 위임 : 부모 요소로 자식 요소 이벤트 제어하기
// quantityControl 클릭했을 때
quantityControl.addEventListener("click", e => {
  const btn = e.target.closest("button");
  // 그 요소의 가까운 부모가 button이면, 그 버튼의 내용이 -면 quantity--, +면 quantity++
  if (!btn) return;
  let currentQty = Number(quantity.value);

  if (btn.textContent === "-") {
    if (currentQty > 1) {
      currentQty--;
    }
  } else {
    currentQty++;
  }
  quantity.value = currentQty;
});

// 장바구니 수 업데이트
updateCartCount();

// 장바구니에 추가하기
// 장바구니 담기 버튼을 클릭하면 현재 수량을 addToCart 함수에 인수를 넣어 실행
const addcart = document.querySelector("#addcart");

addcart.addEventListener("click", () => {
  // 장바구니에 추가하는 함수 실행
  addToCart(product, Number(quantity.value));
});
