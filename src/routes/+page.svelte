<!--@component -->

<!--
@component
This is a chat prototype built with sveltekit, typescript and socketio
as a demonstration project.
-->
<script lang="ts">
    import io from 'socket.io-client'
    import { onMount } from 'svelte';

    const socket = io('/')

    interface ChatMessage  {
        content: string;
        type: string;
    }

    /** Used to store chat messages */
    let chatMessages: Array<ChatMessage> = [];
    /** Used to store active users in the chat */
    let activeUsers: Array<string> = [];
    /** Used to store a user's chat message */
    let message: string = '';
    /** Used to store the user's nickname */
    let nick: string;
    /** Used to store the user's old nickname */
    let nickOld: string;
    /** Used to reference the chat message input element */
    let inputMsg: any;
    /** Used to store a chat message input buffer with older chat messages */
    let inputBuffer: Array<string> = [];
    /** Used to store the current chat message input buffer index */
    let inputBufferIndex: number = -1;
    /** Used to store a boolean to show or hide an element */
    let show: boolean = true;
    /** Used to store an array of tips for the chat usage */
    const tips: Array<string> = [
        '/nick new-nickname',
        '/help',
        '/me message',
        '/whois nickname',
        '/pvt nickname message',
        '/quit message (optional)',
    ]
    /** Used to store the current tips array index */
    let tipIndex: number = 0;    

    onMount(async () => {
        /** Initial nickname to be evaluated by the server */
        nick = `Guest1`;
        /** Emits socketio 'join' event to the server */
        socket.emit('join', nick)
        /** Sets an interval to set and reset the tips array index 
         * and keep showing different tips to the user */
        setInterval(() => {
            if (tipIndex === tips.length - 1) tipIndex = -1;
            tipIndex++;
        }, 1000 * 10);
	});

    /** Sets nick and nickOld variables from the nickname provided by the server */
    socket.on('nick', (data) => {
        nick = nickOld = data.nick;
    })
    /** Sets the array of active users */ 
    socket.on('users', (data) => {
        activeUsers = [...data.users]
    })
    /** Updates the chat messages */ 
    socket.on('chat-msg', (data) => {
        chatMessages = [{ content: data.message, type: data.type }, ...chatMessages];
    })
    /** Keeps the old nickname when the nickname's input is focused */
    const handleNickFocus = () => {
        nickOld = nick;
    }
    /** Handles nickname change;
     *  Emits the socketio 'nick' event with new nickname */
    const handleNickChange = () => {
        nick = nick.split(' ')[0]
        if (nick === '') {
            nick = nickOld
            return
        }
        if (nick !== nickOld) {
            nickOld = nick
            socket.emit('nick', { nick })
            inputMsg.focus()
        }
    }
    /** Allow users to navigate through older messages with up and down arrows */
    const handleInputBuffer = (e: any) => {
        if (e.key === "ArrowUp") {
            if (inputBufferIndex >= inputBuffer.length - 1) return
            inputBufferIndex++
            message = inputBuffer[inputBufferIndex]
            inputMsg.blur()
            inputMsg.focus()
        }
        if (e.key === "ArrowDown") {
            if (inputBufferIndex < 0) {
                message = '';
                return;
            }
            inputBufferIndex--
            message = inputBuffer[inputBufferIndex]
            inputMsg.blur()
            inputMsg.focus()
        }
    }
    /** Handles special messages starting with '/' as commands */
    const handleCommand = (command: Array<string>) => {
        switch (command[0]) {
            case 'pvt':
                if (command.length < 2) {
                    chatMessages = [{ content: `* syntax error: usage: /pvt nickname message`, type: 'error' }, ...chatMessages]
                    return
                }
                const separatorIndex = command[1].indexOf(' ');
                if (separatorIndex === -1) {
                    chatMessages = [{ content: `* syntax error: usage: /pvt nickname message`, type: 'error' }, ...chatMessages]
                    return
                }
                let to = command[1].slice(0, separatorIndex);
                let message = command[1].slice(separatorIndex + 1);
                socket.emit('pvt', { to, message })
                break;
            case 'whois':
                if (command.length < 2) {
                    chatMessages = [{ content: `* syntax error: usage: /whois nickname`, type: 'error' }, ...chatMessages]
                    return;
                }
                socket.emit('whois', { nick: command[1] })
                break;
            case 'nick':
                if (command.length < 2) {
                    chatMessages = [{ content: `* syntax error: usage: /nick newNickname 'no spaces'`, type: 'error' }, ...chatMessages]
                    return;
                }
                nickOld = nick;
                nick = command[1];
                handleNickChange();
                break;
            case 'quit':
                socket.emit('quit', { message: command[1] })
                show = false;
                break;
            case 'me':
                if (command.length !== 2) {
                    chatMessages = [{ content: `* syntax error: usage: /me message`, type: 'error' }, ...chatMessages]
                    return;
                }
                socket.emit('chat-action', { nick, message: command[1] })
                break;
            case 'help':
                chatMessages = [{ content: `* help:`, type: 'system' }, ...chatMessages]
                for (let index = 0; index < tips.length; index++) {
                    const element = tips[index];
                    chatMessages = [{ content: `  ${element}`, type: 'system' }, ...chatMessages]
                }
                break;
            default:
                chatMessages = [{ content: `* unknown command '${command[0]}'`, type: 'error' }, ...chatMessages]
                break;
        }
    }
    /** Handles the input for sending messages;
     *  Identifies command messages or normal messages;
     *  Emits a socketio 'chat-msg' event to the server
     */
    const handleMessage = () => {
        if (message.charAt(0) === '/') {
            let commandStr = message.substring(1); // removing "/"
            const separatorIndex = commandStr.indexOf(' ');
            if (separatorIndex === -1) {
                const command = [ commandStr ];
                handleCommand(command);
            } else {
                let arg1 = commandStr.slice(0, separatorIndex);
                let arg2 = commandStr.slice(separatorIndex + 1);
                const command = [ arg1, arg2 ];
                handleCommand(command);
            }
            inputBuffer.unshift(message);
            inputBufferIndex = -1;
            message = ''
            return
        }
        if (message.trim() === '') return
        socket.emit('chat-msg', { nick, message })
        inputBuffer.unshift(message)
        inputBufferIndex = -1;
        message = ''
    }
