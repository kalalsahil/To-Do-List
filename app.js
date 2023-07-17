// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to to-do list"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<--- Hit this to delete this item."
});

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List",listSchema);
const defaultItems = [item1,item2,item3];

app.get("/", function(req,res){
    Item.find().then(function(items){
        if(items.length===0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Default Data inserted")  // Success
                }).catch(function(error){
                console.log(error)      // Failure
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: "Today", newItems: items});
        }
    });
});

app.get("/:CustomListName",function(req,res){
    const CustomListName = _.capitalize(req.params.CustomListName);

    List.findOne({name: CustomListName}).then(function(data){
        if(!data){
            const list = new List({
                name: CustomListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+CustomListName);
        }
        else{
            res.render("list",{listTitle: data.name, newItems: data.items});
        }
    })
    

});

app.get("/about",function (req,res) {
    res.render("about");
});

// app.post("/work",function(req,res){
//     let item = req.body.item;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.post("/",function(req,res){
    const data = req.body.item;
    const listName = req.body.list;
    const newData = new Item({
        name: data
    });
    if(listName==="Today"){
        newData.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(newData);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete", function(req,res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItem).then(function(){
            console.log("Deleted Successfully");
            res.redirect("/");
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItem}}}).then(function(foundItem){
            if(foundItem){
                res.redirect("/"+listName);
            }
        });
    }
});

app.listen(3000, function(){
    console.log("Server Started at port 3000.");
})