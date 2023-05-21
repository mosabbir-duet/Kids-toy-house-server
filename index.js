const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000;

// middleware 
// app.use(cors());

// app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))

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

    // creating index on toyName field 
    const indexKey = {toyName: 1};
    const indexOptions = {name : 'toy'};
// Index created 
    const result = await toyCollection.createIndex(indexKey, indexOptions)
    
// data search method 
    app.get("/searchByToyName/:text", async(req,res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          {toyName: {$regex: searchText, $options: 'i'}}
        ],
      }).toArray()
      res.send(result)
    })

    // data inserted into database from client side 
    app.post('/addtoys', async(req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      console.log(toys)
      res.send(result)
    })

    // data fetch from database and access form client side using get method 
    app.get('/alltoys', async(req, res) => {
      const result = await toyCollection.find().limit(20).toArray()
      res.send(result);
    })

    app.get('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })
    app.get('/update/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })
// data fetch depend on email 
    app.get('/mytoys', async(req, res) => {
      // const userEmail =req.params.email;
      let query = {}
      if(req.query?.email) {
        query = {sellerEmail: req.query.email}
      }
      const result = await toyCollection.find(query).toArray()
      res.send(result)
    })

    // data delete 

    app.delete('/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/alltoys/:text', async(req,res) => {
      console.log(req.params.text)
      if(req.params.text == 'Marvel' || req.params.text == 'Star Wars' || req.params.text == 'Transformers') {
        const result = await toyCollection.find({subCategory: req.params.text}).toArray()
        res.send(result);
      }
    })
    

    app.put('/:id', async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options ={upsert: true};
      const updateToy = req.body;
      const toy = {
        $set: {
          sellerName: updateToy.sellerName,
          sellerEmail: updateToy.sellerEmail,
          toyName: updateToy.toyName,
          toyPrice: updateToy.toyPrice,
          message: updateToy.message,
          quantity: updateToy.quantity,
          subCategory:updateToy.subCategory,
          ratings: updateToy.ratings,
          toyImageUrl: updateToy.toyImageUrl

        }
      }
      const result = await toyCollection.updateOne(filter,toy,options)
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