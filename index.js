const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;

const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@node-mongo-server-1.pkxfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("books-inventory").collection("books");

    if (err) {
        console.log("IN THE", err)
    } else {
        console.log("DB connected");
    }
    // perform actions on the collection object
    client.close();
});


app.get('/', (req, res) => {
    res.send("hellow books");
})

app.listen(port, () => {
    console.log("listening port", port)
})