const express = require('express');
const app = express();
const port = 8000;
const db=require('./config/mongoose');

// Used for session cookie
const session=require('express-session');
const passport=require('passport');
const passportLocal=require('./config/passport-local-strategy');

// Added passport-jwt
const passportJWT=require('./config/passport-jwt-strategy');

// Added google oauth
const passportGoogle=require('./config/passport-google-oauth2-strategy');

const MongoStore=require('connect-mongo')(session);

const cookieParser=require('cookie-parser');
const flash=require('connect-flash');
const customMware=require('./config/middleware');

// Set up the chat server to be used with socket.io
const chatServer=require('http').Server(app);
const chatSockets=require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is listening on the port 5000');


// Added sass middleware
const sassMiddleware=require('node-sass-middleware');
app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));

// used for encoding POST request
app.use(express.urlencoded());

// used cookie as middleware
app.use(cookieParser());

// included layouts library
const expressLayouts=require('express-ejs-layouts');
app.use(expressLayouts);

// Extracted our style and script tag from sub-pages and put it into head of layout page
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

// Given access or set path for static files
app.use(express.static('./assets'));
// Make the uploads path available to the browser
app.use('/uploads',express.static(__dirname + '/uploads'));

// Setting up view engine
app.set('view engine','ejs');
app.set('views','./views');

app.use(session({
    name: 'connecti',
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: new MongoStore({
        mongooseConnection: db,
        autoRemove: 'disabled'
    },
    function(err){
        console.log(err || 'Connect-mongodb setup ok');
        
    }
    )
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(customMware.setFlash);

app.use(passport.setAuthenticatedUser);

// Used express router
app.use('/',require('./routes'));

app.listen(port, function (err) {
    if (err) {
        console.log(`Error in running tha server: ${err}`);
    }
    console.log(`Server is running on port: ${port}`);
}); 
