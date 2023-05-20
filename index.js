const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000;

// middleware 
app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
app.use(express.json())

app.get('/', (req,res) => {
    res.send(`Kid's Toy House server is running `)

})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqel2bj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

// database and collection created 
    const toyCollection = client.db('toyHouseDB').collection("toyInfo");
    // data inserted into database from client side 
    app.post('/addtoys', async(req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      console.log(toys)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=> {
    console.log(`Kid's Toy House server is running on port = ${port}`)
})