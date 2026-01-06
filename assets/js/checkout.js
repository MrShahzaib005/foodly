/* ===================================================
   CHECKOUT LOGIC (Robust Version)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutSummary();
});

function loadCheckoutSummary() {
    console.log("Loading Checkout Summary..."); // Debug Log

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const summaryList = document.getElementById("checkout-summary");
    const totalEl = document.getElementById("checkout-total");
    
    // Safety Check: Redirect if empty
    if (cart.length === 0) {
        alert("Your cart is empty.");
        window.location.href = "cart.html"; 
        return;
    }

    // 1. Group Items by ID
    const cartCounts = {};
    const cartItems = {}; // Store item details to look up later

    cart.forEach(item => {
        const id = String(item.id);
        cartCounts[id] = (cartCounts[id] || 0) + 1;
        cartItems[id] = item; // Save one copy of the item details
    });

    // 2. Calculate & Render
    let grandTotal = 0;
    summaryList.innerHTML = "";

    Object.keys(cartCounts).forEach(itemId => {
        const item = cartItems[itemId];
        const qty = cartCounts[itemId];

        // --- CRITICAL MATH FIX ---
        // Force price to be a number. If missing, default to 0.
        let price = parseFloat(item.price);
        if (isNaN(price)) price = 0;

        const itemTotal = price * qty;
        grandTotal += itemTotal;

        console.log(`Item: ${item.name}, Price: ${price}, Qty: ${qty}, Subtotal: ${itemTotal}`);

        const li = `
            <li class="list-group-item d-flex justify-content-between lh-sm">
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">Qty: ${qty}</small>
                </div>
                <span class="text-muted">Rs ${itemTotal}</span>
            </li>
        `;
        summaryList.innerHTML += li;
    });

    // 3. Update Total Display
    console.log("Grand Total Calculated:", grandTotal);
    
    if (totalEl) {
        totalEl.innerText = "Rs " + grandTotal;
    } else {
        console.error("ERROR: Could not find element with id='checkout-total'");
    }
}

// HANDLE FORM SUBMIT
document.getElementById("checkout-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    // 1. Validate Form
    const name = document.getElementById("fullName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("country").value;

    if (!name || !address || !city) {
        alert("Please fill in all required fields.");
        return;
    }

    // 2. Prepare Data for Backend
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Group items for API
    const cartMap = new Map();
    cart.forEach(item => {
        if (cartMap.has(String(item.id))) {
            cartMap.get(String(item.id)).qty += 1;
        } else {
            cartMap.set(String(item.id), { ...item, qty: 1 });
        }
    });

    const itemsToSend = [];
    let backendTotal = 0;

    cartMap.forEach(item => {
        const p = parseFloat(item.price) || 0;
        itemsToSend.push({
            id: item.id,
            qty: item.qty,
            price: p
        });
        backendTotal += (p * item.qty);
    });

    // 3. Send to Server
    const btn = document.querySelector("button[type='submit']");
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    const userId = localStorage.getItem("user_id") || null; 

    const orderData = {
        userId: userId,
        total: backendTotal,
        address: `${address}, ${city}`,
        items: itemsToSend,
        paymentMethod: document.getElementById("cod").checked ? "COD" : "Card"
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.removeItem("cart"); // Clear cart
            if(typeof updateCartCount === "function") updateCartCount();
            window.location.href = "order-success.html"; 
        } else {
            throw new Error(result.error || "Order failed");
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
});