const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.SEC_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Forbidden' })
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@node-mongo-server-1.pkxfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const booksCollection = client.db('books-inventory').collection('books')

        // get all item from collection 
        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = booksCollection.find(query);
            const books = await cursor.toArray();
            res.send(books);
        })
        // get limited(6) item from collection 
        app.get('/home/book', async (req, res) => {
            const query = {};
            const cursor = booksCollection.find(query).limit(6);
            const books = await cursor.toArray();
            res.send(books);
        })
        // get specific item from collection 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await booksCollection.findOne(query);
            res.send(book);
        })
        // update a specific item 
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const newItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: parseInt(newItem.quantity)
                }
            };
            const result = await booksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        // Add item
        app.post('/additem', async (req, res) => {
            const user = req.body;
            const result = await booksCollection.insertOne(user);
            res.send(result);
        })
        // delete specific item
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(query);
            res.send(result);
        })
        // get item for specific user by their email
        app.get('/myitems', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = {
                    email: {
                        $in: [email]
                    }
                };
                const cursor = booksCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            } else {
                return res.status(403).send({ message: '403, Access Forbidden' });
            }

        })
        // Auth JWT 
        app.post('/login', (req, res) => {
            const userEmail = req.body;
            const accessToken = jwt.sign(userEmail, process.env.SEC_KEY, {
                expiresIn: '1d'
            })
            res.send({ accessToken });
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("hellow books");
})

app.listen(port, () => {
    console.log("listening port", port)
})