export function renderHeader() {
  const target = document.querySelector(".site-header");

  target.innerHTML = `
    <div class="header-top container">
      <a href="./index.html" class="logo" aria-label="ShopMall home">logo</a>
      <form class="search-form" action="#" method="get">
      <label for="search" class="sr-only">상품 검색</label>
      <span class="search-icon" aria-hidden="true"></span>
      <input id="search" type="search" placeholder="상품을 검색해보세요" />
      </form>
      <div class="user-actions">
      <a href="#">로그인</a>
      <a href="#">회원가입</a>
      <a href="cart.html" class="cart-button" aria-label="장바구니">
      <span class="cart-icon" aria-hidden="true"></span>
      <span class="cart-count">3</span>
      </a>
      </div>
      </div>
      <nav class="category-nav" aria-label="상품 카테고리">
      <div class="container">
      <ul>
      <li><a href="#">전체상품</a></li>
      <li><a href="#">패션의류</a></li>
      <li><a href="#">디지털</a></li>
      <li><a href="#">홈&amp;리빙</a></li>
      <li><a href="#">뷰티</a></li>
      <li><a href="#">스포츠</a></li>
      <li><a href="#">도서</a></li>
      </ul>
    </div>
    </nav>  
  `;
}
