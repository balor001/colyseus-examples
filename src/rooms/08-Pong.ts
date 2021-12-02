import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);

    @type("number")
    playerId = 0;
}

export class Ball extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);

    @type("number")
    ballId = 0;
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
    playerCount = 0;
    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
        this.playerCount++;
        this.players.get(sessionId).playerId = this.playerCount;
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * 10;

        } else if (movement.y) {
            this.players.get(sessionId).y += movement.y * 10;
        }
    }


    // Ball
    @type({ map: Ball })
    balls = new MapSchema<Ball>();
    ballCount = 0;

    createBall(roomId: string) {
        this.balls.set(roomId, new Ball());
        this.ballCount++;
        this.balls.get(roomId).ballId = this.ballCount;
    }

    removeBall(roomId: string) {
        this.balls.delete(roomId);
    }

    moveBall (roomId: string, movement: any) {
        if (movement.x) {
            this.balls.get(roomId).x += movement.x * 10;

        } else if (movement.y) {
            this.balls.get(roomId).y += movement.y * 10;
        }
    }
}

export class Pong extends Room<State> {
    maxClients = 2;

    setSimulationInterval(){
        
    }

    OnTwoPlayers(){

    }

    onCreate (options) {
        console.log("Pong created!", options);

        this.setState(new State());

        this.onMessage("move", (client, data) => {
            console.log("Pong received message from", client.sessionId, ":", data);
            this.state.moveBall(client.sessionId, data);
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        client.send("hello", "world");
        this.state.createBall(client.sessionId);
    }

    onLeave (client) {
        this.state.removeBall(client.sessionId);
    }

    onDispose () {
        console.log("Dispose Pong Room");
    }

}
