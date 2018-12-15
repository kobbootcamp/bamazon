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
            choices: ["VIEW CATELOG", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT", "QUIT"],
            name: "action"
        }

    ]).then(function (response) {

        switch (response.action) {

            case "VIEW LOW INVENTORY":
                inquirer.prompt([

                    {
                        type: "input",
                        message: "Enter inventory level (number):",
                        name: "stockLevel",
                        validate: function (input) {
                            if (isNaN(input)) {
                                console.log("Please enter a number.")
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    },

                ]).then(function (stockLevelResponse) {
                    lowInventoryList(stockLevelResponse.stockLevel);
                })
                break;
            case "VIEW CATELOG":
                productList();
                break;

            case "ADD TO INVENTORY":
                inquirer.prompt([

                    {
                        type: "input",
                        message: "Enter ID number:",
                        name: "idNumber",
                        validate: function (input) {
                            if (isNaN(input)) {
                                console.log("Please enter a number.")
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    },



                ]).then(function (addInventoryResponse) {
                    addToInventory(addInventoryResponse.idNumber);
                })
                break;


            case "ADD NEW PRODUCT":
                addNewProduct();
                break;

            case "QUIT":
                cleanUp();

        }
    })
}




function addNewProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "Department:",
            name: "dept_name",
            validate: function (input) {
                if (input === "" ||
                    input === undefined ||
                    input === null ||
                    input === " ") {
                    console.log("Please enter a department name.")
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        {
            type: "input",
            message: "Product Name:",
            name: "product_name",
            validate: function (input) {
                if (input === "" ||
                    input === undefined ||
                    input === null ||
                    input === " ") {
                    console.log("Please enter a product name.")
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        {
            type: "input",
            message: "Price:",
            name: "price",
            validate: function (input) {
                if (isNaN(input)) {
                    console.log("Please enter a number.")
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        {
            type: "input",
            message: "Starting inventory:",
            name: "stock",
            validate: function (input) {
                if (isNaN(input)) {
                    console.log("Please enter a number.")
                    return false;
                }
                else {
                    return true;
                }
            }
        },

    ]).then(function (response) {
        var productPrice = parseFloat(response.price)
        var productInv = parseInt(response.startingInventory)
        queryString = "INSERT INTO products SET ?"
        connection.query(queryString, response,function (err, res) {
                if (err) { throw err; }
                else {
                    console.log("\n" + response.product_name + " has been added to inventory.\n\n")
                    promptUser();
                }
            })
    }
    )
}




function addToInventory(id) {
    var queryString = "SELECT stock, product_name FROM products WHERE item_id = ?"
    connection.query(queryString, id, function (err, res) {
        if (err) {
            console.log("Item not found.")
        }
        else {
            var productName = res[0].product_name;
            console.log("We currenlty have " + res[0].stock + " unit of " + res[0].product_name + " in stock.")
        }

        inquirer.prompt([

            {
                type: "input",
                message: "Enter amount to add to inventory (number):",
                name: "addInventory",
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log("Please enter a number.")
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },

        ]).then(function (qtyResponse) {
            var currentInventory = res[0].stock;
            var newInventory = parseInt(currentInventory) + parseInt(qtyResponse.addInventory);

            queryString = "UPDATE products SET stock = ? WHERE item_id = ?"
            connection.query(queryString, [newInventory, id], function (err, res) {
                if (err) { throw err; }
                else {
                    console.log("\n" + productName + " inventory level has been updated to " + newInventory + ".\n\n")
                    promptUser();
                }
            })
        }
        )
    })
}



function lowInventoryList(inventoryLevel) {
    var queryString = "SELECT item_id, dept_name, product_name, price, stock FROM products WHERE stock <= ?"
    connection.query(queryString, inventoryLevel, function (err, res) {
        if (err) { throw err; }
        else {

            console.log("\n\nPRODUCTS\n------------------------------------\n")
            console.log("\nID        DEPT                NAME                INVENTORY\n")
            for (i = 0; i < res.length; i++) {

                var thisId = String(res[i].item_id);
                var SpacerCounter = (10 - thisId.length);
                var firstSpacer = "";

                for (j = 0; j < SpacerCounter; j++) {
                    firstSpacer = firstSpacer + " "
                };

                var thisDept = res[i].dept_name;
                var SpacerCounter = (20 - thisDept.length);
                var secondSpacer = "";

                for (k = 0; k < SpacerCounter; k++) {
                    secondSpacer += " "
                };

                var thisProduct = res[i].product_name;
                var SpacerCounter = (20 - thisProduct.length);
                var thirdSpacer = "";

                for (l = 0; l < SpacerCounter; l++) {
                    thirdSpacer += " "
                };

                console.log("\n" + res[i].item_id + firstSpacer + res[i].dept_name + secondSpacer + res[i].product_name +
                    thirdSpacer + res[i].stock)
            }
            console.log("\n\n")
            promptUser();
        }
    })
    return;
}







function productList() {
    connection.query("SELECT item_id, product_name, price, stock FROM products WHERE stock > 0",
        function (err, res) {
            if (err) { throw err; }
            else {

                console.log("\n\nPRODUCTS\n-------------------------------------------------------------\n")
                console.log("\nID         NAME              STOCK                PRICE\n")
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

                    var thisStock = String(res[i].stock);
                    var SpacerCounter = (20 - thisStock.length);
                    var thirdSpacer = "";

                    for (l = 0; l < SpacerCounter; l++) {
                        thirdSpacer += " "
                    };

                    console.log("\n" + res[i].item_id + firstSpacer + res[i].product_name + secondSpacer +
                        res[i].stock + thirdSpacer + "$" + res[i].price)
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