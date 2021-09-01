import VerboseLog from "./VerboseLog.ts";

export default class Conn {
	
	// Core Values
	public requestEvent: Deno.RequestEvent;
	public request: Request;
	public url: URL;
	
	// URL Segments
	public url1: string;
	public url2: string;
	public url3: string;
	
	// Response
	public success = true;
	public errorReason = "";
	
	// User Data
	public userObj = {};
	public id = 0;			// The user's [expected] ID (NOTE: This is not a verified ID, only what the cookie indicates).
	
	constructor(requestEvent: Deno.RequestEvent) {
		this.requestEvent = requestEvent;
		this.request = this.requestEvent.request;
		this.url = new URL(requestEvent.request.url);
		
		// Prepare URL Segments
		const seg = this.url.pathname.split("/");		// e.g. ["", "api", "post"]
		this.url1 = seg.length >= 2 ? seg[1] : "";
		this.url2 = seg.length >= 3 ? seg[2] : "";
		this.url3 = seg.length >= 4 ? seg[3] : "";
	}
	
	public error(reason = ""): false {
		this.success = false;
		this.errorReason = reason;
		return false;
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
		return await new Response(html, { status: 200, headers: {
			"Content-Type": "text/html; charset=utf-8",
		}});
	}
	
	// return await conn.send404("<div>Some Page!</div>");
	async send404( html: string ): Promise<Response> {
		return await new Response(html, { status: 400, headers: {
			"Content-Type": "text/html; charset=utf-8",
		}});
	}
	
	// return await conn.sendJson("Path successful!");
	async sendJson( jsonObj: unknown ): Promise<Response> {
		return await new Response(JSON.stringify({ u: this.userObj, d: jsonObj }), { status: 200, headers: {
			"Content-Type": "application/json; charset=utf-8",
		}});
	}
	
	// return await conn.sendBadRequest("So that error just happened.");
	async sendFail( reason = "Bad Request", status = 400 ): Promise<Response> {
		VerboseLog.verbose( "WebRouter.sendBadRequest() Error: " + reason );
		return await new Response(null, {
			status: status,
			statusText: reason,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
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
