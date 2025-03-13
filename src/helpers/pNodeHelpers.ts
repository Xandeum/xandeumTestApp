import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM } from "CONSTS";


class Global {
    total: any;
    constructor(total) {
        this.total = total;

    }
}

class PNodeOwner {
    user: any;
    pnode: any;
    pnode_with_coupon: any;
    constructor(total, pnode, pnode_with_coupon) {
        this.user = total;
        this.pnode = pnode;
        this.pnode_with_coupon = pnode_with_coupon;

    }
}
class Coupon {
    coupon_codes: any;
    constructor(coupon_codes) {
        this.coupon_codes = coupon_codes;

    }
}


function arrayToNum(array) {
    const arr = new Uint8Array(array);
    const view = new DataView(arr.buffer || arr);

    const num = view.getBigUint64(0, true);
    return num.toString();
}

function arrayToNum32(array) {
    const arr = new Uint8Array(array);
    const view = new DataView(arr.buffer || arr);

    const num = view.getUint32(0, true);
    return num.toString();
}

function arrayToNum8(array) {
    const arr = new Uint8Array(array);
    const view = new DataView(arr.buffer || arr);

    const num = view.getUint8(0);
    return num.toString();
}

function bytesTou64Array(array) {
    const len = array.length;
    const newLen = len / 8;

    let arr = [];
    for (let i = 0; i < newLen; i++) {
        const num = arrayToNum(array.slice(i * 8, (i + 1) * 8));
        arr.push(num);
    }

    return arr;
}

function bytesTou32Array(array) {
    const len = array.length;
    const newLen = len / 4;

    let arr = [];
    for (let i = 0; i < newLen; i++) {
        const num = arrayToNum32(array.slice(i * 4, (i + 1) * 4));
        arr.push(num);
    }

    return arr;
}

function bytesToPubkeyArray(array: Array<any>, length: number) {
    const pubkeys = [];
    for (let i = 0; i < length; i++) {
        const pubkeyBytes = array.slice(i * 32, (i + 1) * 32);
        pubkeys.push(new PublicKey(pubkeyBytes));
    }
    return pubkeys;
}



export async function getGlobalAccountData(connection: Connection) {
    let global = PublicKey.findProgramAddressSync(
        [Buffer.from("pnodestore")],
        PROGRAM
    );

    let dat = await connection.getParsedAccountInfo(global[0]);

    if (dat.value == null) {
        return null;
    }

    let data: any = dat.value.data;

    let gdata = new Global(
        arrayToNum32(data.slice(0, 4)),

    );
    return gdata;
}

export async function getCouponAccountData(connection: Connection) {
    let global = PublicKey.findProgramAddressSync(
        [Buffer.from("coupon3")],
        PROGRAM
    );

    let dat = await connection.getParsedAccountInfo(global[0]);

    if (dat.value == null) {
        return null;
    }

    let data: any = dat.value.data;

    let gdata = new Coupon(
        bytesTou32Array(data.slice(0, 1200)),

    );
    return gdata;
}
export async function getPnodeOwnerAccountData(connection: Connection, pubkey: string) {
    let ownerPda = PublicKey.findProgramAddressSync(
        [Buffer.from("pnodeowner"), new PublicKey(pubkey).toBuffer()],
        PROGRAM
    );

    let dat = await connection.getParsedAccountInfo(ownerPda[0]);

    if (dat.value == null) {
        return null;
    }

    let data: any = dat.value.data;

    let odata = new PNodeOwner(
        new PublicKey(data.slice(0, 32)),
        arrayToNum32(data.slice(32, 36)),
        arrayToNum32(data.slice(36, 40)),
    );
    return odata;
}