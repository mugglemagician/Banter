if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Room = require('./Models/Room');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const User = require('./Models/User');
const methodOverride = require('method-override');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const roomsRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');
const apiRoutes = require('./routes/apis');

const flash = require('connect-flash');

const app = express();
// http requests will be handled by express
const server = http.createServer(app);
// websocket requests will be handled by socketIo
const io = socketIo(server);

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/chatAppDemo';
const secret = process.env.SECRET || "Notagoodsecret";

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

const sessionConfig = {
    name: "session",
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};



app.use(methodOverride('_method'));
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionConfig)); // this must be here before the passports session as passport adds on this session
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(passport.initialize());


app.use(passport.session()); // we need this for persistent login sessions as passport adds some methods and things onto the session

passport.use(new LocalStrategy(User.authenticate())); // static method added by local-passport-mongoose onto the User model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    if (req.query.flash) {
        req.flash('error', req.query.flash);
        return res.redirect('/rooms');
    }

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

mongoose.connect(dbURL)
    .then(() => {
        console.log("Database Connected !");
    })
    .catch(err => {
        console.log("Connection Failed !");
    });


app.get('/', (req, res) => {
    res.render('Home');
});

app.use('/api/', apiRoutes);
app.use('/rooms', (req, res, next) => {
    req.io = io;
    next();

}, roomsRoutes);
app.use('/', userRoutes);

app.all('/*', (req, res) => {
    res.render('404');
});

app.use((err, req, res, next) => {
    req.flash('error', 'Try Again !');
    res.redirect('/rooms');
});

const HandleWebSocketRequests = () => {
    io.on('connection', (socket) => {
        console.log("User Connected !");

        socket.on('disconnect', async () => {
            console.log("User disconnected !");
            const room = await Room.findById(socket.roomId);
            if (!room) return;
            if (!socket.IsConnected) return;
            room.totalConnected -= 1;
            await room.save();
            io.to(socket.roomId).emit('userDisconnected', room.totalConnected);
        });

        socket.on('chatMessage', async (message) => {
            if (!socket.IsConnected) {
                socket.emit('redirect', 'http://localhost:3000/rooms');
                socket.disconnect(true);
                return;
            }
            const data = { userId: socket.userId, socketId: socket.id, username: socket.username, message };
            const room = await Room.findById(socket.roomId);
            room.oldMessages.push(data);
            if (room.oldMessages.length > 50) {
                room.oldMessages.shift();
            }
            await room.save();
            io.to(socket.roomId).emit('chatMessage', data);
        });

        socket.on('clientInfo', async (data) => {
            const { userId, username, roomId } = data;
            socket.join(roomId);
            socket.roomId = roomId;
            socket.username = username;
            socket.userId = userId;
            socket.IsConnected = true;

            const room = await Room.findById(socket.roomId);
            if (!room) {
                socket.emit('roomDeleted', req.baseUrl + `/rooms`);
                return;
            }
            room.totalConnected += 1;
            await room.save();
            io.to(roomId).emit('userConnected', room.totalConnected);
            const oldMessages = room.oldMessages;
            socket.emit('oldMessages', oldMessages);
        });
    });
}

HandleWebSocketRequests();

server.listen(3000, () => {
    console.log("Server Started !");
});

