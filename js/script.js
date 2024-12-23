document.addEventListener("DOMContentLoaded", () => {
  const productsSection = document.querySelector(".products");
  const cartSection = document.querySelector(".cart");
  const row = document.querySelector(".tbody");
  const deleteButton = document.querySelector(".trash-icon");
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  async function getData(id = null) {
    const response =
      id === null
        ? await fetch("https://fakestoreapi.com/products?sort=desc")
        : await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await response.json();
    console.log(data);
    return data;
  }

  async function displayProducts() {
    try {
      const data = await getData();

      data.forEach((product) => {
        productsSection.innerHTML += `
        <article class="product-card" data-id="${product.id}">
          <img
            src="${product.image}"
            alt="${product.category}"
            class="product-card__image"
          />
          <h2 class="product-card__title">${product.title}</h2>
          <p class="product-card__description">
            ${product.description}
          </p>
          <span class="product-card__price">$${product.price}</span>
          <button class="product-card__button">
            <i class="fas fa-shopping-cart"></i> Añadir al carrito
          </button>
        </article>
        `;
      });

      const productButtons = document.querySelectorAll(".product-card__button");

      productButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const productCard = e.target.closest(".product-card");
          const productId = productCard.getAttribute("data-id");

          console.log(`Producto ID: ${productId}`);
          addProductToCart(productId);
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function addProductToCart(productId) {
    if (!cart.includes(productId)) {
      cart.push(productId);
      localStorage.setItem("carrito", JSON.stringify(cart));
      console.log(`Producto ${productId} agregado al carrito`);
    } else {
      console.log(`Producto ${productId} ya está en el carrito`);
    }
  }

  function getProductsFromCart() {
    console.log(cart);
    if (cart.length === 0) return;

    cart.forEach(async (productId) => {
      const product = await getData(productId);
      console.log(product);
      row.innerHTML += 
        `<tr>
          <td>${product.title}</td>
          <td>
            <img
              src="${product.image}"
              alt="${product.category}"
              class="cart-image"
            />
          </td>
          <td><i class="fa-solid fa-trash-can trash-icon" data-id="${product.id}"></i></td>
        </tr>`;

        /* deleteButton.addEventListener("click", () => {
          removeProductFromCart(product.id);
        }); */
    });
  }

  function removeProductFromCart(productId) {
    const response = confirm("¿Estás seguro que deseas eliminar este producto?");

    if(response) {

    }
  }

  
  if (productsSection) {
    displayProducts();
  }
  
  if (cartSection) {
    getProductsFromCart();
  }

  /* if (document.URL.includes("contact.html")) {
    const form = document.getElementById("form");
    /* form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log(e);
    }); 
  } */
});
