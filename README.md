# S381F-Project
Shop Product Management System


# Shop Product Management System

## Group Information
Group: 79

Members:
- Tse Pak Chuen (13044384)
- Ng Cheuk Hei (13079894)

## Application Access
https://s381f-project-shop-product-management.onrender.com/

## User Guide

### Login
To access the system, use the following default accounts:
- Username: `user`, Password: `abc`
- Username: `Joe`, Password: `password`
- Username: `123`, Password: `123`

Upon successful login, the main page is displayed, including options to search, create, update, delete products, and log out. If login fails, a message "Invalid username or password" will appear.

### Logout
On the main page, you can click 'Logout' to securely exit your account.

## CRUD Services

### Search Product
To search for a product:
1. Enter the product name or ID.
2. Click the 'Search' button.
3. The system will display the product information you requested.

### Create New Product
To add a new product:
1. Navigate to 'Create New Product'.
2. On the creation page, enter the product ID, name, and price.
3. Click 'Create Product'. The system will confirm the product creation.

### Update Product
To update an existing product:
1. Click 'Update' next to the product you wish to update.
2. On the update page, modify the product details.
3. Click 'Update Product'. The system will apply and confirm the changes.

### Delete Product
To delete a product:
1. Click 'Delete' next to the product you wish to remove.
2. Confirm the deletion. The system will then remove the product.

## RESTful API Guide

### API Overview
The system's API supports various operations through standard HTTP methods, enabling users to manage product data programmatically.

### Example Commands
Here's a summary of the `curl` command examples that demonstrate how to interact with the API:

- **Create a Product**: `curl -X POST http://localhost:3000/api/products -H 'Content-Type: application/json' -d '{"Product_id": 3, "Product_name": "Orange", "Product_price": 8}'`
- **Retrieve a Specific Product**: `curl -X GET http://localhost:3000/api/products/3`
- **Retrieve All Products**: `curl -X GET http://localhost:3000/api/products`
- **Update Product Price**: `curl -X PUT http://localhost:3000/api/products/3 -H 'Content-Type: application/json' -d '{"Product_price": 9}'`
- **Update Product Name**: `curl -X PUT http://localhost:3000/api/products/3 -H 'Content-Type: application/json' -d '{"Product_name": "Big Orange"}'`
- **Delete a Product**: `curl -X DELETE http://localhost:3000/api/products/3`

### Conclusion
These `curl` commands provide a practical way to interact with the system's RESTful API, enabling efficient management of product information. For additional support or information, please contact the developers listed in the Group Information section.
