const express = require("express");
const { readFile } = require("fs");
const path = require("path");
const {
    socket
} = require("server/router");

// init vars
const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

const csv = require('ya-csv');
const w = csv.createCsvFileWriter('messages.csv', {
    'flags': 'a'
});

const port = 5000;

let timeSinceLastMessage = {};
let spamList = {};
let users = {}

// set default page
app.use(express.static(path.join(__dirname + "/public")));


io.on("connection", function(socket) {
    // join event
    socket.on("newuser", function(username) {
        if (doesExist(users, username)) {
            console.log("kicked!");
            socket.emit("update", "Disconnected, pick an avalable username")
            socket.disconnect();
        }
        else{
        users[socket] = removeTags(username);
        socket.broadcast.emit("update", username + " joined the conversation");
        }
    });
    // on exit
    socket.on("exituser", function(username) {
        //socket.broadcast.emit("update", username + " left the conversation");
        socket.disconnect('left the chat');
    });
    // on message receive
    socket.on("chat", function(message) {
        let address = socket.handshake.address;
        let time = new Date();
        data = {
            user: address,
            name: message.username,
            date: time,
            text: message.text
        };
        // console.log(data);
        saveMessage(data);

        // check for message spamming
        if (checkForSpam(socket)) {
            socket.broadcast.emit("update", message.username + " kicked for spam");
            socket.emit("update", "You were kicked for spamming");
            socket.disconnect('spam');
        } else {
            message.text = removeTags(message.text);
            io.emit("chat", message);
        }
    });
    // on disconnect
    socket.on("disconnect", function() {
        socket.broadcast.emit("update", users[socket] + " left the conversation");
        users[socket] = null;
    });
});

//helper functions

// check for existing value in object (dictionary)
const doesExist = (obj, value) => {
    for (let key in obj) {
      if (obj[key] === value) {
        return true;
      }
    }
    return false
  }
// removes html tags from messages to prevent insertion of js code
function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    return str.replace(/(<([^>]+)>)/ig, '');
}
// saves a message to a csv file
function saveMessage(dict) {
    var d = [];
    for (key in dict) {
        if (typeof dict[key] !== 'function') {
            d.push(dict[key]);
        }
    }
    w.writeRecord(d);
}
// checks for message spam
function checkForSpam(user) {
    const minMessageTime = 1000;
    const spamTolerence = 5;

    let currentTime = new Date().getTime();
    let prevTime = timeSinceLastMessage[user];

    timeSinceLastMessage[user] = currentTime

    let deltaTime = currentTime - prevTime;
    if (deltaTime < minMessageTime) {
        spamList[user] += 1;
    } else {
        spamList[user] = 0;
    }
    // console.log(spamList[user]);
    if (spamList[user] > spamTolerence) {
        // console.log("kicked");
        return true;
    }
    return false;
}

server.listen(port);