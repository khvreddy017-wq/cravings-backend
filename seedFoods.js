const mongoose = require("mongoose");
require("dotenv").config();

const Food = require("./models/Food");

const foods = [
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with spicy chicken",
    price: 220,
    category: "Biryani",
    image: "/images/biryani/chicken-biryani.jpg",
    restaurant: "CRAVINGS Kitchen",
    state: "Andhra Pradesh",
    isVeg: false,
    available: true
  },
  {
    name: "Veg Biryani",
    description: "Fragrant basmati rice cooked with fresh vegetables",
    price: 180,
    category: "Biryani",
    image: "/images/biryani/veg-biryani.jpg",
    restaurant: "CRAVINGS Kitchen",
    state: "Telangana",
    isVeg: true,
    available: true
  },
  {
    name: "Masala Dosa",
    description: "Crispy dosa served with potato masala and chutney",
    price: 90,
    category: "Dosa",
    image: "/images/dosa/masala-dosa.jpg",
    restaurant: "South Spice",
    state: "Karnataka",
    isVeg: true,
    available: true
  },
  {
    name: "Chicken Shawarma",
    description: "Juicy chicken wrapped with vegetables and creamy sauce",
    price: 140,
    category: "Shawarma",
    image: "/images/shawarma/chicken-shawarma.jpg",
    restaurant: "Arabian Bites",
    state: "Telangana",
    isVeg: false,
    available: true
  },
  {
    name: "Classic Burger",
    description: "Crispy patty with lettuce, tomato and special sauce",
    price: 160,
    category: "Burgers",
    image: "/images/burgers/classic-burger.jpg",
    restaurant: "Burger House",
    state: "Karnataka",
    isVeg: false,
    available: true
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza topped with tomato, mozzarella and herbs",
    price: 199,
    category: "Pizza",
    image: "/images/pizza/margherita-pizza.jpg",
    restaurant: "Pizza Corner",
    state: "Tamil Nadu",
    isVeg: true,
    available: true
  },
  {
    name: "Chicken Fried Rice",
    description: "Wok-tossed rice with chicken and fresh vegetables",
    price: 170,
    category: "Fried Rice",
    image: "/images/fried-rice/chicken-fried-rice.jpg",
    restaurant: "Chinese Bowl",
    state: "Karnataka",
    isVeg: false,
    available: true
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer cooked in a rich creamy tomato gravy",
    price: 190,
    category: "North Indian",
    image: "/images/north-indian/paneer-butter-masala.jpg",
    restaurant: "Royal Tadka",
    state: "Andhra Pradesh",
    isVeg: true,
    available: true
  },
  {
    name: "Chicken Momos",
    description: "Steamed dumplings filled with juicy seasoned chicken",
    price: 130,
    category: "Momos",
    image: "/images/momos/chicken-momos.jpg",
    restaurant: "Momo Street",
    state: "Telangana",
    isVeg: false,
    available: true
  },
  {
    name: "Gulab Jamun",
    description: "Soft milk dumplings soaked in sweet sugar syrup",
    price: 80,
    category: "Desserts",
    image: "/images/desserts/gulab-jamun.jpg",
    restaurant: "Sweet Treats",
    state: "Andhra Pradesh",
    isVeg: true,
    available: true
  }
];

async function seedFoods() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    await Food.deleteMany({});

    const insertedFoods = await Food.insertMany(foods);

    console.log(
      `${insertedFoods.length} food items added successfully!`
    );

    await mongoose.connection.close();

    console.log("Database connection closed.");
  } catch (error) {
    console.error("Failed to seed food data:", error.message);
    process.exit(1);
  }
}

seedFoods();