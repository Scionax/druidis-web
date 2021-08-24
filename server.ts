#!/usr/bin/env deno

// deno run --allow-net --allow-write --allow-read server.ts
// deno run --allow-net --allow-write --allow-read server.ts -port 8000 -specialOpts needToSetup
// deno test

import { config } from "./config.ts";
import Conn from "./core/Conn.ts";
import WebController from "./controller/WebController.ts";
import FeedController from "./controller/FeedController.ts";
import ForumController from "./controller/ForumController.ts";
import PostController from "./controller/PostController.ts";

// Handle Setup Arguments
// for( let i = 0; i < Deno.args.length; i++ ) {
// 	const arg = Deno.args[i];
// }

// Initializations
await WebController.initialize();
await FeedController.initialize();
await ForumController.initialize();
await PostController.initialize();

// Custom Routing Map
const RouteMap: { [name: string]: WebController } = {
	"feed": new FeedController(),
	"forum": new ForumController(),
	"post": new PostController(),
	// "about": new AboutController(),
};

// Server Routing
async function handle(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn);
	
	for await (const requestEvent of httpConn) {
		const conn = new Conn(requestEvent);
		
		// Launch an associated Route Map, if found (such as 'api')
		if(RouteMap[conn.url1]) {
			await requestEvent.respondWith(RouteMap[conn.url1].runHandler(conn));
		}
		
		// Home Page
		else if(!conn.url1) {
			await requestEvent.respondWith(RouteMap.feed.runHandler(conn));
		}
		
		// Error Page
		else {
			await requestEvent.respondWith( new Response("404 - Request Not Found", { status: 404 }) );
		}
	}
}

// Run Server
const serv = config.local ? config.serverLocal : config.server;
console.log("Launching Server on Port " + serv.port + ".")

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
