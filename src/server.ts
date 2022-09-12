import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import sampleRoutes from './routes/sample';

const NAMESPACE = 'Server';
//router defines api behavor and namespace is what we use to determin where out logs are coming from
const router = express();

/** Logging the request */
router.use((req, res, next) => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
    });

    next();
});

// parse the request
// allows us to send nested json to our api
// bodyparser allows us to not have to call json.parse or use json stringify on the react side, takes care of all that for us.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//rules of our API
router.use((req, res, next) => {
    //means our request can come from anywhere, when creating production api, do not use this, make sure you have you ips and routes pre-defined.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');


    //if method = to options
    //prob wont get called but always good to have this.
    if(req.method == 'OPTIONS')
    {
        //return a header that shows us all of the options we're allowed to put.
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        //returns response of 200 which means method was accepted and send an empty json object.
        return res.status(200).json({});
    }
    //so far the request is going to bounce off our logging, bounce off the bodyparser, and then come thru here, all of the acting as pieces of middleware.
    next();
});


//Routes//
router.use('/sample', sampleRoutes);


// Error Handling //
//
// if our api gets by all our defined routes, means the user or program 
// has entered a route that doesnt actually exist
//
// make da middleware
router.use((req,res, next) => {
    // make a new error, not found
    const error = new Error('not found');

    // returns 404 response code
    return res.status(404).json({
        // comes with a message key with the error message that we define above.
        message: error.message
    });
});

// Create The Server //
// make object = to http.createServer method and inject router into it. Router contains all predefined roots and error handling middleware.
const httpServer = http.createServer(router);
//we listen to the port which we set in the config file. Then we add a logging statement saying we turned on the server.
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`));

