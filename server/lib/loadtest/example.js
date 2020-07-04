"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onStateChange = exports.onError = exports.onLeave = exports.onJoin = exports.requestJoinOptions = void 0;
function requestJoinOptions(i) {
    return { requestNumber: i };
}
exports.requestJoinOptions = requestJoinOptions;
function onJoin() {
    console.log(this.sessionId, "joined.");
    this.onMessage("*", (type, message) => {
        console.log(this.sessionId, "received:", type, message);
    });
}
exports.onJoin = onJoin;
function onLeave() {
    console.log(this.sessionId, "left.");
}
exports.onLeave = onLeave;
function onError(err) {
    console.log(this.sessionId, "!! ERROR !!", err.message);
}
exports.onError = onError;
function onStateChange(state) {
    console.log(this.sessionId, "new state:", state);
}
exports.onStateChange = onStateChange;
