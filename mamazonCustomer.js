var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "mamazonDB"
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("\nWelcome to Mamazon!");
	getSaleOrder();
});

function getSaleOrder() {
	connection.query("SELECT department_name AS 'Department', product_name AS 'Product', product_id AS 'Product Code', price AS 'Price' FROM products WHERE stock_qty > 0 ORDER BY 1,2,3 ASC", function (err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		if (res.length > 0) {
			console.log("Following are the available items");
			console.table(res);
			inquirer
				.prompt([
					{
						type: "input",
						message: "Enter the product code that you want to purchase:",
						name: "prodcode"
					},
					{
						type: "input",
						message: "How many units do you want to purchase?",
						name: "quantity"
					},
					{
						type: "confirm",
						message: "Are you sure? (Y/N):",
						name: "confirm",
						default: true
					}
				])
				.then(function (orderResponse) {
					if (orderResponse.confirm) {
						connection.query("SELECT stock_qty, price FROM products where product_id=?", [orderResponse.prodcode], function (err, res) {
							if (err) {
								throw err;
							}
							if (res.length > 0) {
								// console.log("Existing inventory: " + res[0].stock_qty);
								if (res[0].stock_qty >= orderResponse.quantity) {
									console.log("Processing Order...");
									processOrder(orderResponse.prodcode, orderResponse.quantity, res[0].price, res[0].stock_qty);
								} else {
									console.log("Insufficient inventory. Only " + res[0].stock_qty + " remaining in stock.");
									salesPrompt();
								}
							} else {
								console.log("Not an existing product code");
								salesPrompt();
							}
						});
					} else {
						salesPrompt();
					}
				});
		} else {
			console.log("No items on sale currently. Please check back later");
		}
	});
}

function processOrder(prod, qty, price, inventory) {
	var prodCode = prod;
	var prodQty = qty;
	var prodPrice = price;
	var prodInventory = inventory;

	// console.log("You are buying product code " + prodCode + " Quantity: " + prodQty + " at price of " + prodPrice + " existing stock: " + prodInventory);

	var saleAmount = (prodQty * prodPrice).toFixed(2);
	var newInventory = prodInventory - prodQty;

	// console.log("Sale amount: " + saleAmount + "updated inventory: " + newInventory);
	connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				stock_qty: newInventory,
				product_sales: saleAmount
			},
			{
				product_id: prodCode
			}
		],
		function (err, res) {
			if (err) throw err;
			console.log("Your order has been placed. Your card on file will be charged $ " + saleAmount);
			salesPrompt();
		}
	);
}

function salesPrompt() {
	inquirer
		.prompt([
			{
				type: "confirm",
				message: "Do you want to continue shopping? (Y/N):",
				name: "confirm2",
				default: true
			}
		])
		.then(function (shoppingResponse) {
			if (shoppingResponse.confirm2) {
				getSaleOrder();
			}
			else {
				console.log("\nThanks for shopping at Mamazon. Come back soon..\n");
				connection.end();
			}
		});
}