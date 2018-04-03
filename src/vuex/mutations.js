/**
 * Created by younger on 17/3/2.
 */
export const websocket = (state) => {
    var wsServer = 'ws://127.0.0.1:9501?uid='+window.User.id;
    var websocket = new WebSocket(wsServer);
    return state.websocket  = websocket;
}