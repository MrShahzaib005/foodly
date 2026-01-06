/* * MOCK DATABASE 
 * This mirrors the structure of your SQL tables.
 * When the backend is ready, we will replace this with fetch() calls.
 */

// TABLE: Restaurants
const db_restaurants = [
    {
        id: 1,
        name: "Italian Pizza House",
        cuisine: "Italian",
        rating: 4.5,
        image: "../assets/img/res1.jpg",
        description: "Authentic wood-fired pizzas."
    },
    {
        id: 2,
        name: "Burger Nation",
        cuisine: "American",
        rating: 4.2,
        image: "../assets/img/res2.jpg",
        description: "Juicy burgers and crispy fries."
    },
    {
        id: 3,
        name: "Desi Spice Hub",
        cuisine: "Pakistani",
        rating: 4.8,
        image: "../assets/img/res3.jpg",
        description: "Traditional spicy karahi and BBQ."
    }
];

// TABLE: MenuItems
// Linked to Restaurants via restaurant_id (Foreign Key)
const db_menu_items = [
    // Pizza House Items (ID: 1)
    { id: 101, restaurant_id: 1, name: "Margherita Pizza", price: 1200, image: "pizza1.jpg", category: "Pizza" },
    { id: 102, restaurant_id: 1, name: "Pepperoni Feast", price: 1500, image: "pizza2.jpg", category: "Pizza" },

    // Burger Nation Items (ID: 2)
    { id: 201, restaurant_id: 2, name: "Zinger Burger", price: 550, image: "burger1.jpg", category: "Burger" },
    { id: 202, restaurant_id: 2, name: "Beef Smash", price: 850, image: "burger2.jpg", category: "Burger" },
    
    // Desi Hub Items (ID: 3)
    { id: 301, restaurant_id: 3, name: "Chicken Biryani", price: 450, image: "biryani.jpg", category: "Rice" },
    { id: 302, restaurant_id: 3, name: "Seekh Kabab", price: 600, image: "kabab.jpg", category: "BBQ" }
];

// SIMULATE API CALLS
// These functions mimic fetching data from a server.

function getAllRestaurants() {
    return db_restaurants;
}

function getMenuByRestaurantId(id) {
    // Acts like: SELECT * FROM MenuItems WHERE restaurant_id = id
    return db_menu_items.filter(item => item.restaurant_id == id);
}

function getRestaurantDetails(id) {
    // Acts like: SELECT * FROM Restaurants WHERE id = id
    return db_restaurants.find(res => res.id == id);
}