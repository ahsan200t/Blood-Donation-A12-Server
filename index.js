const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//Must remove "/" from your production URL
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5000'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());
// app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ouoa8yh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();
        const donationRequestCollection = client.db('bloodDonationDb').collection('donationRequest');
        // Auth Related Api
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '365d',
        //     })
        //     res.cookie('token', token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //         })
        //         .send({ success: true })
        // })
        // // Logout
        // app.get('/logout', async (req, res) => {
        //     try {
        //         res.clearCookie('token', {
        //                 maxAge: 0,
        //                 secure: process.env.NODE_ENV === 'production',
        //                 sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //             }).send({ success: true })
        //         console.log('Logout successful')
        //     } catch (err) {
        //         res.status(500).send(err)
        //     }
        // })

        // Donation Request Related Api
        app.post('/donation-request', async (req, res) => {
            const requestData = req.body;
            const result = await donationRequestCollection.insertOne(requestData);
            res.send(result)
        })
        // get all request for donor
        app.get('/my-request/:email', async (req, res) => {
            const email = req.params.email;
            let query = { 'donor.email': email };
            const result = await donationRequestCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/my-recent-request/:email', async (req, res) => {
            const email = req.params.email;
            let query = { 'donor.email': email };
            const result = await donationRequestCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/donation-request', async (req, res) => {
            const request = req.body;
            const result = await donationRequestCollection.find(request).toArray();
            res.send(result)
        })

        // Donation Details Get
        app.get('/donation-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await donationRequestCollection.findOne(query);
            res.send(result);
        })
        // Donation Request Update
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedRequest = req.body;
            const request = {
                $set:{
                    recipient: updatedRequest.recipient,
                    district: updatedRequest.district,
                    upazila: updatedRequest.upazila,
                    date: updatedRequest.date,
                    donor: updatedRequest.donor,
                    status: updatedRequest.status,

                }
            }
            const result = await donationRequestCollection.updateOne(filter,request,options);
            res.send(result)
        })

        app.get('/update/:id', async(req,res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await donationRequestCollection.findOne(query);
            res.send(result);
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



app.get('/', (req, res) => {
    res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Running on port: ${port}`)
})
