const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const _ = require("lodash");
app.use(express.static("public"));


app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://mohit_301997:Hello@1997@cluster0.jt01a.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
    name: "Welcome to your todolist!!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "Click on the item you want to delete."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


app.set("view engine", "ejs");

app.get("/", function (req, res) {

    Item.find({}, function (err, results) {
        if (results.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully saved");
                }
            });
            res.redirect("/");

        }
        else {
            res.render("list", {
                listTitle: "Today",
                newListItems: results,

            });

        }
    });

});

app.post("/", function (req, res) {
    const addedItem = req.body.newItem;
    const listName = req.body.list;
    const itemName = new Item({
        name: addedItem
    });
    if (listName === "Today") {
        itemName.save();
        res.redirect("/");
        
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(itemName);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {

                const item = new List({
                    name: customListName,
                    items: defaultItems
                });
                item.save();
                res.redirect("/" + customListName);
            }

            else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });


});

app.post("/delete", function (req, res) {
    const checkBoxValue = req.body.checkBox;
    const listName = req.body.hiddenItem;
    if (listName === "Today") {
        Item.deleteOne({
            _id: checkBoxValue
        }, function (err) {
            if (!err) {
                console.log(err);
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkBoxValue } } }, { new: true }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);

            }
        });
    }
});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is started at port 3000");
});