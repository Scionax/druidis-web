import Conn from "../core/Conn.ts";

export default class WebController {
	
	// Cached HTML
	static header: string;
	static headerCloser: string;
	static panelOpen: string;
	static panelClose: string;
	static pageClose: string;
	static footer: string;
	
	// Cached Menus
	static menuLoggedIn: string;
	static menuLoggedOut: string;
	
	// Full HTML Page
	static bad404: string;
	
	// This only exists here as an interface, but is important for running RouteMap[url], which points to a WebRouter class.
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.send404(WebController.bad404);
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		
		// Cache Header
		WebController.header = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header.html`));
		WebController.headerCloser = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/header-closer.html`));
		
		// Cache Main Menu
		// WebController.menuLoggedIn = WebController.buildMainMenu(true);
		// WebController.menuLoggedOut = WebController.buildMainMenu(false);
		
		// Cache Panels
		WebController.panelOpen = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/panel-open.html`));
		WebController.panelClose = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/panel-close.html`));
		WebController.pageClose = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/page-close.html`));
		
		// Cache Footer
		WebController.footer = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/footer.html`));
		
		// 404 Page
		WebController.bad404 = `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		
		<div id="main-section" class="layoutMain">
			Error 404: Page does not exist.
		</div>
		
		${WebController.pageClose}
		${WebController.footer}`;
	}
	
	static buildMainMenu(loggedIn: boolean) {
		
		let html = `
		<section id='menuMain'>`;
		
		if(!loggedIn) {
			html += `<a>Log In</a>`;
		}
		
		html += `
			<a>Menu Option</a>
			<a>Menu Option</a>
			<a>Menu Option</a>
			<a>Menu Option</a>
			<a>Menu Option</a>`
		
		if(loggedIn) {
			html += `<a>Log Out</a>`;
		}
			
		html += `
		</section>`;
		
		return html;
	}
}
