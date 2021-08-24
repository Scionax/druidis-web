import Conn from "../core/Conn.ts";

export default class WebController {
	
	// Cached HTML
	static header = "";
	static headerCloser = "";
	static panelOpen = "";
	static panelClose = "";
	static pageClose = "";
	static footer = "";
	
	// This only exists here as an interface, but is important for running RouteMap[url], which points to a WebRouter class.
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendJson("Invalid Route");
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		
		// const siteBaseUrl = config.local ? "http://dev.druidis" : "https://druidis.org";
		
		// Cache Header
		WebController.header = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header.html`));
		WebController.headerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header-closer.html`));
		
		// Cache Panels
		WebController.panelOpen = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/panel-open.html`));
		WebController.panelClose = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/panel-close.html`));
		WebController.pageClose = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/page-close.html`));
		
		// Cache Footer
		WebController.footer = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer.html`));
	}
}