</script>
<main>
    <div id="chat-box">
        <h1>Chat Demo</h1>
        <div id="chat">
            <div id="chat-messages">
                <div class="chat-box-title">chat messages</div>                
                <div id="chat-messages-scroll">
                    {#each chatMessages as chatMessage}
                        <pre class={chatMessage.type}>{chatMessage.content}</pre>
                    {/each}
                </div>
            </div>
            <div id="users">
                <div class="chat-box-title">users</div>     
                <div id="users-list">
                    {#each activeUsers as activeUser}
                        <div>{activeUser}</div>
                    {/each}
                </div>
            </div>
        </div>
        <form on:submit|preventDefault={() => {
            message === '' ? handleNickChange() : handleMessage()
        }}>
            <input on:focusout={handleNickChange} on:focus={handleNickFocus} bind:value={nick} type="text" id="nick-input">
            <input bind:this={inputMsg} bind:value={message} on:keyup={(e) => handleInputBuffer(e)} placeholder="Type message here..." type="text" id="message-input">
            <button type=submit class="hidden"></button>
        </form>
        <div id="tips" class={show ? "visible" : "invisible"}>
            <span>Try typing {tips[tipIndex]}</span>
        </div>
    </div>
</main>
<style>
    pre {
        margin: 0;
        white-space: pre-wrap;
        font-family: monospace;
    }
    input {
        font-family: monospace;
    }
    #chat-box {
        width: 60%;
        font-family: monospace;
        margin: 0 auto;
    }
    .chat-box-title {
        padding: 3px 5px;
        border-bottom: 1px solid;
    }
    #chat {
        display: flex;
        height: 300px;
        border: 1px solid;
        border-bottom: none;
    }
    #chat-messages {
        width: 100%;
        overflow: hidden;
    }
    #chat-messages-scroll {
        width: 100%;
        height: 265px;
        overflow-y: auto;
        
        overflow-wrap: normal;
        display: flex;
        flex-direction: column-reverse;
        word-break: break-all;
    }
        
    #users {
        border-left: 1px solid;
    }
    #users-list {
        padding: 0 5px;
    }
    form {
        display: flex;
        width: 100%;
    }
    #nick-input {
        max-width: 15%;
        padding: 5px;
        border: 1px solid;
        border-right: 0;
    }
    #message-input {
        width: 100%;
        padding: 5px;
        border: 1px solid;
    }
    .hidden {
        display: none;
    }

    .system-normal,
    .join {
        color: green;
    }
    .error,
    .left {
        color: brown;
    }
    main {
        height: 100vh;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .chat-action {
        color: blueviolet;
    }
    .pvt-msg {
        color: darkmagenta;
    }
    .quit,
    .system {
        color: darkblue;
    }
    @keyframes fade {
        0%,100% { opacity: 0 }
        50% { opacity: 1 }
    }
    #tips {
        color: brown;
        animation: fade 10s infinite;
    }
</style>