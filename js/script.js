document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const productsSection = document.querySelector(".products");
  const contactForm = document.querySelector(".form");
  const row = document.querySelector(".tbody");
  const cartSection = document.querySelector(".cart");
  const cartLinkCounter = document.querySelector(".c-cartLink__counter");
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) link.classList.add("active");
    else link.classList.remove("active");
  });

  function toastifyNotification(message, type = "success") {
    const toastClass = type === "error" ? "tostify-error" : "tostify-success";
    const image =
      type === "error"
        ? "../assets/img/erroricon.png"
        : "../assets/img/checkicon.png";

    Toastify({
      text: message,
      close: false,
      avatar: image,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      className: `toastify ${toastClass}`,
      style: {
        background: "#ffffff",
        color: "#000000",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "20px 10px",
      },
    }).showToast();
  }

  function updateCartCounter() {
    cartLinkCounter.textContent = cart.length;
  }

  async function getData(id = null) {
    const response =
      id === null
        ? await fetch("https://fakestoreapi.com/products?sort=desc")
        : await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await response.json();
    return data;
  }

  function isProductInCart(productId) {
    return cart.some((item) => item.id === productId);
  }

  async function displayProducts() {
    try {
      const data = await getData();

      // Limpia la sección de productos antes de agregar nuevos
      productsSection.innerHTML = "";

      data.forEach((product) => {
        const isInCart = isProductInCart(product.id); // Verifica si el producto está en el carrito

        const buttonText = isInCart
          ? "Agregado al carrito"
          : "Agregar al carrito";
        const buttonClass = isInCart ? "btn-added" : "btn-primary";

        let buttonIcon = isInCart
          ? `<i class="fa-regular fa-circle-check"></i>`
          : `<i class="fas fa-shopping-cart"></i>`;

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
            <button class="product-card__button ${buttonClass}">
              ${buttonIcon} ${buttonText}
            </button>
          </article>
        `;
      });

      // Agrega event listeners a los botones después de renderizar
      const productButtons = document.querySelectorAll(".product-card__button");

      productButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const productCard = e.target.closest(".product-card");
          const productId = parseInt(productCard.getAttribute("data-id"));
          const productTitle = productCard.querySelector(
            ".product-card__title"
          ).textContent;
          const productPrice = productCard
            .querySelector(".product-card__price")
            .textContent.replace("$", "");
          const productImage = productCard.querySelector(
            ".product-card__image"
          ).src;

          // Objeto del producto, así se va a guardar en el localStorage
          const product = {
            id: productId,
            title: productTitle,
            price: parseFloat(productPrice),
            image: productImage,
          };

          addProductToCart(product);

          // Actualiza el botón tras agregar el producto
          const isInCart = isProductInCart(productId);
          if (isInCart) {
            button.innerHTML = `<i class="fa-regular fa-circle-check"></i> Agregado al carrito`;
            button.classList.remove("btn-primary");
            button.classList.add("btn-added");
          }
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function addProductToCart(product) {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (!existingProduct) {
      product.quantity = 1; // Agrega cantidad inicial
      cart.push(product);
      localStorage.setItem("carrito", JSON.stringify(cart));
      toastifyNotification("¡Producto agregado al carrito con éxito!");
    } else {
      toastifyNotification("¡Este producto ya está en el carrito!", "error");
    }

    updateCartCounter();
  }

  function updateCartProductQuantity(productId, quantity) {
    const product = cart.find((item) => item.id === productId);
    if (product) {
      product.quantity = quantity; // Actualiza la cantidad
      localStorage.setItem("carrito", JSON.stringify(cart));
      updateCartDisplay(); // Opcional: vuelve a renderizar la tabla del carrito
    }
  }

  function calculateTotal() {
    const total = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    return total.toFixed(2); // Devuelve el total con 2 decimales
  }

  function getProductsFromCart() {
    row.innerHTML = "";

    if (cart.length === 0) {
      row.innerHTML = `
        <tr>
          <td colspan="5" class="empty-cart-message">
            No hay productos en el carrito
          </td>
        </tr>`;
      return;
    }

    cart.forEach((product) => {
      const subtotal = (product.price * product.quantity).toFixed(2); // Subtotal por producto

      row.innerHTML += `
        <tr>
          <td class="w-33">${product.title}</td>
          <td class="w-33">
            <img
              src="${product.image}"
              alt="${product.category}"
              class="cart-image"
            />
          </td> 
          <td class="w-33">$${product.price}</td>
          <td class="w-33">
            <input type="number" min="1" max="20" value="1" class="product-quantity" data-id="${product.id}" />
          </td>
          <td class="w-33">
            <i class="fa-solid fa-trash-can trash-icon" data-id="${product.id}"></i>
          </td>
        </tr>`;
    });
  }

  if (currentPath.includes("cart.html") && row) {
    row.addEventListener("input", (e) => {
      if (e.target.classList.contains("product-quantity")) {
        const productId = e.target.dataset.id;
        const newQuantity = parseInt(e.target.value, 10);
        if (newQuantity >= 1) {
          updateCartProductQuantity(productId, newQuantity);
          getProductsFromCart(); // Actualiza la vista
        }
      }
    });
  }

  function removeProductFromCart(productId) {
    const response = confirm(
      "¿Estás seguro que deseas eliminar este producto del carrito?"
    );

    if (response) {
      // Se filtra el producto a eliminar. Devuelve un nuevo arreglo con los elementos distintos al id del producto a eliminar
      cart = cart.filter((product) => product.id !== productId);

      // "cart" es un nuevo arreglo sin ese id y se guarda este nuevo arreglo en localstorage.
      localStorage.setItem("carrito", JSON.stringify(cart));
      console.log(`Producto ${productId} eliminado del carrito.`);
      toastifyNotification("¡Producto eliminado del carrito con éxito!");

      // Se reutiliza la función para volver a imprimir los productos actualizados
      getProductsFromCart();
      updateCartCounter();
    }
  }

  if (row) {
    row.addEventListener("click", (e) => {
      if (e.target.classList.contains("trash-icon")) {
        const productId = e.target.dataset.id;
        removeProductFromCart(productId);
      }
    });
  }

  if (productsSection) {
    displayProducts();
  }

  if (cartSection) {
    getProductsFromCart();
  }

  if (cartLinkCounter) {
    cartLinkCounter.textContent = cart.length;
  }
});
