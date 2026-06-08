import { updateCartCount, addToCart } from "./utils/common.js";

// DOM 요소 가져오기 및 필터/페이저 관련 요소 참조
// 각 변수는 이후 화면 렌더링, 페이지 전환, 필터 UI 구성에 사용됨
const productGrid = document.querySelector(".product-grid");
const pager = document.querySelector(".pagination .pager");
const pagerPrevBtn = document.querySelector(".pagination .prev");
const pagerNextBtn = document.querySelector(".pagination .next");
const categoryFilter = document.querySelector("#category-filter");
const priceFilter = document.querySelector("#price-filter");
const brandFilter = document.querySelector("#brand-filter");
const filteredCount = document.querySelector(".products-tools > span");
const sortSelect = document.querySelector("#sort");

// 페이지네이션 설정
const countPerPage = 12;
const pagerPerGroup = 5; // 페이저 그룹당 몇 개의 페이지 번호 표시
let currentPage = 1;
let paginationCount = 0;
let currentGroup = 1;

// 전체 상품 데이터 및 필터된 상품 데이터 상태
let products = [];
let filteredData = [];

let selectedCategories = [];
let selectedBrands = [];
let selectedPrice = "";

// 상품 조회 함수

// 상품 데이터를 JSON에서 가져와 초기 화면을 구성하는 함수
// 원리: 서버(또는 로컬 파일)로부터 상품 목록을 비동기로 가져와 변수에 저장한 뒤, 전체 상품 기준으로 페이지네이션과 UI를 초기 렌더링함
// 결과: products, filteredData가 채워지고, 처음 페이지 상품 목록과 카테고리/브랜드 필터 UI가 화면에 표시됨
async function fetchProducts() {
  try {
    const res = await fetch("./data/products.json");
    const data = await res.json();

    products = data.products;
    console.log(`data=${products}`);
    filteredData = products;
    console.log(filteredData);
    //pagination 생성
    makePagination(filteredData.length);

    renderProducts(filteredData);
    renderCategories();
    renderBrands();
    renderPrices();
  } catch {
  } finally {
  }
}
fetchProducts();

// 현재 페이지에 표시할 상품을 렌더링하는 함수
// 원리: 호출된 데이터에서 현재 페이지 범위에 해당하는 항목만 추출(paginate)하고, 각 항목을 HTML 템플릿으로 변환하여 화면에 출력함
// 결과: 현재 페이지의 상품 카드가 productGrid에 채워져 사용자가 상품 목록을 볼 수 있음
function renderProducts(data) {
  const pagedData = paginate(data, currentPage);

  const productHTML = pagedData.map(
    p =>
      `<article class="product-card">
            <img src="${p.thumbnail}" alt="${p.title}">
            <div class="product-info"> 
              <h3><a href="detail.html?id=${p.id}">${p.title}</a></h3>
              <p>${p.brand}</p>
              <div class="product-bottom">
                <strong>${p.price}</strong>
                <button type="button" data-id="${p.id}" class="cart-add" aria-label="${p.title} 장바구니 담기"></button>
              </div>
            </div>
          </article>`,
  );

  productGrid.innerHTML = productHTML.join("");

  filteredCount.innerHTML = `총 ${data.length}개 상품`;
}

// 전체 상품 수에 따라 페이지네이션 버튼을 생성하고 페이저 상태를 조정하는 함수
// 원리: 총 상품 수로 전체 페이지 수와 페이지 그룹 수를 계산한 뒤, 현재 페이지 그룹에서 보여야 할 페이지 번호만 출력함
// 결과: 사용자는 페이지 번호를 눌러 다른 페이지로 이동할 수 있고, 이전/다음 그룹 버튼은 현재 그룹에 맞춰 활성/비활성 처리됨
function makePagination(total) {
  paginationCount = Math.ceil(total / countPerPage); // 전체 페이지 수 계산
  const pagerGroupCount = Math.ceil(paginationCount / pagerPerGroup); // 페이지 그룹 수 계산

  // 현재 그룹의 시작 페이지 계산
  const startPage = (currentGroup - 1) * pagerPerGroup + 1;

  // 현재 그룹의 마지막 페이지 계산
  const endPage = Math.min(startPage + pagerPerGroup - 1, paginationCount);

  let pagerHTML = "";
  for (let i = startPage; i <= endPage; i++) {
    pagerHTML += `<a href="#" class="${i === currentPage ? "active" : ""}">${i}</a>`;
  }
  pager.innerHTML = pagerHTML;

  if (currentGroup === 1) {
    pagerPrevBtn.classList.add("disabled");
  } else {
    pagerPrevBtn.classList.remove("disabled");
  }
  if (currentGroup === pagerGroupCount) {
    pagerNextBtn.classList.add("disabled");
  } else {
    pagerNextBtn.classList.remove("disabled");
  }
  const pagerBtns = pager.querySelectorAll("a");
  pagerBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentPage === Number(btn.textContent)) return;

      currentPage = Number(btn.textContent);
      renderProducts(filteredData);
      pagerBtns.forEach(b => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    });
  });
}

