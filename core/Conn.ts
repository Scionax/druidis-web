import WebController from "../controller/WebController.ts";
import { log } from "../deps.ts";

export default class Conn {
	
	// Core Values
	public readonly request: Request;
	public readonly onlyInnerContent: boolean;			// TRUE for /page urls. Means we only want to send the inner page content.
	
	// URL Segments
	public readonly url: URL;
	public readonly url1: string;
	public readonly url2: string;
	public readonly url3: string;
	
	// User Data
	public id = 0;			// The user's [expected] ID (NOTE: This is not a verified ID, only what the cookie indicates).
	
	constructor(request: Request) {
		this.request = request;
		this.url = new URL(request.url);
		
		// Prepare URL Segments
		const seg = this.url.pathname.split("/");		// e.g. ["", "api", "post"]
		
		// If we're dealing with a "/page" url, we only send the page HTML, not the full set.
		this.onlyInnerContent = (seg[1] === "page");
		
		if(this.onlyInnerContent) {
			seg.shift();
		}
		
		this.url1 = seg.length >= 2 ? seg[1] : "";
		this.url2 = seg.length >= 3 ? seg[2] : "";
		this.url3 = seg.length >= 4 ? seg[3] : "";
	}
	
	// ----- Process Active Users ----- //
	
	processActiveUser() {
		
		// Get the 'login' cookie from User, if applicable.
		const cookies = this.cookieGet();
		if(!cookies.login) { return; }
		
		// Recover the ID from the cookie (note: doesn't guarantee that it's valid).
		const log = cookies.login.split(".");
		this.id = Number(log[0]) || 0;
	}
	
	// ------------------------- //
	// ----- Web Responses ----- //
	// ------------------------- //
	
	// return await conn.sendHTML("<div>Some Page!</div>");
	async sendHTML( html: string ): Promise<Response> {
		
		// Return only the inner content of the page:
		if(this.onlyInnerContent) {
			return await new Response(html, { status: 200, headers: {
				"Content-Type": "text/html; charset=utf-8",
			}});
		}
		
		// Return the whole page:
		return await new Response(`${WebController.layoutOpen} ${html} ${WebController.layoutClose}`, { status: 200, headers: {
			"Content-Type": "text/html; charset=utf-8",
		}});
	}
	
	// return await conn.sendJson("Path successful!");
	async sendJSON( jsonObj: unknown ): Promise<Response> {
		return await new Response(JSON.stringify(jsonObj), { status: 200, headers: {
			"Content-Type": "application/json; charset=utf-8",
		}});
	}
	
	// return await conn.sendBadRequest("So that error just happened.");
	async badRequest( reason = "Bad Request", status = 400 ): Promise<Response> {
		log.debug(`WebRouter.sendBadRequest() Error: ${reason}`);
		return await new Response(null, {
			status: status,
			statusText: reason,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
		}});
	}
	
	// return await conn.send404("<div>Some Page!</div>");
	async notFound(): Promise<Response> {
		return await new Response(WebController.bad404, { status: 400, headers: {
			"Content-Type": "text/html; charset=utf-8",
		}});
	}
	
	// ----- Cookie Handling ----- //
	
	cookieGet(): Record<string, string> {
		const cookie = this.request.headers.get("cookie");
		if (cookie != null) {
			const out: Record<string, string> = {};
			const c = cookie.split(";");
			for (const kv of c) {
				const [cookieKey, ...cookieVal] = kv.split("=");
				if(cookieKey != null) {
					const key = cookieKey.trim();
					out[key] = cookieVal.join("=");
				}
			}
			return out;
		}
		return {};
	}
}
