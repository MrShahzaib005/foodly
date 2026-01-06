/* ===================================================
   SHOP LOGIC (Restaurants & Menu)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. If we are on the Restaurants page, load them
    if (document.getElementById("restaurant-grid")) {
        loadRestaurants();
    }

    // 2. If we are on the Menu page, load the menu
    if (document.getElementById("menu-header")) {
        loadMenuPage();
    }
});

/* ---------------------------------------------------
   RESTAURANTS PAGE LOGIC
   --------------------------------------------------- */
async function loadRestaurants() {
    const grid = document.getElementById("restaurant-grid");

    // Show Loading Spinner
    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;

    try {
        console.log("Fetching: http://localhost:3000/api/restaurants");
        const response = await fetch('http://localhost:3000/api/restaurants');

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const restaurants = await response.json();
        console.log("Data loaded:", restaurants);

        grid.innerHTML = ""; // Clear spinner

        if (restaurants.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center">No restaurants found in database.</div>';
            return;
        }

        restaurants.forEach(res => {
            // Fix Image Path: If DB has "../assets", change to "../../assets"
            // If DB has just "res1.jpg", add path "../../assets/img/"
            let imgPath = res.image;
            if (!imgPath.includes("/")) {
                imgPath = `../../assets/img/${res.image}`;
            } else {
                imgPath = imgPath.replace("../assets", "../../assets");
            }

            const card = `
                <div class="col-md-6 col-lg-4">
                    <div class="custom-card h-100 position-relative">
                        <img src="${imgPath}" alt="${res.name}" // NEW (Safe & Stops Loop)
                        // onerror="this.onerror=null; 
                        // this.src='https://placehold.co/600x400?text=No+Image'"
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-warning text-dark"><i class="fa-solid fa-star"></i> ${res.rating}</span>
                                <small class="text-muted">${res.cuisine}</small>
                            </div>
                            <h5 class="fw-bold">${res.name}</h5>
                            <p class="text-muted small">${res.description}</p>
                            
                            <a href="menu.html?id=${res.id}" class="btn btn-outline-dark w-100 mt-2 stretched-link">
                                View Menu
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });

    } catch (error) {
        // ERROR HANDLER
        console.error(error);
        grid.innerHTML = `<div class="col-12 text-danger text-center">
            <h3>❌ Connection Failed</h3>
            <p>${error.message}</p>
            <small>Check if your Node Server (port 3000) is running.</small>
        </div>`;
    }
}

function filterRestaurants() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const cards = document.querySelectorAll(".col-md-6");

    cards.forEach(card => {
        const name = card.querySelector("h5").innerText.toLowerCase();
        const cuisine = card.querySelector("small").innerText.toLowerCase();

        if (name.includes(query) || cuisine.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

/* ---------------------------------------------------
   MENU PAGE LOGIC
   --------------------------------------------------- */
/* ---------------------------------------------------
   MENU PAGE LOGIC (FIXED)
   --------------------------------------------------- */
async function loadMenuPage() {
    const params = new URLSearchParams(window.location.search);
    const restaurantId = params.get("id");

    if (!restaurantId) {
        window.location.href = "restaurants.html";
        return;
    }

    const menuContainer = document.getElementById("menu-container");
    
    // Render Loading State
    menuContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';
    document.getElementById("res-name").innerText = "Loading...";

    try {
        // Fetch Restaurant Details & Menu Items
        const [resResponse, menuResponse] = await Promise.all([
            fetch(`http://localhost:3000/api/restaurants/${restaurantId}`),
            fetch(`http://localhost:3000/api/menu/${restaurantId}`)
        ]);

        const restaurant = await resResponse.json();
        const menuItems = await menuResponse.json();

        // 1. Fill Header Info
        const resData = Array.isArray(restaurant) ? restaurant[0] : restaurant;

        document.getElementById("res-name").innerText = resData.name;
        document.getElementById("res-desc").innerText = resData.description;
        
        // Fix header background image
        let bgImg = resData.image;
        if (bgImg && !bgImg.includes("/")) {
            bgImg = `../../assets/img/${bgImg}`;
        } else if (bgImg) {
            bgImg = bgImg.replace("../assets", "../../assets");
        }
        document.getElementById("res-img").style.backgroundImage = `url('${bgImg}')`;

        // 2. Fill Menu Items
        menuContainer.innerHTML = ""; 

        if (menuItems.length === 0) {
            menuContainer.innerHTML = '<div class="col-12 text-center">No menu items found.</div>';
            return;
        }

        menuItems.forEach(item => {
            // DEFINE VARIABLE: itemImg
            let itemImg = item.image;
            if (itemImg && !itemImg.includes("/")) {
                itemImg = `../../assets/img/${itemImg}`;
            }

            // USE VARIABLE: itemImg (Not imgPath)
            const itemCard = `
                <div class="col-md-6">
                    <div class="card shadow-sm border-0 h-100 flex-row overflow-hidden align-items-center">
                        <div style="width: 120px; height: 100%; min-height: 120px;">
                            <img src="${itemImg}" alt="${item.name}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=No+Image'">
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold mb-1">${item.name}</h6>
                                <span class="text-primary fw-bold">Rs ${item.price}</span>
                            </div>
                            <p class="text-muted small mb-2">${item.category}</p>
                            
                            <button class="btn btn-sm btn-outline-danger" 
                                onclick="addToCart('${item.id}', '${item.name}', ${item.price}, '${item.image}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            menuContainer.innerHTML += itemCard;
        });

    } catch (error) {
        console.error(error);
        menuContainer.innerHTML = `<div class="text-danger text-center">Failed to load menu.</div>`;
    }
}

/* ---------------------------------------------------
   CART ACTIONS
   --------------------------------------------------- */
function addToCart(id, name, price, image) {
    // 1. Auth Check
    if (!localStorage.getItem("user_token")) {
        alert("Please login to order!");
        // Redirect logic handled in app.js usually, but forcing it here:
        window.location.href = "../auth/login.html";
        return;
    }

    // 2. Get Cart
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // 3. Add Item (Push the whole object so we don't need DB lookup in cart page)
    cart.push({ id, name, price, image });

    // 4. Save & Update UI
    localStorage.setItem("cart", JSON.stringify(cart));

    // Trigger update in app.js if it exists
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }

    alert(`${name} added to cart!`);
}