// 전체 상품 목록에서 현재 페이지에 표시할 데이터만 추출하는 함수
// 원리: 선택된 페이지 번호를 기준으로 배열 인덱스 범위를 계산하고 slice로 해당 구간을 잘라냄
// 결과: renderProducts는 현재 페이지에 필요한 상품 데이터만 받아 화면에 출력함
function paginate(data, page) {
  const start = (page - 1) * countPerPage; // page 1 => 0, page 2 => 12
  const end = start + countPerPage;
  return data.slice(start, end);
}

// 이전/다음 페이지 그룹 버튼 이벤트 연결
pagerPrevBtn.addEventListener("click", e => {
  e.preventDefault();
  moveGroup(-1);
});
pagerNextBtn.addEventListener("click", e => {
  e.preventDefault();
  moveGroup(1);
});

// 이전/다음 페이지 그룹 이동 처리 함수
// 원리: 그룹 번호를 변경한 뒤 해당 그룹의 첫 페이지로 currentPage를 갱신하고, 페이지네이션과 상품 목록을 다시 렌더링함
// 결과: 한 그룹당 표시할 수 있는 페이지 번호를 넘어설 때 이전/다음 그룹으로 이동하여 새로운 페이지 번호 집합을 보여줌
function moveGroup(direction) {
  currentGroup += direction;
  currentPage = (currentGroup - 1) * pagerPerGroup + 1;
  makePagination(filteredData.length);
  renderProducts(filteredData);
}

// 카테고리 필터 생성
// 원리: 전체 상품에서 중복 없이 카테고리를 추출하여 체크박스를 동적으로 생성하고, 각 체크박스에 변경 이벤트를 연결함
// 결과: 사용자는 카테고리를 선택해 화면에 해당 카테고리 상품만 표시할 수 있지만, 현재 코드는 필터 로직이 주석 처리된 상태임

// products의 각 상품 데이터를 p로 받아서, p.category 값만 뽑아 새 배열을 생성
// Set으로 중복 없는 객체를 생성 후 다시 배열로 변환해 categories에 저장
function renderCategories() {
  const categories = [...new Set(products.map(p => p.category))];

  // 여러 요소를 한 번에 추가하기 위한 빈 DocumentFragment 생성
  const frag = document.createDocumentFragment();

  // categories의 각 요소를 c로 받아 categories 요소 수만큼 반복 :
  // label 요소를 생성하고,
  // value와 텍스트가 카테고리명인 checkbox를 생성해 label 안에 넣고,
  // 생성한 label을 frag에 추가
  categories.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="category" value="${c}" /> ${c}`;
    frag.appendChild(label);
  });

  // frag에 모아둔 모든 label을 categoryFilter에 한 번에 추가
  categoryFilter.appendChild(frag);

  // categoryFilter 내부의 모든 input 요소를 선택해 categoryLabel에 저장
  const categoryLabel = categoryFilter.querySelectorAll("input");

  console.log(categoryLabel);

  // categoryLabel의 각 요소를 label로 받아서 categoryLabel 요소 수만큼 반복 :
  // 반복 대상 : 각 요소를 label로 받고 label의 상태가 변경되면 시행하는 이벤트를 반복
  categoryLabel.forEach(label => {
    label.addEventListener("change", () => {
      // 카테고리 값이 all인 카테고리를 체크하면, 값이 all이 아닌 나머지 모든 카테고리의 체크를 해제하고,
      if (label.checked && label.value === "all") {
        categoryLabel.forEach(l => {
          if (l.value !== "all") {
            l.checked = false;
          }
        });
        // 전체 상품 데이터를 filteredData에 저장
        filteredData = products;
      }

      // 카테고리 값이 all이 아닌 카테고리를 체크하면, 값이 all인 카테고리들을 확인해 해당 라벨의 체크를 해제하고,
      else {
        categoryLabel.forEach(l => {
          if (l.value === "all") {
            l.checked = false;
          }
        });

        // categoryLabel(전체 input)을 배열로 변환해, checked되었으면서 값이 "all"이 아닌 요소들만 반환해서,
        // 각 input들의 value만 뽑아 새 배열 checkedCategories로 생성
        selectedCategories = [...categoryLabel]
          .filter(input => input.checked && input.value !== "all")
          .map(input => input.value);
      }
      applyFilter();
    });
  });
}

// 가격 필터 생성 함수
// 원리: 고정된 3개의 라디오 버튼을 priceFilter 요소 안에 추가하고, 사용자가 선택을 바꾸면 selectedPrice 값을 갱신한 뒤 전체 필터를 다시 실행함
// 결과: 가격 범위가 선택되면 applyFilter가 호출되어 카테고리/브랜드/가격을 모두 반영한 상품 목록을 다시 렌더링함
function renderPrices() {
  const priceHTML = `
  <label><input type="radio" name="price" value="low" /> 10$ 이하</label>
  <label><input type="radio" name="price" value="middle" /> 10$ ~ 100$</label>
  <label><input type="radio" name="price" value="high" /> 100$ 이상</label>
  `;
  priceFilter.innerHTML += priceHTML;
  const priceInputs = priceFilter.querySelectorAll("input");
  priceInputs.forEach(input => {
    input.addEventListener("change", () => {
      selectedPrice = input.value;
      applyFilter();
    });
  });
}

// 브랜드 필터 함수
// 원리: 전체 상품에서 중복 없는 브랜드 목록을 추출해서 체크박스 형태로 동적 생성함
// 결과: 브랜드 필터 UI가 화면에 표시되지만, 선택된 브랜드에 따라 상품을 필터링하는 별도 로직은 아직 추가되지 않음
function renderBrands() {
  const brands = [...new Set(products.map(p => p.brand))];
  const frag = document.createDocumentFragment();
  brands.forEach(b => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="brand" value="${b}" /> ${b}`;
    frag.appendChild(label);
  });
  brandFilter.appendChild(frag);

  const brandInputs = brandFilter.querySelectorAll("input");
  brandInputs.forEach(input => {
    input.addEventListener("change", () => {
      selectedBrands = [...brandInputs].filter(input => input.checked).map(input => input.value); //['Essence','Chanel'..]

      applyFilter();
    });
  });
}

