import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

// Unlike other pages (which are generally cached HTML), these pages are dynamically after fetching from the API Server.

export default class AdminController extends WebController {
	
	static links = "";
	static header = "";
	static footer = "";
	
	static user = "";
	static userList = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		
		if(!conn.url2) { return await AdminController.sendAdminPage(conn); }
		if(conn.url2 === "user") { return await AdminController.sendAdminPage(conn); }
		if(conn.url2 === "user-list") { return await AdminController.sendAdminPage(conn); }
		
		return await conn.notFound();
	}
	
	// deno-lint-ignore require-await
	static async initialize() {
		
		AdminController.links = `<div class="linkList">
		${AdminController.applyLink("", "Admin")}
		${AdminController.applyLink("/user-list", "User List")}
		</div>`;
		
		AdminController.header = `<h1>Admin Suite</h1>
		<div class="main-contain">`;
		AdminController.footer = `</div>`;
	}
	
	static applyLink(url: string, title: string) {
		return `<a href="/admin${url}" class="link">${title}</a>`;
	}
	
	static async sendAdminPage(conn: Conn) {
		
		// TODO: Fetch API to confirm that you have admin permissions.
		
		return await conn.sendHTML(`
			${AdminController.links}
			${AdminController.header}
			
			${AdminController.footer}
		`);
	}
}
