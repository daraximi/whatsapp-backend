//importing
import express, { request, response } from 'express'; 
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import Cors from 'cors';




//app config
const app = express();
const port = process.env.PORT || 9000
const pusher = new Pusher({
    appId: "1547769",
    key: "3fffe69bddee4216f2fa",
    secret: "27e90eb3c52bf55fe034",
    cluster: "mt1",
    useTLS: true
    });


//middlewares
app.use(express.json());
//cors package gives us headers in our requests instead of the code snippet below
app.use(Cors());


/*
app.use((request,response,next)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
*/


//DB config 
const connection_url = 'mongodb+srv://daraximi:dRzBTXqNAXpMlSuY@cluster0.4kobi0z.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(connection_url);

const db = mongoose.connection;

db.once("open", ()=> {
    console.log("DB Connected");
    const msgCollection = db.collection('messagecontents');

    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) =>
    {
        console.log("A change occurred", change);

        if(change.operationType ==='insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
            {
                name:messageDetails.name,
                message: messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received
            })
        }
    });

});


//????

//api routes
app.get('/', (request, response)=> response.status(200).send('Hello world'));


app.get('/messages/sync', (request, response)=>{
    Messages.find((err,data) => {
        if(err){
            response.status(500).send(err);
        }
        else{
            response.status(200).send(data);
        }
    })
})



app.post('/messages/new', (request, response) => {
    const dbMessage = request.body;

    Messages.create(dbMessage, (err, data)=>{
        if(err){
            response.status(500).send(err);
        }
        else{
            response.status(201).send(`new message created: \n ${data}`);
        }
    })
})


//listener
app.listen(port, ()=> console.log(`Listening on localhost:${port}`));
