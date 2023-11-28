const express = require('express')
const app = express()
const port = 3001

const { v4: uuidv4 } = require('uuid');

app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const uri = "mongodb+srv://xiter53882:h6yEu01qW5YY6ESN@spotify.87jwtis.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db, usersCollection, playlistsCollection, songsCollection;

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        db = client.db('playlists');
        usersCollection = db.collection('users');
        playlistsCollection = db.collection('playlists');
        songsCollection = db.collection('songs');
    } catch (error) {
        console.dir(error);
    }
}
run();

app.get('/users', async (req, res) => {
    if (req.query.email) {
        const email = req.query.email;
        const users = await usersCollection.find({ email: email }).toArray();
        res.json(users)
    }
    else {
        const users = await usersCollection.find().toArray();
        res.json(users)
    }
});

app.get('/playlists', async (req, res) => {
    const playlists = await playlistsCollection.find().toArray();
    res.json(playlists)
});

app.get('/songs', async (req, res) => {
    const songs = await songsCollection.find().toArray();
    res.json(songs)
});

app.get('/playlists/:id', async (req, res) => {
    let id = req.params.id;
    // Check if the id is a numeric value
    if (!isNaN(id)) {
        // Convert it to a number
        id = Number(id);
    }
    const playlist = await playlistsCollection.findOne({ id: id });
    res.json(playlist);
});

app.post('/playlists', async (req, res) => {
    const playlist = req.body;
    playlist.id = uuidv4();
    const result = await playlistsCollection.insertOne(playlist);
    const newplaylist = await playlistsCollection.findOne({ _id: new ObjectId(result.insertedId) });
    res.json(newplaylist);
});

app.post('/users', async (req, res) => {
    const user = req.body;
    user.id = uuidv4();
    const result = await usersCollection.insertOne(user);
    const newuser = await usersCollection.findOne({ _id: new ObjectId(result.insertedId) });
    res.json(newuser);
});

app.put('/playlists/:id', async (req, res) => {
    const id = req.params.id;
    const playlist = req.body;
    await playlistsCollection.updateOne({ id: id }, { $set: playlist });
    res.json(playlist)
});

app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = req.body;
    await usersCollection.updateOne({ id: id }, { $set: user });
    res.json(user)
});

app.delete('/playlists/:id', async (req, res) => {
    const id = req.params.id;
    const result = await playlistsCollection.deleteOne({ id: id });
    if (result.deletedCount === 1) {
        res.json({ message: "Successfully deleted one document." })
    } else {
        res.json({ message: "No documents matched the query. Deleted 0 documents." })
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
