"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MahjongState = void 0;
const schema_1 = require("@colyseus/schema");
class MahjongState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tiles = []; // the current tiles array
        this.decks = {
            0: null,
            1: null,
            2: null,
            3: null,
        };
        this.draw = 72; // start drawing at 72nd tile.
    }
}
__decorate([
    schema_1.type("number")
], MahjongState.prototype, "draw", void 0);
exports.MahjongState = MahjongState;
