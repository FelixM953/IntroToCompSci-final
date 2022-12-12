(function(){
    
    const app = document.querySelector(".app");
    const socket = io();

    let uname;
    

    document.getElementById("username").value = getCookie("username");

    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let name = app.querySelector(".join-screen #username").value;
        login(name);
    });

    app.querySelector(".join-screen #username").addEventListener('keydown', (event) => {
        var name = event.key;
        var code = event.code;
        
        if (code === "Enter") {
            let name = app.querySelector(".join-screen #username").value;
            login(name);
        }
      }, false);

    app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        let msg = app.querySelector(".chat-screen #message-input").value;
        sendMessage(msg);
    });

    app.querySelector(".chat-screen #message-input").addEventListener('keydown', (event) => {
        var name = event.key;
        var code = event.code;
        
        if (code === "Enter") {
            let msg = app.querySelector(".chat-screen #message-input").value;
            sendMessage(msg);
        }
      }, false);

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update){
        renderMessage("update", update);
    });
    socket.on("chat", function(message){
        renderMessage("message", message);
    });

    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        if(type == "message") {
            if(message.username == uname){
                message.text = message.text;
                let el = document.createElement("div");
                el.setAttribute("class", "message my-message");
                el.innerHTML = `
                    <div>
                        <div class="name">You</div>
                        <div class="text">${message.text}</div>
                    </div>
                `;
                messageContainer.appendChild(el);
            } else {
                let el = document.createElement("div");
                el.setAttribute("class", "message other-message");
                el.innerHTML = `
                    <div>
                        <div class="name">${message.username}</div>
                        <div class="text">${message.text}</div>
                    </div>
                `;
                messageContainer.appendChild(el);
            }
        }
        if(type == "update"){
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        // scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

    function login(username){
        if(username.length == 0){
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        setCookie("username", uname, 7);
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    }

    function sendMessage(message) {
        if(message.length == 0){
            return;
        }
        // renderMessage("message", {
        //     username:uname,
        //     text:message
        // });
        socket.emit("chat", {
            username:uname,
            text:message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    }

    function removeTags(str) {
        if ((str===null) || (str===''))
            return false;
        else
            str = str.toString();
        
        return str.replace( /(<([^>]+)>)/ig, '');
    }

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }

      function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

})();