// 필터 적용 함수
function applyFilter() {
  let result = [...products];

  //카테고리
  // selectedCategories 각 상품 데이터의 category를 포함하고 있는지 검사해서 새 배열을 만들어 filteredData에 저장
  if (selectedCategories.length > 0) {
    result = result.filter(p => selectedCategories.includes(p.category));
  }

  // 브랜드
  if (selectedBrands.length > 0) {
    result = result.filter(p => selectedBrands.includes(p.brand));
  }

  // 가격
  if (selectedPrice === "low") {
    result = result.filter(p => p.price < 10);
  }
  if (selectedPrice === "middle") {
    result = result.filter(p => p.price >= 10 && p.price <= 100);
  }
  if (selectedPrice === "high") {
    result = result.filter(p => p.price > 100);
  }

  // 이후 현재 페이지, 현재 페이지네이션 그룹을 1로 되돌리고,
  currentPage = 1;
  currentGroup = 1;

  // 밖에서 쓰기 위해 filteredData에 result값 저장 (애초에 filteredData로 썼으면 됨)
  filteredData = result;

  // 직전 만든 filteredData 배열을 렌더링하고, 그에 맞춰 페이지네이션 렌더링함
  renderProducts(result);
  makePagination(result.length);
}

sortSelect.addEventListener("change", () => {
  const selectedValue = sortSelect.value;
  console.log(selectedValue); // 인기순, 최신순, 낮은 가격순, 높은 가격순\

  switch (selectedValue) {
    case "인기순":
      filteredData.sort((a, b) => {
        return b.rating - a.rating;
      });
      break;

    case "최신순":
      filteredData.sort((a, b) => {
        return new Date(b.meta.createdAt) - new Date(a.meta.createdAt);
      });
      break;

    case "낮은 가격순":
      filteredData.sort((a, b) => {
        return a.price - b.price;
      });
      break;

    case "높은 가격순":
      filteredData.sort((a, b) => {
        return b.price - a.price;
      });
      break;
  }

  // if (selectedValue === "인기순") {
  //   filteredData.sort((a, b) => {
  //     return b.rating - a.ration;
  //   });
  // }
  // if (selectedValue === "최신순") {
  //   filteredData.sort((a, b) => {
  //     return new Date(b.meta.createdAt) - new Date(a.meta.createdAt);
  //   });
  // }
  // if (selectedValue === "낮은 가격순") {
  //   filteredData.sort((a, b) => {
  //     return a.price - b.price;
  //   });
  // }
  // if (selectedValue === "높은 가격순") {
  //   filteredData.sort((a, b) => {
  //     return b.price - a.price;
  //   });
  // }
  currentPage = 1;
  currentGroup = 1;

  renderProducts(filteredData);
  makePagination(filteredData.length);
});

// 장바구니에 추가하기
// 이벤트 위임 : 코드를 여러번 반복하지 말고 그리드를 눌렀을때 대상이 버튼이면 실행
let cart;
// 전체 그리드를 클릭했는데 그게 버튼이 아니면 취소
productGrid.addEventListener("click", e => {
  const btn = e.target.closest("button");

  // 버튼이 아니면 취소
  if (!btn) return;

  const pid = Number(btn.dataset.id);
  const product = products.find(p => p.id === pid);

  // 장바구니에 추가하는 함수 실행
  addToCart(product);
});

updateCartCount();
