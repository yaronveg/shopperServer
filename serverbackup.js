import express from "express";
import { readFile, writeFile } from "fs/promises";
import { v4 } from "uuid";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// read file function //
async function fileProducts() {
  const productsStr = await readFile("./products.json", "utf-8");
  const products = await JSON.parse(productsStr);
  return products;
}

// initial products
async function initProducts() {
  const data = await fetch("https://fakestoreapi.com/products");
  const products = await data.json();
  const newIds = products.map((product) => ({ ...product, id: v4() }));
  return newIds;
}

if (!productsFile) {
  const products = await initProducts();
  writeFile("./products.json", JSON.stringify(products));
}

////////////// C.R.U.D - CREATE, READ, UPDATE, DELETE //////////////

// READ //
app.get("/products", async (req, res) => {
  let products = await fileProducts();
  if (req.query.term) {
    const { term } = req.query;
    products = products.filter(
      (product) =>
        product.title.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
    );
  }
  res.send(products);
});

// READ product //
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const products = await fileProducts();
  res.send(products.find((product) => product.id === id));
});

// CREATE //
app.post("/products", async (req, res) => {
  const { title, price, description, category, image, rating } = req.body;
  const newProduct = {
    id: v4(),
    title,
    price,
    description,
    category,
    image,
    rating,
  };

  let products = await fileProducts();
  products.push(newProduct);
  writeFile("./products.json", JSON.stringify(products));
  res.send(newProduct);
});

// UPDATE //
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const products = await fileProducts();
  const productI = products.findIndex((product) => product.id === id);

  for (const param in body) {
    products[productI] = { ...products[productI], [param]: body[param] };
  }

  res.send(products);
});

// DELETE //
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const products = await fileProducts();
  products.splice(
    products.findIndex((product) => product.id === id),
    1
  );
  res.send(products);
});

app.listen(8000);
