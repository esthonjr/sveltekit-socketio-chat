import { Server } from 'socket.io';

/** Plugs the socketio in
 *  Deals with socketio events */
export default function socketIOPlugin(server: number) {
    /**  Used to initialize socketio */
    const io = new Server(server, {
        cors: {
        origin: "*"
        }
    });
    
    /** Used to set the maximum users allowed to connect */
    const max: number = 10;
    
    interface ActiveUser  {
        id: string;
        nick: string
    }
    /** Used to store array of active users */
    let activeUsers: ActiveUser[] = [];
    /** Used to store the optional quit message */
    let quitMessage: string = '';

    /** Sets several socketio custom listeners to the server */ 
    io.on('connection', (socket) => {
        /** Returns guest nickname available;
         *  Evaluates chat max capacity;
         *  Updates array of active users;
         *  Returns updated array of active users */ 
        socket.on('join', nick => {
            if (activeUsers.length >= max) {
                io.to(socket.id).emit('chat-msg', { message: `* disconnected, the room is full`, type: 'left' });
                socket.disconnect();
                return
            }
            let userIndex = activeUsers.findIndex(user => user.nick === nick);
            while (userIndex !== -1) {
                const randomNum = Math.round(1 + Math.random() * (max-1));
                nick = `Guest${randomNum}`;
                userIndex = activeUsers.findIndex(user => user.nick === nick);
            }
            activeUsers.push({ id: socket.id, nick});
            io.emit('chat-msg', { message: `* ${nick} joined the room`, type: 'join' });
            io.to(socket.id).emit('nick', { nick });
            const users = activeUsers.map((user) => user.nick);
            io.emit('users', { users });
        });
        /** Disconnects user */
        socket.on('quit', data => {
            quitMessage = data.message ? data.message : '';
            const message = quitMessage !== '' ? `* you have been disconnected ("${quitMessage}")` : `* you have been disconnected`
            io.to(socket.id).emit('chat-msg', { message, type: 'quit' });
            socket.disconnect();
        });
        /** Returns user information */
        socket.on('whois', data => {
            const userIndex = activeUsers.findIndex(user => user.nick.toLowerCase() === data.nick.toLowerCase());
            const message = userIndex !== -1 
                                ? `* whois: '${activeUsers[userIndex].nick}' id: ${activeUsers[userIndex].id}` 
                                : `* whois: '${data.nick}' user not found`
            io.to(socket.id).emit('chat-msg', { message, type: 'system' });
        });
        /** Updates array of active users uppon disconnect;
         *  Returns updated array of active users */
        socket.on('disconnect', () => {
            if (activeUsers.length < max) {
                const leavingUserIndex = activeUsers.findIndex(user => user.id === socket.id);
                if (leavingUserIndex !== -1) {
                    const message = quitMessage !== '' ? `* ${activeUsers[leavingUserIndex].nick} quit ("${quitMessage}")` 
                                                       : `* ${activeUsers[leavingUserIndex].nick} left the room`
                    const type = quitMessage !== '' ? 'quit'
                                                    : 'left'
                    io.emit('chat-msg', { message, type });
                    quitMessage = '';
                }
                activeUsers.splice(leavingUserIndex, 1);
                const users = activeUsers.map((user) => user.nick);
                io.emit('users', { users });
            }
        });
        /** Evaluates new nickname;
         *  Updates new nickname on array of active users;
         *  Returns updated array of active users */
        socket.on('nick', data => {
            const nickTaken = activeUsers.findIndex(user => user.nick === data.nick);
            const userIndex = activeUsers.findIndex(user => user.id === socket.id);
            const nickOld = activeUsers[userIndex].nick;
            if (nickTaken === -1) {
                activeUsers[userIndex].nick = data.nick;
                io.emit('chat-msg', { message: `* ${nickOld} changed nickname to ${activeUsers[userIndex].nick}`, type: 'system-normal'})
                const users = activeUsers.map((user) => user.nick);
                io.emit('users', { users });
            } else {
                io.to(socket.id).emit('chat-msg', { message: `* nickname '${data.nick}' already taken`, type: 'error' });
                io.to(socket.id).emit('nick', { nick: nickOld })
            }
        });
        /** Sends private message to specific user */
        socket.on('pvt', data => {
            const toIdIndex = activeUsers.findIndex(user => user.nick.toLowerCase() === data.to.toLowerCase());
            if (toIdIndex === -1) {
                io.to(socket.id).emit('chat-msg', { message: `* pvt: "${data.to}" user not found`, type: 'error' });
                return;
            }
            const fromIndex = activeUsers.findIndex(user => user.id === socket.id);
            io.to(activeUsers[toIdIndex].id).emit('chat-msg', { message: `*from: "${activeUsers[fromIndex].nick}": ${data.message}`, type: 'pvt-msg' });
            io.to(socket.id).emit('chat-msg', { message: `*to: "${activeUsers[toIdIndex].nick}": ${data.message}`, type: 'pvt-msg' });
        });
        socket.on('chat-msg', data => {
            io.emit('chat-msg', { message: `<${data.nick}> ${data.message}`, type: 'chat-msg' });
        });
        socket.on('chat-action', data => {
            io.emit('chat-msg', { message: `* ${data.nick} ${data.message}`, type: 'chat-action' });
        });
    });

    console.log(`socket-io started`);
}