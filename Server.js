const express = require('express');
const path = require("path");        // Import Path for directory management
const fs = require('fs');
const app = express();
const router = express.Router();

require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
// Define the path for EJS views
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Sample data for the dashboard
app.get("/dashboard", (req, res) => {
    const dashboardData = {
        totalSales: 150,
        totalEarnings: 12000,
        totalOrders: 80,
        stockAlerts: [
            { product: "Car Spoiler", stock: 2 },
            { product: "LED Headlights", stock: 1 }
        ],
        recentOrders: [
            { orderId: "ORD001", customer: "Alice", status: "Shipped" },
            { orderId: "ORD002", customer: "Bob", status: "Processing" },
            { orderId: "ORD003", customer: "Charlie", status: "Delivered" }
        ]
    };

    res.render("Seller/dashboard", {dashboard: dashboardData});
});

//For the Profile Settings
app.get("/profileSettings", (req, res) => {
    const profileData = {
        storeName: "",
        ownerName: "",
        contactEmail: "",
        phone: "",
        address: "",
        workingHours: "",
    };

    res.render("Seller/profileSettings", { profile: profileData });
});

app.post("/profile-settings", (req, res) => {
    const updatedProfile = req.body;

    // For now, log the updated data
    console.log("Updated Profile Data:", updatedProfile);

    res.redirect("/profileSettings");
});

// GET - Display orders
app.get('/orders', (req, res) => {
    const orders = getOrders();
    res.render("Seller/orderManagement", { orders });
});

// Path for orders.json
const ordersFilePath = path.join(__dirname, 'Data', 'orders.json');

// Helper functions
const getOrders = () => JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));

//const saveOrders = (orders) => fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');

const saveOrders = (orders) => {
    try {
        fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
        console.log("Orders updated successfully!");
    } catch (error) {
        console.error("Error writing orders file:", error);
    }
};

// Earnings & Payouts Route
app.get('/earnings-payouts', (req, res) => {
    res.render("Seller/earningsPayouts", { payoutData });
});

// Sample Data for Earnings & Payouts
const payoutData = {
    totalEarnings: 15000,
    pendingPayouts: 2000,
    availableBalance: 5000, // Ensure this is defined
    transactions: [
        { date: "2024-03-01", amount: 500, status: "Completed" },
        { date: "2024-03-10", amount: 1000, status: "Pending" },
        { date: "2024-03-15", amount: 700, status: "Completed" }
    ]
};

// POST route to request payouts
app.post('/request-payout', (req, res) => {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).send("Invalid payout amount");
    }

    console.log(`Payout request submitted: $${amount}`);
    res.redirect('/earnings-payouts');
});

//Logic for the Reviews & Ratings Page
// Route for displaying the reviews page
app.get('/reviews', (req, res) => {
    res.render("Seller/reviewsRatings", {products, filteredReviews: [], averageRating: 0});
});

// Route to filter reviews
app.get('/reviews/filter', (req, res) => {
    const { product, rating } = req.query;

    let filteredReviews = reviews;

    // Filter by product
    if (product) {
        filteredReviews = filteredReviews.filter(review => review.product === product);
    }

    // Filter by rating
    if (rating && rating !== 'all') {
        filteredReviews = filteredReviews.filter(review => String(review.rating) === rating);
    }

    const averageRating = calculateAverageRating(filteredReviews);

    res.render("Seller/reviewsRatings", {
        reviews,
        products,
        filteredReviews,
        averageRating
    });
});

// Load reviews dynamically
const reviews = JSON.parse(fs.readFileSync('./data/reviews.json', 'utf8'));

// Load products dynamically
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Utility function to calculate average rating
function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
}

//Logic for Product Management Page
// In-memory storage for products1
let products1 = [];

// Home route - Render the EJS template
app.get('/productmanagement', (req, res) => {
  res.render("Seller/productManagement", { products1 });
});

// Add a product
app.post('/add-product', (req, res) => {
  const { name, price, description, category, brand, quantity, sku } = req.body;
  const product = {
    id: Date.now(), // Unique ID
    name,
    price,
    description,
    category,
    brand,
    quantity,
    sku,
  };
  products1.push(product);
  res.redirect('/productmanagement'); // Redirect back to the product management page
});

// Delete a product
app.post('/delete-product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  products1 = products1.filter((product) => product.id !== productId);
  res.redirect('/productmanagement'); // Redirect back to the product management page
});


//Start the Server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Gracefully release the port when stopping the server
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed. Exiting process...');
        process.exit(0);
    });
});
