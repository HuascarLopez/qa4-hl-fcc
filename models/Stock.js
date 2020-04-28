const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSchema = new Schema({
  "stock": String,
  "price": String,
  "likes": Number
});

const Stock= mongoose.model("Stock", StockSchema);

module.exports.Stock = Stock;