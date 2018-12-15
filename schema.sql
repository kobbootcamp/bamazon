CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
item_id INTEGER AUTO_INCREMENT PRIMARY KEY,
product_name VARCHAR(50),
dept_name VARCHAR(50),
price DECIMAL(6,2),
stock INT
);

