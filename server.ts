#!/usr/bin/env deno

// deno run --allow-net --allow-write --allow-read --unstable server.ts
// deno run --allow-net --allow-write --allow-read --unstable server.ts --config tsconfig.json
// deno run --allow-net --allow-write --allow-read --unstable server.ts -port 8000 -specialOpts needToSetup
// deno test --allow-net --allow-write --allow-read --unstable

import { config } from "./config.ts";
import Conn from "./core/Conn.ts";
import WebController from "./controller/WebController.ts";
import FeedController from "./controller/FeedController.ts";
import ForumController from "./controller/ForumController.ts";
import PostController from "./controller/PostController.ts";
import AboutController from "./controller/AboutController.ts";
import UserController from "./controller/UserController.ts";
import ScriptWatcher from "./core/ScriptWatcher.ts";
import { log } from "./deps.ts";
import AdminController from "./controller/AdminController.ts";
import ServerMechanics from "./core/ServerMechanics.ts";
import Playground from "./playground.ts";

// Handle Setup Arguments
// for( let i = 0; i < Deno.args.length; i++ ) {
// 	const arg = Deno.args[i];
// }

// Prepare Server
await ServerMechanics.setupLogger(); // Logging Handler (saves to log.txt)

// Initializations
await WebController.initialize();
await FeedController.initialize();
await ForumController.initialize();
await PostController.initialize();
await AboutController.initialize();
await AdminController.initialize();
await UserController.initialize();

// Custom Routing Map
const RouteMap: { [name: string]: WebController } = {
	"about": new AboutController(),
	"admin": new AdminController(),
	"feed": new FeedController(),
	"forum": new ForumController(),
	"post": new PostController(),
	"user": new UserController(),
	// "page": {{ See 'Conn' class for details. Loads only the inner page content. }}
};

// Server Routing
async function handle(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn);
	
	for await (const requestEvent of httpConn) {
		
		// Note: If we're loading a /page url, it means we only send the inner page content; not the full HTML.
		const conn = new Conn(requestEvent.request);
		
		// Process the Active User
		conn.processActiveUser();
		
		// Launch an associated Route Map, if found (such as 'api')
		if(RouteMap[conn.url1]) {
			await requestEvent.respondWith(RouteMap[conn.url1].runHandler(conn));
		}
		
		// Home Page
		else if(!conn.url1) {
			await requestEvent.respondWith(RouteMap.feed.runHandler(conn));
		}
		
		// 404 - Request Not Found
		else {
			await requestEvent.respondWith( new Response("404 - Request Not Found", { status: 404 }) );
		}
	}
}

// Run Playground
Playground.runOnServerLoad();

// Run Script File Watcher (local / dev only)
if(config.local) { ScriptWatcher.initialize(); }

// Run Server
const serv = config.local ? config.serverLocal : config.server;
log.info("Launching Server on Port " + serv.port + ".")

if(serv.certFile && serv.keyFile) {
	const server = Deno.listenTls({
		port: serv.port, certFile: serv.certFile, keyFile: serv.keyFile,
		// alpnProtocols: ["h2", "http/1.1"]
	});
	for await (const conn of server) { handle(conn); }
} else {
	const server = Deno.listen({ port: serv.port });
	for await (const conn of server) { handle(conn); }
}
