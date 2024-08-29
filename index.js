const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

//console.log(process.env.DB_USER);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8dcgz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("CoffeDB");
    const coffeeCollection = database.collection("coffe");

    app.post("/coffe", async (req, res) => {
      const coffe = req.body;
      console.log(coffe);
      const result = await coffeeCollection.insertOne(coffe);
      res.send(result);
    });

    app.get("/coffe", async (req, res) => {
      const coffees = await coffeeCollection.find().toArray(); // Retrieve all coffee documents
      res.send(coffees);
    });

    app.get("/coffe/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffe = await coffeeCollection.findOne(query);
      res.send(coffe);
    });

    app.put("/coffe/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffe = req.body;
      console.log(updatedCoffe);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }; // Do not insert if user doesn't exist

      const updateDoc = {
        $set: {
          name: updatedCoffe.name,
          quantity: updatedCoffe.quantity,
          supplier: updatedCoffe.supplier,
          taste: updatedCoffe.taste,
          category: updatedCoffe.category,
          details: updatedCoffe.details,
          photo: updatedCoffe.photo,
        },
      };

      const result = await coffeeCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/coffe/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello express");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
