var inquirer = require("inquirer");
var mysql = require("mysql");
var connection;


function makeConnnection() {
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "0Briekev!",
        database: "bamazon"
    })
};


function promptUser() {

    inquirer.prompt([

        //provides a list with options
        {
            type: "list",
            message: "What would you like to do?\n",
            choices: ["SEE A LIST OF PRODUCTS", "BUY SOMETHING", "QUIT"],
            name: "action"
        }

    ]).then(function (response) {

        switch (response.action) {

            case "BUY SOMETHING":
                inquirer.prompt([

                    {
                        type: "input",
                        message: "What would you like to buy?  Enter product name or ID number.",
                        name: "product",
                        validate: function (input) {
                            if (input === "" ||
                                input === undefined ||
                                input === null ||
                                input === " ") {
                                console.log("Please enter a product.")
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    },

                ]).then(function (productResponse) {

                    if (isNaN(productResponse.product)) {
                        buySomethingName(productResponse.product)
                    }
                    else {
                        buySomethingNumber(productResponse.product)
                    }
                })
                break;
            case "SEE A LIST OF PRODUCTS":
                productList();
                break;

            case "QUIT":
                cleanUp();

        }
    })
}



function buySomethingName(productName) {
    var queryString = "SELECT stock, price FROM products WHERE product_name = ?"
    connection.query(queryString, productName, function (err, res) {
        if (err) {
            console.log("Item not found.")
        }
        else {
            console.log("We have " + res[0].stock + " in stock.")
        }

        inquirer.prompt([

            {
                type: "input",
                message: "How many would you like to purchase?",
                name: "purchaseQty",
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log("Please enter a number.")
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }

        ]).then(function (qtyResponse) {
            console.log("qty: " + qtyResponse.purchaseQty)
            var purchaseQuantity = qtyResponse.purchaseQty;
            var purchasePrice = res[0].price;
            var newStock = (res[0].stock - qtyResponse.purchaseQty)
            if (newStock >= 0) {
                queryString = "UPDATE products SET stock = ? WHERE product_name = ?"
                connection.query(queryString, [newStock, productName], function (err, res) {
                    if (err) { throw err; }
                    else {
                        console.log("THANK YOU! Your order for " + qtyResponse.purchaseQty + " " + productName + " has been placed.")
                        console.log("Your order total is $" + purchaseQuantity * purchasePrice + ".\n\n")
                        promptUser();
                    }
                })
            }
            else {
                console.log("Please select a maximum quantity of " + res[0].stock + ".")
                buySomethingName(productName);
            }
        }
        )
    })
}



function buySomethingNumber(productNumber) {
    var queryString = "SELECT stock, product_name, price FROM products WHERE item_id = ?"
    connection.query(queryString, productNumber, function (err, res) {
        if (err) {
            console.log("Item not found.")
        }
        else {
            var productName = res[0].product_name
            console.log("We have " + res[0].stock + " in stock.")
        }

        inquirer.prompt([

            {
                type: "input",
                message: "How many would you like to purchase?",
                name: "purchaseQty",
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log("Please enter a number.")
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }

        ]).then(function (qtyResponse) {
            var purchaseQuantity = qtyResponse.purchaseQty;
            var purchasePrice = res[0].price;
            var newStock = (res[0].stock - qtyResponse.purchaseQty)
            if (newStock >= 0) {
                queryString = "UPDATE products SET stock = ? WHERE item_id = ?"
                connection.query(queryString, [newStock, productName], function (err, res) {
                    if (err) { throw err; }
                    else {
                        console.log("\nTHANK YOU! Your order for " + qtyResponse.purchaseQty + " " + productName + " has been placed.\n")
                        console.log("Your order total is $" + purchaseQuantity * purchasePrice + ".\n\n")
                        promptUser();
                    }
                })
            }
            else {
                console.log("Please select a maximum quantity of " + res[0].stock + ".")
                // queryString = "";
                buySomethingNumber(productNumber);
            }
        }
        )
    })
}



function productList() {
    connection.query("SELECT item_id, product_name, price FROM products WHERE stock > 0",
        function (err, res) {
            if (err) { throw err; }
            else {

                console.log("\n\nPRODUCTS\n------------------------------------\n")
                console.log("\nID         NAME                PRICE\n")
                for (i = 0; i < res.length; i++) {

                    var thisId = String(res[i].item_id);
                    var SpacerCounter = (10 - thisId.length);
                    var firstSpacer = "";

                    for (j = 0; j < SpacerCounter; j++) {
                        firstSpacer = firstSpacer + " "
                    };

                    var thisProduct = res[i].product_name;
                    var SpacerCounter = (20 - thisProduct.length);
                    var secondSpacer = "";

                    for (k = 0; k < SpacerCounter; k++) {
                        secondSpacer += " "
                    };

                    console.log("\n" + res[i].item_id + firstSpacer + res[i].product_name + secondSpacer + "$" + res[i].price)
                }
                console.log("\n\n")
                promptUser();
            }
        })
    return;
}



function cleanUp() {
    connection.end()
};


// promtUser()
makeConnnection();

promptUser()
// cleanUp();