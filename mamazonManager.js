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
	managerMenu();
});

function managerMenu() {
	inquirer
		.prompt([
			{
				type: "list",
				message: "What do you want to do? ",
				choices: ["View Products for Sale",
					"View Low Inventory",
					"Add to Inventory",
					"Add New Product"],
				name: "choice"
			}
		])
		.then(function (inquirerResponse) {
			console.log(inquirerResponse.choice);
			if (inquirerResponse.choice === "View Products for Sale") {
				viewProducts();
			} else if (inquirerResponse.choice === "View Low Inventory") {
				lowInventory();
			} else if (inquirerResponse.choice === "Add to Inventory") {
				addInventory();
			} else if (inquirerResponse.choice === "Add New Product") {
				addProduct();
			}
		});
}

function viewProducts() {
	// console.log("Viewing Product list");
	connection.query("SELECT department_name AS 'Department', product_name AS 'Product', product_id AS 'Product Code', price AS 'Price', stock_qty AS 'Quantity' FROM products ORDER BY 1,2,3 ASC", function (err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		if (res.length > 0) {
			console.log("Following are the available items");
			console.table(res);
		} else {
			console.log("No items listed currently. Please go back to main menu to add items.");
		}
		confirmExit();
	});
}

function lowInventory() {
	// console.log("Viewing Low Inventory");
	connection.query("SELECT department_name AS 'Department', product_name AS 'Product', product_id AS 'Product Code', price AS 'Price', stock_qty AS 'Quantity' FROM products WHERE stock_qty < 5 ORDER BY 1,2,3 ASC", function (err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		if (res.length > 0) {
			console.log("Following items are running low");
			console.table(res);
		} else {
			console.log("Stock looks good. Nothing running low currently");
		}
		confirmExit();
	});
}

function addInventory() {
	console.log("Add Inventory");
	connection.query("SELECT department_name AS 'Department', product_name AS 'Product', product_id AS 'Product Code', price AS 'Price', stock_qty AS 'Quantity' FROM products ORDER BY 1,2,3 ASC", function (err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		if (res.length > 0) {
			console.log("You can add to inventory of following items");
			console.table(res);
			inquirer
				.prompt([
					{
						type: "input",
						message: "Enter the product code that you want to add inventory to:",
						name: "prodcode"
					},
					{
						type: "input",
						message: "How many units do you want to add?",
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
						connection.query("SELECT stock_qty FROM products where product_id=?", [orderResponse.prodcode], function (err, res) {
							if (err) {
								throw err;
							}
							if (res.length > 0) {
								// console.log("Existing inventory: " + res[0].stock_qty);
								if (parseInt(orderResponse.quantity) > 0) {
									console.log("Adding to inventory...");
									updateStock(orderResponse.prodcode, orderResponse.quantity, res[0].stock_qty);
								} else {
									console.log("Quantity cannot be 0 or any lesser!");
									confirmExit();
								}
							} else {
								console.log("Not an existing product code");
								confirmExit();
							}
						});
					} else {
						confirmExit();
					}
				});
		} else {
			console.log("No items listed currently. Please go back to main menu to add items.");
			confirmExit();
		}
	});
}

function addProduct() {
	console.log("Add new product");
	confirmExit();
}

function confirmExit() {
	inquirer
		.prompt([
			{
				type: "confirm",
				message: "Do you want to manage anything else now? (Y/N):",
				name: "confirm",
				default: true
			}
		])
		.then(function (managerResponse) {
			if (managerResponse.confirm) {
				managerMenu();
			}
			else {
				console.log("\nThanks. Come back later if you need to manage anything.\n");
				connection.end();
			}
		});
}

function updateStock(prod, qty, inventory) {
	var prodCode = prod;
	var prodQty = qty;
	var prodInventory = inventory;
	var newInventory = 0;

	console.log("You are adding to product code " + prodCode + " Quantity: " + prodQty + " existing stock: " + prodInventory);

	newInventory = parseInt(prodInventory) + parseInt(prodQty);

	console.log("Updating inventory... " );
	connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				stock_qty: newInventory
			},
			{
				product_id: prodCode
			}
		],
		function (err, res) {
			if (err) throw err;
			console.log("Inventory has been updated to " + newInventory + " for product code " + prodCode);
			confirmExit();
		}
	);
}