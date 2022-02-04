// deno run --allow-net --allow-write --allow-read --allow-run --allow-env --unstable playground.ts --runDirect

import { log } from "./deps.ts";
import { encode, decode } from "https://deno.land/std@0.107.0/encoding/base64.ts";

  
  async function generatePemFromPrivateCryptoKey(privateKey: CryptoKey) {
	const exportedKey = await crypto.subtle.exportKey("pkcs8", privateKey);
	const exportedAsBase64 = encode(exportedKey);
	return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
  }
  
export default abstract class Playground {
	
	static runOnServerLoad() {
		Playground.runOnServerLoadAsync();
		return true;
	}
	
	
/*
  Import a PEM encoded RSA private key, to use for RSA-PSS signing.
  Takes a string containing the PEM encoded key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
  static importPrivateKey(pem: string) {
	// fetch the part of the PEM string between header and footer
	const pemHeader = "-----BEGIN PRIVATE KEY-----";
	const pemFooter = "-----END PRIVATE KEY-----";
	const pemContents = pem.substring(
	pemHeader.length,
	pem.length - pemFooter.length,
	);
	const binaryDer = decode(pemContents).buffer;
	return window.crypto.subtle.importKey(
	"pkcs8",
	binaryDer,
	{
		name: "RSASSA-PKCS1-v1_5",
		hash: "SHA-384",
	},
	true,
	["sign"],
	);
}
	
	static async runOnServerLoadAsync() {
		
		const keyRS384CryptoKeyPair = await window.crypto.subtle.generateKey(
			{
				name: "RSASSA-PKCS1-v1_5",
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: "SHA-384",
			},
			true,
			["verify", "sign"],
		);
		
		const { privateKey, publicKey } = keyRS384CryptoKeyPair;
		
		const pemExported = await generatePemFromPrivateCryptoKey(privateKey);
		
		const importedCryptoKey = await Playground.importPrivateKey(pemExported);
		
		const areEqualKeys =
		pemExported === await generatePemFromPrivateCryptoKey(importedCryptoKey);
		
		console.log("---- are crypto pem keys equal? ---- ");
		console.log(areEqualKeys);
	}
	
	static async runOnDirectLoad() {
		
		const { files } = await Deno.emit("../scripts/druidis.ts");
		for (const [fileName, text] of Object.entries(files)) {
			log.info(`emitted ${fileName} with a length of ${text}`);
		}
	}
}

if(Deno.args.indexOf("--runDirect") > -1) {
	await Playground.runOnDirectLoad();
}
