import Conn from "../core/Conn.ts";

export default class WebController {
	
	// Cached HTML
	static header = "";
	static headerCloser = "";
	static footer = "";
	static footerCloser = "";
	
	// This only exists here as an interface, but is important for running RouteMap[url], which points to a WebRouter class.
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendFail("Invalid Route");
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		
		// Cache Header
		WebController.header = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header.html`));
		WebController.headerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header-closer.html`));
		
		// Cache Footer
		WebController.footer = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer.html`));
		WebController.footerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer-closer.html`));
	}
}
