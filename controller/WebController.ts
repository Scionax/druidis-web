import { config } from "../config.ts";
import Conn from "../core/Conn.ts";

export default class WebController {
	
	// Cached HTML
	static header = "";
	static headerCloser = "";
	static midStart = "";
	static midEnd = "";
	static footer = "";
	static footerCloser = "";
	
	// This only exists here as an interface, but is important for running RouteMap[url], which points to a WebRouter class.
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendJson("Invalid Route");
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		
		const siteBaseUrl = config.local ? "http://dev.druidis" : "https://druidis.org";
		
		// Cache Header
		WebController.header = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header.html`)) + `
		<base href="${siteBaseUrl}" />`;
		WebController.headerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header-closer.html`));
		
		// Cache Middle
		WebController.midStart = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/mid-start.html`));
		WebController.midEnd = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/mid-end.html`));
		
		// Cache Footer
		WebController.footer = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer.html`));
		WebController.footerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer-closer.html`));
	}
}
