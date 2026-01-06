/* ===================================================
   CART LOGIC (With Safety Checks)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadCartTable();
});

function loadCartTable() {
    const cartContainer = document.getElementById("cart-table-body");
    const grandTotalEl = document.getElementById("grand-total");
    const subTotalEl = document.getElementById("sub-total");
    
    // 1. GET CART
    let rawCart = JSON.parse(localStorage.getItem("cart")) || [];

    // --- SAFETY CHECK (The Fix) ---
    // Filter out "Old" data (numbers) or "Bad" data (nulls)
    // We only keep items that are objects and have an ID.
    let cart = rawCart.filter(item => item && typeof item === 'object' && item.id);

    // If we filtered out bad data, update LocalStorage immediately to fix the badge count
    if (cart.length !== rawCart.length) {
        console.warn("Cleaned up corrupted cart data.");
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount(); // Update the badge
    }
    // -----------------------------

    if (cart.length === 0) {
        cartContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4">Your cart is empty. <a href="restaurants.html">Go eat!</a></td></tr>';
        grandTotalEl.innerText = "Rs 0";
        if(subTotalEl) subTotalEl.innerText = "Rs 0";
        return;
    }

    // 2. GROUP ITEMS
    const cartMap = new Map();

    cart.forEach(item => {
        // Ensure ID is a string for consistent matching
        const id = String(item.id);
        
        if (cartMap.has(id)) {
            const existing = cartMap.get(id);
            existing.qty += 1;
        } else {
            // Clone the item so we don't mess up original references
            cartMap.set(id, { ...item, qty: 1 });
        }
    });

    // 3. GENERATE HTML
    let totalAmount = 0;
    cartContainer.innerHTML = "";

    cartMap.forEach((item) => {
        const price = parseFloat(item.price) || 0;
        const itemTotal = price * item.qty;
        totalAmount += itemTotal;

        // Fix image path
        let imgPath = item.image || "default.jpg";
        if (!imgPath.includes("/")) {
            imgPath = `../../assets/img/${imgPath}`;
        }

        const row = `
            <tr>
                <td class="align-middle">
                    <img src="${imgPath}" alt="${item.name}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=No+Image'">
                </td>
                <td class="align-middle fw-bold">${item.name}</td>
                <td class="align-middle">
                    <div class="input-group input-group-sm mx-auto" style="width: 100px;">
                        <button class="btn btn-outline-secondary" onclick="updateQty('${item.id}', -1)">-</button>
                        <span class="input-group-text bg-white">${item.qty}</span>
                        <button class="btn btn-outline-secondary" onclick="updateQty('${item.id}', 1)">+</button>
                    </div>
                </td>
                <td class="align-middle">Rs ${price}</td>
                <td class="align-middle fw-bold text-primary">Rs ${itemTotal}</td>
                <td class="align-middle">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        cartContainer.innerHTML += row;
    });

    // 4. UPDATE TOTALS
    grandTotalEl.innerText = "Rs " + totalAmount;
    if(subTotalEl) subTotalEl.innerText = "Rs " + totalAmount;
}

// ========== ACTIONS ==========

function updateQty(itemId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    itemId = String(itemId); // Ensure consistency
    
    if (change === 1) {
        // Push a copy of the item
        const item = cart.find(i => String(i.id) === itemId);
        if (item) cart.push(item);
    } else if (change === -1) {
        // Find FIRST occurrence and remove it
        const index = cart.findIndex(i => String(i.id) === itemId);
        if (index > -1) {
            cart.splice(index, 1);
        }
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartTable(); 
    updateCartCount(); 
}

function removeItem(itemId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    itemId = String(itemId);
    
    // Remove ALL items with this ID
    const newCart = cart.filter(i => String(i.id) !== itemId);
    
    localStorage.setItem("cart", JSON.stringify(newCart));
    loadCartTable();
    updateCartCount();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(cart.length === 0) {
        alert("Cart is empty!");
        return;
    }
    window.location.href = "checkout.html"; 
}