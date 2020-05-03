const cors = require("cors");
const express = require("express");
// TODO add stripe keys
const stripe = require("stripe")("sk_test_YrJ98AYA3hii8ApjnLvPeZ3t00H1wK9mJd"); // this is a secret key
const uuid = require("uuid/v4");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.send("THE BASIC ROUTE IS WORKING");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("product", product);
  console.log("price", product.price);
  const idempotencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((error) => console.log(error));
});

//listen
app.listen(8282, () => console.log("app is listening at 8282"));
