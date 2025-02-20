import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

import multer from "multer";
import * as XLSX from 'xlsx';

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("records");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };

    // Validate required fields
    if (!newDocument.name || !newDocument.position || !newDocument.level) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let collection = await db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.status(201).json(result);  // Changed to 201 for resource creation
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding record" });
  }
});

// Bulk upload records from Excel file
router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
 
    console.log("File received:", req.file.originalname);
 
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
      cellStyles: true,
      cellNF: true
    });
 
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json(firstSheet);
 
    console.log("Parsed records:", records);
 
    // Validate the records
    if (!records || records.length === 0) {
      return res.status(400).json({ error: "No valid records found in file" });
    }
 
    // Insert into MongoDB
    const collection = await db.collection("records");
    const result = await collection.insertMany(records);
 
    console.log("Insert result:", result);
 
    res.status(200).json({
      success: true,
      message: `Successfully inserted ${result.insertedCount} records`,
      count: result.insertedCount
    });
 
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to process upload" });
  }
 });

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };

    let collection = await db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("records");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;
