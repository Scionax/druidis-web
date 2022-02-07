import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class FeedController extends WebController {
	
	// Cached HTML
	static feedPage = "";
	
	static schema: { [feed: string]: string[] } = {"Entertainment":["Shows","Movies","People","Sports","Gaming","Virtual Reality","Tabletop Games","Music","Books"],"News":["World News","Social Issues","Politics","Environment","Business","Economic","Legal"],"Informative":["Technology","Science","Education","History"],"Lifestyle":["Fashion","Food","Health","Fitness","Social Life","Relationships","Recipes","Travel"],"Fun":["Funny","Ask","Cute","Forum Games","Cosplay"],"Creative":["Crafts","Artwork","Design","Writing"],"Home":["Shows","Movies","People","Sports","Gaming","Virtual Reality","Tabletop Games","Music","Books","World News","Social Issues","Environment","Politics","Business","Economic","Legal","Technology","Science","Education","History","Fashion","Food","Health","Fitness","Social Life","Relationships","Recipes","Travel","Funny","Cute","Ask","Cosplay","Forum Games","Crafts","Artwork","Design","Writing"]};
	
	async runHandler(conn: Conn): Promise<Response> {
		
		const feed = conn.url2 ? conn.url2 : "Home";
		
		// If the forum doesn't exist, send a 404.
		if(!FeedController.schema[feed]) {
			return await conn.notFound();
		}
		
		return await conn.sendHTML(FeedController.feedPage);
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		FeedController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
	}
}