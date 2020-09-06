//Added type: module to the package.json so I can use ES6 import syntax
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

//Application instance with express
const app = express();
const PORT = process.env.PORT || 3000 ;

//Adding pusher middle ware, code was provided
const pusher = new Pusher({
    appId: '1067635',
    key: 'c6cd4ce4f99d732a9c3b',
    secret: 'b6552e8f09367564a057',
    cluster: 'ap1',
    encrypted: true
});
  

//Middleware
app.use(express.json());
app.use(cors())


//Connecting to mongoDB, storing connection string in constant
const connection_url = 'mongodb+srv://admin:fxON0m3ED9CsEyXc@cluster0.oftdf.mongodb.net/whatsapp-server?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,//parse the url
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.once('open', () => {
    console.log('db is connected')

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
    console.log('A change occured', change);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received
                });
        } else {
            console.log('error triggering pusher')
        }
    });
});

// ?????

//Server called with get method, using international status code 200 so I know everything is working OK
app.get('/', (req, res) => res.status(200).send('hello world'));

//API ROUTES
app.get('/messages/sync', (req,res) => {
    //Using .find function to get all messages
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    });
});

//Using post method for api end point, posts new messages
app.post('/messages/new', (req, res) => {
    //Passing message structure in the request body
    const dbMessage = req.body

    //Saving dbMessage constant inside Messages, using mongoose to create a new message using the data sent in the req.body in the dbMessage constant
    Messages.create(dbMessage, (err, data) => {
        //Handling errors
        if (err) {
            //Status 500 is internal server error
            res.status(500).send(err)
        } else {
            //Sttus 201 means that created is OK
            res.status(201).send(`new message created: \n ${data}`)
        }
    });
});

//Listening
app.listen(PORT, () => console.log(`Listening on localhost${PORT}`));