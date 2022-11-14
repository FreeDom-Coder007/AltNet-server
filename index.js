const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000


// Middle Wares
app.use(cors())
app.use(express.json())


require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gijesb3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
       await client.connect()
       const AltNetDB = client.db('AltNetDB')
       const packagesCollection = AltNetDB.collection('packages')
       const reviewsCollection = AltNetDB.collection('reviews')
       
       app.post('/jwt',(req, res) => {
          const user = req.body
          const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {expiresIn: '5h'})
          res.send({token})
       })

      app.get('/packages', async(req, res) => {
         const query = {}
         const cursor = packagesCollection.find(query)
         const packages = await cursor.limit(3).toArray();
         res.send(packages)
      })
      app.get('/all-packages', async(req, res) => {
         const query = {}
         const cursor = packagesCollection.find(query)
         const allPackages = await cursor.toArray()
         res.send(allPackages) 
      })
      app.get('/package/:id', async(req, res) => {
         const id = req.params.id
         const filter = {_id: ObjectId(id)}
         const filteredPackage = await packagesCollection.findOne(filter)
         res.send(filteredPackage)
      }) 

      app.post('/packages', async(req, res) => {
         const package = req.body
         const result = packagesCollection.insertOne(package)
         res.send(result)
      })
 
      //----------------- User review api--------------------
      app.get('/reviews', async(req, res) => {
         const query = {}
         const cursor = reviewsCollection.find(query)
         const reviews = await cursor.toArray()
         res.send(reviews)
      })
      app.get('/reviews/:id', async(req, res) => {
         const id = req.params.id
         const filter = {userId: id}
         const result = await reviewsCollection.findOne(filter)
         console.log(result)
         res.send(result)
      })
      
      app.post('/reviews', async(req, res) => {
         const review = req.body
         const result = await reviewsCollection.insertOne(review)
         res.send(result)      
      })
      
      app.put('/reviews/:id', async(req, res) => {
         const id = req.params.id
         const filter = {_id: ObjectId(id)}
         const review = req.body
         const option = {upsert: true}
         const updatedReview = {
           $set: {
             comment: review.UpdatedReview
           }
         }
         const result = await reviewsCollection.updateOne(filter,updatedReview,option)
         res.send(result)  
      })

      app.delete('/reviews/:id', async(req, res) => {
         const id = req.params.id
         const query = {_id: ObjectId(id)}
         const result = await reviewsCollection.deleteOne(query)
         res.send(result)
      })

    }
    finally{}
}


run()
.catch(error => console.log(error.message))

app.get('/', (req,res) => {
    res.send('AltNet server running')
})
app.listen(port, () => {
    console.log('AltNet server running on port:', port)
})