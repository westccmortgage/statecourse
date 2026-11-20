import crypto from 'node:crypto';

// BioSig-ID's own interface helper, from BSI's NodeJS sample
// (custom.code.zip, Samples/NodeJS/bioSigInterfaceHelper.js), converted from CommonJS to
// an ES module and otherwise unchanged.
//
// DO NOT "IMPROVE" THIS FILE. The key derivation is non-standard on purpose: SHA-1 applied
// twice to pass+salt, truncated to 16 bytes. It has to match BSI's server byte for byte.
// Replacing it with PBKDF2, a different hash, a random IV or authenticated encryption
// produces ciphertext BSI cannot read, and nothing here would report why.
// tests/nmls-biosig.test.mjs pins its output against values produced by BSI's original file.
export default class BioSigInterfaceHelper {
	constructor(pass, salt) {
		this._key = this._createSecureKey(pass, salt, 2, 128 / 8);
	}

	_createSecureKey(pass, salt, count, dklen) {
		let t = Buffer.from(pass + salt, "utf8");
		for (let i = 0; i < count; i++) {
			t = crypto.createHash("sha1").update(t).digest();
		}
		return Buffer.from(t.subarray(0, dklen));
	}

	arr2obj(arr) {
		const obj = {};
		arr.forEach((v) => {
			const key = v[0];
			const value = v[1];
			obj[key] = value;
		});
		return obj;
	}

	generateArgumentString(sc, sid, cid, loc, nw, email, fn, ln, uid, ts) {
		ts = ts || new Date().toISOString();
		let bsiArgs = `ts=${ts}&sc=${sc}&sid=${sid}`;
		bsiArgs += `&cid=${cid}&lc=${loc}&nw=${nw}`;
		bsiArgs += `&em=${email}&fn=${fn}&ln=${ln}`;
		bsiArgs += `&uid=${uid}`;

		return bsiArgs;
	}

	encrypt(s, vec, keySize) {
		const algorithm = this._getAlgorithm(keySize);
		const iv = Buffer.from(vec, "latin1");
		const cipher = crypto.createCipheriv(algorithm, this._key, iv);
		return cipher.update(s, "utf8", "base64") + cipher.final("base64");
	}

	decrypt(s, vec, keySize) {
		const algorithm = this._getAlgorithm(keySize);
		const iv = Buffer.from(vec, "latin1");
		const decipher = crypto.createDecipheriv(algorithm, this._key, iv);
		return Buffer.concat([
			decipher.update(s, "base64"),
			decipher.final()
		]);
	}

	_getAlgorithm(keySize) {
		return `aes-${keySize}-cbc`;
	}
}
