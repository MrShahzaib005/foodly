/* ===================================================
   MAIN APP LOGIC (Navbar, Auth, Cart Badge)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    updateCartCount();
});

function updateAuthUI() {
    const user = localStorage.getItem("user_token");
    const authLink = document.getElementById("auth-link");
    
    if (!authLink) return; // Guard clause if element is missing

    if (user) {
        // User is logged in -> Show LOGOUT
        authLink.innerHTML = `<a href="#" class="nav-link" onclick="logout()">Logout</a>`;
    } else {
        // User is Guest -> Show LOGIN with Smart Pathing
        const path = window.location.pathname;
        let loginPath = "pages/auth/login.html"; // Default for Root (index.html)

        // If we are deep inside 'pages/shop' or 'pages/user'
        if (path.includes("/pages/shop/") || path.includes("/pages/user/")) {
            loginPath = "../auth/login.html";
        } 
        // If we are already inside 'pages/auth' (e.g. signup page)
        else if (path.includes("/pages/auth/")) {
            loginPath = "login.html";
        }

        authLink.innerHTML = `<a href="${loginPath}" class="nav-link">Login</a>`;
    }
}

function logout() {
    // 1. Clear Data
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    
    // 2. Redirect to Home (Smart Pathing)
    const path = window.location.pathname;
    if (path.includes("/pages/")) {
        window.location.href = "../../index.html"; // Go up two levels from shop/ or auth/
    } else {
        window.location.reload(); // Just reload if at root
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const badge = document.getElementById("cart-count");
    
    if(badge) {
        badge.innerText = cart.length;
        
        // Optional: Hide badge if 0
        if (cart.length === 0) {
            badge.classList.add("d-none");
        } else {
            badge.classList.remove("d-none");
        }
    }
}