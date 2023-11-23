const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

const usersInfo = [
  { username: "user", password: "abc" },
  { username: "Joe", password: "password" },
  { username: "123", password: "123" } ]
  
// MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://lab02:lab02@cluster0.w8d8uyb.mongodb.net/?retryWrites=true&w=majority'
// Create a new MongoClient
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;
client.connect()
  .then(() => {
    console.log('MongoDB Connected');
    db = client.db('S381F'); // Replace 'S381F' with your actual database name if different
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');

// User Authentication Routes

  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the provided username and password match any user
    const authenticatedUser = usersInfo.find(user => user.username === username && user.password === password);

    if (authenticatedUser) {
      // Authentication successful, set session variables
      req.session.authenticated = true;
      req.session.username = authenticatedUser.username;
      res.redirect('/products');
    } else {
      // Authentication failed, display an error message
      res.render('login', { message: 'Invalid username or password' });
    }
  });

app.get('/', (req, res) => {
      res.redirect('/login');    
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Routes
app.get('/products', async (req, res) => {
    try {
        const products = await db.collection('products').find({}).toArray();
        res.render('products', { products });
    } catch (error) {
        res.status(500).send('Error retrieving products');
    }
});

app.get('/products/search', async (req, res) => {
    try {
        const searchQuery = req.query.query;
        let products;

        // Check if the search query is a number (could be a product ID)
        if (!isNaN(searchQuery)) {
            // Search by Product_id
            products = await db.collection('products').find({ Product_id: parseInt(searchQuery) }).toArray();
        } else {
            // Search by Product_name (case insensitive)
            products = await db.collection('products').find({ Product_name: new RegExp(searchQuery, 'i') }).toArray();
        }

        // Render the searchProducts view, passing in the found products
        res.render('searchProducts', { products });
    } catch (error) {
        res.status(500).send('Error retrieving products');
    }
});

app.get('/products/create', (req, res) => {
    res.render('createProduct');
});

app.post('/products/create', async (req, res) => {
    try {
        const product_id = parseInt(req.body.Product_id);

        // Check if a product with the given Product_id already exists
        const existingProduct = await db.collection('products').findOne({ Product_id: product_id });
        if (existingProduct) {
            // If a product with this Product_id already exists, do not create a new one
            return res.status(400).send('A product with this Product ID already exists.');
        }

        const newProduct = {
            Product_id: product_id,
            Product_name: req.body.Product_name,
            Product_price: parseFloat(req.body.Product_price)
        };

        await db.collection('products').insertOne(newProduct);
        res.redirect('/products');
    } catch (error) {
        res.status(500).send('Error creating product');
    }
});

// Route to display the delete confirmation page
app.get('/products/delete/:Product_id', async (req, res) => {
    try {
        const product = await db.collection('products').findOne({ "Product_id": parseInt(req.params.Product_id) });
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('deleteProduct', { product });
    } catch (error) {
        res.status(500).send('Error retrieving product');
    }
});

// Route to handle the deletion
app.post('/products/delete/:Product_id', async (req, res) => {
    try {
        await db.collection('products').deleteOne({ "Product_id": parseInt(req.params.Product_id) });
        res.redirect('/products');
    } catch (error) {
        res.status(500).send('Error deleting product');
    }
});

// Route to display the update form
app.get('/products/update/:Product_id', async (req, res) => {
    try {
        const product = await db.collection('products').findOne({ "Product_id": parseInt(req.params.Product_id) });
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('updateProduct', { product });
    } catch (error) {
        res.status(500).send('Error retrieving product');
    }
});

// Route to handle the update form submission
app.post('/products/update/:Product_id', async (req, res) => {
    try {
        const updatedProduct = {
            Product_name: req.body.Product_name,
            Product_price: parseFloat(req.body.Product_price)
        };

        await db.collection('products').updateOne(
            { "Product_id": parseInt(req.params.Product_id) },
            { $set: updatedProduct }
        );

        res.redirect('/products');
    } catch (error) {
        res.status(500).send('Error updating product');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});



// RESTful API for Products

// CREATE: Add a new product
app.post('/api/products', async (req, res) => {
    try {
        // Ensure Product_id is unique
        const product_id = parseInt(req.body.Product_id);
        const existingProduct = await db.collection('products').findOne({ Product_id: product_id });
        if (existingProduct) {
            return res.status(409).json({ message: 'Product ID already exists' });
        }

        const newProduct = {
            Product_id: product_id,
            Product_name: req.body.Product_name,
            Product_price: parseFloat(req.body.Product_price)
        };

        await db.collection('products').insertOne(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error });
    }
});

// READ: Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find({}).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error: error });
    }
});

// READ: Get a single product by Product_id
app.get('/api/products/:Product_id', async (req, res) => {
    try {
        const product = await db.collection('products').findOne({ Product_id: parseInt(req.params.Product_id) });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error: error });
    }
});

// UPDATE: Modify an existing product
app.put('/api/products/:Product_id', async (req, res) => {
    try {
        const updatedProduct = {
            Product_name: req.body.Product_name,
            Product_price: parseFloat(req.body.Product_price)
        };

        const result = await db.collection('products').updateOne(
            { Product_id: parseInt(req.params.Product_id) },
            { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error });
    }
});

// DELETE: Remove a product
app.delete('/api/products/:Product_id', async (req, res) => {
    try {
        const result = await db.collection('products').deleteOne({ Product_id: parseInt(req.params.Product_id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
