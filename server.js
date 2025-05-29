require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = 3000;

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
});

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
  console.log("📡 /health route hit");
  try {
    const result = await pool.query("SELECT 1");
    console.log("✅ DB responded:", result.rows);
    return res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("❌ DB connect error:", err);
    return res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/", (req, res) => {
  res
    .json({
      "Express & Postgres Lab - Home Page":
        "Welcome to the Express & Postgres Lab!",
    })
    .status(200);
});

// 🎯 STUDENT TASKS: Implement these routes
// ------------------------------------------------

// GET all products
app.get("/products", async (req, res) => {
  // TODO: Query database and return all products
  const { rows } = await pool.query("SELECT * FROM products")
  res.json(rows)
});

// GET single product
app.get("/products/:id", async (req, res) => {
  // TODO: 1. Get ID from params
  //       2. Query database
  //       3. Handle not found case
  const { id } = req.params
  console.log("id", id)
  const { rows } = await pool.query(`select * from products where id =${id}`)
  if(rows.length > 0){
    res.json(rows[0]).status(200)
  }else{
    res.status(200).json({ error: "Product not found"})
  }
});

// POST create product
app.post("/products", async (req, res) => {
console.log('REQQ:: ',req.body)
  // TODO: 1. Validate required fields (name, price)
  //       2. Insert into database
  //       3. Return new product
  const { name, price} = req.body;
  console.log('This is the name:: ', name)
  if(!name || typeof name !== 'string'){
    res.status(400).json({ error: "name not found"})
  }
  console.log("price:: ", typeof price)
  if(!price || typeof price !== 'number'){
    res.status(400).json({ error: "price not found"})
  }
  const text = `Insert into products (name, price) Values ($1, $2) Returning *`
  const values = [name, price]
  const { rows } = await pool.query(text, values);
  if (rows.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  //res.status(201).json({ message: "Delete successful", deletedProduct: rows[0] });
  res.json(rows[0]).status(201)
});

// PUT update product
app.put("/products/:id", async (req, res) => {
  // TODO: 1. Get ID from params
  //       2. Validate inputs
  //       3. Update database
  const id = Number(req.params.id)
  const { price, stock } = req.body
  console.log("id:: ", id)
    console.log("id:: ", typeof id)  
  if(!Number.isInteger(id)){
      return  res.status(500).json({ error: "id not found"})
  }
    const text = `UPDATE products SET price = COALESCE($1, price), stock = COALESCE($2, stock)WHERE id = $3
   RETURNING *;`
   const values = [price, stock, id]
   try{
     const { rows } = await pool.query(text, values)
     if(rows.length === 0){
      res.status(404).json({error: "product not found"})
     }
      res.json(rows[0]).status(201)
   } catch(err){
    console.error("DB delete failed:: ", err)
    res.status(400).json({ error: "database fauilure"})
   }

});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  // TODO: 1. Delete from database
  //       2. Handle success/failure
  const id = Number(req.params.id)
  const text = `Delete from products where id = $1 RETURNING *;`
  const values = [id]
  console.log("this the id::::::::::", id)
  console.log(typeof id)
  if(!Number.isInteger(id)){
        res.status(400).json({ error: "id not found"})
  }
  try{
    const { rows } = await pool.query(text, values)
    console.log(rows)
     if(rows.length === 0){
      res.status(404).json({error: "product not found"})
     }
     res.status(204).json({delete: "delete successful"})
  } catch(err){
        console.error("DB update failed:: ", err)
    res.status(500).json({ error: "database fauilure"})
  }

});

// ------------------------------------------------
// 🚫 Do not modify below this line



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
