DROP DATABASE IF EXISTS mamazonDB;
CREATE DATABASE mamazonDB;
USE mamazonDB;

CREATE TABLE products(
  product_id INTEGER not null AUTO_INCREMENT
, product_name VARCHAR(100) not null
, department_name VARCHAR(45)
, price DECIMAL(10,2) NOT NULL
, stock_qty INTEGER NOT NULL
, product_sales DECIMAL(20,2)
, PRIMARY KEY (product_id)
);

INSERT INTO products (product_name, department_name, price, stock_qty)
VALUES 
 ("Wings of Fire","Books",14.50,2000)
,("Laptop charger","Electronics",21.50,20)
,("Tulip Bulbs","Garden",16.75,268)
,("iPhone7","Electronics",998.00,365)
,("Avacodo - Bag","Foods",10.00,875)
,("Dining Table","Home Goods",699.99,130)
,("Patio Set","Garden",899.99,65)
,("Unwanteds","Books",16.25,9)
,("Asus Chromebook","Electronics",599.99,20)
,("Brooks Ghost 10 Sneakers","Sports",120.00,456)
,("Eloquent JavaScript","Books",46.95,823)
,("Priya Mixer Grinder","Home Goods",245.10,9)

;


