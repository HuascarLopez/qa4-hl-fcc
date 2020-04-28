/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");

const mongoose = require("mongoose");
const mongo = require("mongodb");
const config = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
};

const { Stock } = require("../models/Stock");

mongoose.connect(process.env.DATABASE, config);

const fetch = require("node-fetch");

module.exports = function(app) {
  app.route("/api/stock-prices").get(async function(req, res) {
    const { stock, like } = req.query;

    if (typeof stock === "string") {
      const fetchedStock = await fetchStock(stock);
      const { symbol, price } = fetchedStock;
      const likes = like ? 1 : 0;

      Stock.findOne({ stock: symbol }, function(err, stock) {
        if (err) {
          console.log("Error");
        }

        if (stock) {
          stock.likes += likes;
          stock.save(function(err, pro) {
            if (err) {
              console.log(err);
            }
            res.json({
              stockdata: {
                stock: stock.stock,
                price: stock.price,
                likes: stock.likes
              }
            });
          });
        } else {
          const newStock = new Stock({
            stock: symbol,
            price: price,
            likes: likes
          });

          newStock.save(function(err, stock) {
            if (err) {
              console.log(err);
            }
            res.json({
              stockdata: {
                stock: stock.stock,
                price: stock.price,
                likes: stock.likes
              }
            });
          });
        }
      });
    } else {
      const fetchedStock0 = await fetchStock(stock[0]);
      const symbol0 = fetchedStock0.symbol;
      const price0 = fetchedStock0.price;
      const fetchedStock1 = await fetchStock(stock[1]);
      const symbol1 = fetchedStock1.symbol;
      const price1 = fetchedStock1.price;
      const likes = like ? 1 : 0;

      let first = {};
      let second = {};

      Stock.find({ stock: { $in: [symbol0, symbol1] } }, function(err, stocks) {
        if (err) {
          console.log("Error");
        }

        if (stocks[0]) {
          stocks[0].likes += likes;
          first = {
            stock: stocks[0].stock,
            price: stocks[0].price,
            likes: stocks[0].likes
          };
          stocks[0].save(function(err, stock) {
            if (err) {
              console.log(err);
            }
          });
        } else {
          const newStock = new Stock({
            stock: symbol0,
            price: price0,
            likes: likes
          });

          newStock.save(function(err, stock) {
            if (err) {
              console.log(err);
            }
            first = {
              stock: stock.stock,
              price: stock.price,
              likes: stock.likes
            };
          });
        }
        if (stocks[1]) {
          stocks[1].likes += likes;
          second = {
            stock: stocks[1].stock,
            price: stocks[1].price,
            likes: stocks[1].likes
          };
          stocks[1].save(function(err, st) {
            if (err) {
              console.log(err);
            }
          });
        } else {
          const newStock = new Stock({
            stock: symbol1,
            price: price1,
            likes: likes
          });

          newStock.save(function(err, stock) {
            if (err) {
              console.log(err);
            }
            second = {
              stock: stock.stock,
              price: stock.price,
              likes: stock.likes
            };
          });
        }
        res.json({
          stockdata: [
            {
              stock: first.stock,
              price: first.price,
              rel_likes: (+first.likes || 0) - (+second.likes || 0)
            },
            {
              stock: second.stock,
              price: second.price,
              rel_likes: (+second.likes || 0) - (+first.likes || 0)
            }
          ]
        });
      });
    }
  });
};

async function fetchStock(stock) {
  const response = await fetch(
    `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await response.json();
  return { symbol, price: `${latestPrice}` };
}
