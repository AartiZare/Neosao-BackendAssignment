const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const auth = require("../middleware/auth")


//------------------------------------------USER API's-----------------------------------------------------//
router.post("/RegisterUser", userController.userRegister);
router.get("/Login", userController.userLogin);


//---------------------------------------Product API's--------------------------------------------------//
router.post("/product", auth.verify, productController.product);
router.put("/product/:productId/productImage", auth.verify, productController.addImage);
router.get("/product/:productId", auth.verify, productController.fetchProductById);
router.get("/getAllProducts", auth.verify, productController.fetchProduct);

module.exports = router;