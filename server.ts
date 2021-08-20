#!/usr/bin/env deno

// deno run --allow-net --allow-write --allow-read server.ts
// deno run --allow-net --allow-write --allow-read server.ts -port 8000 -specialOpts needToSetup
// deno test

import { config } from "./config.ts";
import Conn from "./core/Conn.ts";
import WebController from "./controller/WebController.ts";

// Handle Setup Arguments
// for( let i = 0; i < Deno.args.length; i++ ) {
// 	const arg = Deno.args[i];
// }

// Initializations
await WebController.initialize();

// Custom Routing Map
const RouteMap: { [name: string]: WebController } = {
	// "about": new AboutController(),
	// "home": new HomeController(),
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
		
		// No API Found
		else {
			await requestEvent.respondWith(new Response("404 - Request Not Found", {
				status: 404,
				headers: {
					"content-type": "text/html; charset=utf-8",
				}
			}));
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
