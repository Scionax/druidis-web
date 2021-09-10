import { config } from "../config.ts";
import { minify } from "https://deno.land/x/minifier@v1.1.1/mod.ts";
import { log } from "../deps.ts";
import Data from "./Data.ts";

export default abstract class ScriptWatcher {
    
    static runUpdateTime = 0;
    
	// Run Script File Watcher (local / dev only)
	static initialize() {
		if(!config.local) { return; }
		log.info("Loading File Watcher for Scripts (Local Only)");
		ScriptWatcher.watchForScriptUpdates();
		ScriptWatcher.watchFileQueue();
	}
	
	static async watchForScriptUpdates() {
		const watcher = Deno.watchFs("../../scripts");
		
		// Asynchronous Loop: perpetually looks for any changes in the Scripts folder.
		for await(const event of watcher) {
			
			// We only care about files being modified.
			if(event.kind !== "modify") { continue; }
			
			// Only update when .ts files are changed. Ignore "_build.ts"
			const fileChanged = event.paths[0];
			
			if(fileChanged && fileChanged.indexOf(".ts") > -1 && !(fileChanged.indexOf("_build") > -1)) {
				log.debug(`Script file modified: ${fileChanged}`);
				ScriptWatcher.runUpdateTime = Date.now() + 350;
			}
		}
	}
	
	// Watches to see if files need to be updated and bundled. If so, passes the instruction to runScriptBuilder().
	static watchFileQueue() {
		setTimeout(ScriptWatcher.watchFileQueue, 500);
		
		// If we've passed the update time check, it means there are files waiting to be updated.
		if(ScriptWatcher.runUpdateTime !== 0 && ScriptWatcher.runUpdateTime < Date.now()) {
			ScriptWatcher.runScriptBuilder();
		}
	}
	
	// Run the custom Script Builder
	static async runScriptBuilder() {
		log.debug("Updating and Bundling Script Files...");
		ScriptWatcher.runUpdateTime = 0;
		await ScriptWatcher.bundleMainScript();
		await ScriptWatcher.bundleControllers();
	}
	
	// Bundle the main files into a single script.
	static async bundleMainScript() {
		
		// Prepare Important Directories & Files
		const scriptDir = "../../scripts";
		const buildFile = `../../build/druidis.ts`;
		const saveTo = `./public/druidis.js`;
		
		// Get a list of the scripts. Ignore any preceded with "_" or with .js
		let tsContent = "";
		
		for await(const dirEntry of await Data.getFilesRecursive(scriptDir)) {
			
			// Get all .ts files. Ignore any files with "/tests", "/controllers", or preceded with "_"
			if(dirEntry.indexOf(".ts") > -1 && dirEntry.indexOf("/_") !== 0) {
				const fileContents = await Deno.readTextFile(`${scriptDir}${dirEntry}`);
				
				tsContent += `
				${fileContents}`;
			}
		}
		
		tsContent = ScriptWatcher.removeBreakingTSTags(tsContent);
		
		// Combine the Scripts into a single file named "_build.ts"
		await Deno.writeTextFile(buildFile, tsContent);
		
		// Run the Deno Bundler on the script.
		const { files } = await Deno.emit(buildFile, { bundle: "module", compilerOptions: { allowUnreachableCode: true }  });
		let bundledJs = files["deno:///bundle.js"];
		
		// Minifiy the JS Code
		bundledJs = minify("js", bundledJs);
		
		// Copy the Bundled JS. Save to a new file in both projects.
		await Deno.writeTextFile(saveTo, bundledJs);
		
		log.debug(`Updated ${saveTo} script.`);
	}
	
	// Bundle the controllers, each into their own script.
	static async bundleControllers() {
		
		// Prepare Important Directories & Files
		const scriptDir = "../../scripts/controllers";
		const buildDir = `../../build`;
		const saveTo = `./public/scripts`;
		
		// Get a list of the scripts. Ignore any preceded with "_" or with .js
		for await(const dirEntry of await Data.getFilesRecursive(scriptDir)) {
			
			// Only retrieve .ts files within the /controllers directory:
			if(dirEntry.indexOf(".ts") === -1) { return; }
			
			const controller = dirEntry.replace("/", "").replace(".ts", "");
			
			let fileContents = await Deno.readTextFile(`${scriptDir}${dirEntry}`);
			fileContents = ScriptWatcher.removeBreakingTSTags(fileContents);
			
			// Combine the Scripts into a single file named "/build/{controller}.ts"
			await Deno.writeTextFile(`${buildDir}/${controller}.ts`, fileContents);
			
			// Run the Deno Bundler on the script.
			const { files } = await Deno.emit(`${buildDir}/${controller}.ts`, { bundle: "module", compilerOptions: { allowUnreachableCode: true }  });
			let bundledJs = files["deno:///bundle.js"];
			
			// Minifiy the JS Code
			bundledJs = minify("js", bundledJs);
			
			// Copy the Bundled JS. Save to a new file in both projects.
			await Deno.writeTextFile(`${saveTo}/${controller}.js`, bundledJs);
		
			log.debug(`Updated ${saveTo}/${controller}.js`);
		}
	}
	
	// Remove content from a .ts file that would break the bundling process to javascript (.js file)
	static removeBreakingTSTags(tsContent: string) {
		tsContent = tsContent.replaceAll(/^import.*/gm, "");				// Remove all import lines
		tsContent = tsContent.replaceAll("export default", "");				// Remove 'export default' values
		tsContent = tsContent.replaceAll("export function", "function");	// Remove 'export function' values
		return tsContent;
	}
	
}

