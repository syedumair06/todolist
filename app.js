//jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-umair:umair12345678@cluster0.qwwotth.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const listsSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listsSchema);

const item1 = new Item({
  name: "Welcome to your todo list!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item ",
});

const defaultItems = [item1, item2, item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", (req, res) => {
  Item.find()
    .then(function (Data) {
      if (Data.length === 0) {
        Item.insertMany(defaultItems)
          .then(console.log("Succesfully inserted default items to DB"))
          .catch((err) => console.log(err));
        res.redirect("/")
      } else {
        res.render("list", { newListItems: Data, listTitle: "Today" });
      }
    })
    .catch((err) => console.log(err))
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        // if(foundList.length === 0){
        //   List.deleteMany({found})
        //   List.insertMany(defaultItems).then(console.log("inserted")).catch((err)=>console.log(err))
        //   res.redirect("/"+customListName);
        // } else{
        // }
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});  
      }
    })
    .catch((err) => console.log(err));
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if( listName ==="Today" ){

    Item.deleteOne({ _id: checkedItemId })
    .then(function()

    {console.log("Succesfully deleted selected task")
    res.redirect("/")})
    
    .catch((err) => console.log(err));
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
      res.redirect("/" + listName);
      console.log("Succesfully deleted");
    });
  }
});


app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
