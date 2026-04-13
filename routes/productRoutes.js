import express from "express";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByBarcode,
  getProductById,
  getProducts,
  generateBarcodeImage
} from "../controllers/productController.js";

const router = express.Router();

router.post("/addProduct", addProduct);

router.put("/update/:id", updateProduct);

router.delete("/delete/:id", deleteProduct);

router.get("/search", searchProducts);
router.get("/getAllProduct", getProducts)

router.get("/barcode/:barcode", getProductByBarcode);
router.get("/generateBarcode/:barcode", generateBarcodeImage);
router.get("/get/:id", getProductById);

export default router;