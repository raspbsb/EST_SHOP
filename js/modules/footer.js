export function renderFooter() {
  const target = document.querySelector(".site-footer");

  target.innerHTML = `
      <div class="footer-inner container">
        <p>© 2024 ShopMall. All rights reserved.</p>
        <ul class="payment-list" aria-label="지원 결제 수단">
          <li>visa</li>
          <li>mc</li>
          <li>p</li>
        </ul>
      </div>
  `;
}
