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
