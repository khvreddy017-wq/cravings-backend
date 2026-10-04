const express = require("express");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

router.get("/", async (req,res)=>{ try { res.json(await Food.find().sort({createdAt:-1})); } catch(error){ res.status(500).json({message:"Failed to fetch food items",error:error.message}); } });
router.get("/:id", async (req,res)=>{ try { const food=await Food.findById(req.params.id); if(!food)return res.status(404).json({message:"Food item not found"}); res.json(food); } catch(error){ res.status(500).json({message:"Failed to fetch food item",error:error.message}); } });
router.post("/", authMiddleware, adminMiddleware, async (req,res)=>{ try { const food=await Food.create(req.body); res.status(201).json(food); } catch(error){ res.status(400).json({message:"Failed to create food item",error:error.message}); } });
router.put("/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try { const food=await Food.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!food)return res.status(404).json({message:"Food item not found"}); res.json(food); } catch(error){ res.status(400).json({message:"Failed to update food item",error:error.message}); } });
router.delete("/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try { const food=await Food.findByIdAndDelete(req.params.id); if(!food)return res.status(404).json({message:"Food item not found"}); res.json({message:"Food item deleted successfully"}); } catch(error){ res.status(500).json({message:"Failed to delete food item",error:error.message}); } });
module.exports = router;
