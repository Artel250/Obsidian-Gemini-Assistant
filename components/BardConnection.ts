import { url } from "inspector";
import { Notice, RequestUrlParam, request, requestUrl } from "obsidian";
import { join } from "path";
import * as querystring from "querystring";
import { json } from "stream/consumers";

export class Bard {
    #bard_token: string;
    #reqid: number;
    #snim0e: string;
    #conversationID: string;
    #responseID: string;
    #choiceId: string;

    constructor(bard_token: string) {
        this.#bard_token = bard_token;
        this.#reqid = Math.round(Math.random() * 9999);
        this.#conversationID = "";
        this.#responseID = "";
        this.#choiceId = "";
    }

    async getResponse(query: string) : Promise<string> {
        const input_text_struct = [
            [query, 0, null, [], null, null, 0],
            null,
            [this.#conversationID, this.#responseID, this.#choiceId] /*, null, null, []],
            null, null, null, [1], 0, [], [], 1, 0,*/
        ]
        const params = {
            "_reqid": this.#reqid,
            "bl": 'boq_assistant-bard-web-server_20230912.07_p1',
            "rt": "c"
        }
        const data = {
            "f.req": JSON.stringify([null, JSON.stringify(input_text_struct)]),
            "at": this.#snim0e,
        }

        const requestParams: RequestUrlParam = {
            url: "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?" + querystring.stringify(params),
            method: "post",
            throw: true,
            body: querystring.stringify(data),
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
            headers: {
                "Cookie": `__Secure-1PSID=${this.#bard_token}`
            }
        }

        let resp = await request(requestParams)
        let lines = resp.split('\n').filter(line => line.startsWith('[["wrb.fr'));
        let jsons = lines.map(line => JSON.parse(JSON.parse(line)[0][2]))[0];


        this.#reqid += 100000;
        this.#conversationID = jsons[1][0]
        this.#responseID = jsons[1][1]
        this.#choiceId = jsons[4][0][0]

        return jsons[4][0][1][0]
    }

    async getSnim0e() {
        console.log(this.#bard_token);
        if (this.#bard_token == null || this.#bard_token.charAt(this.#bard_token.length - 1) != ".") {
            throw new Error("__Secure-Ps1d token is either missing or incomplete");
        }
        let resp = await request({
            url: "https://bard.google.com/",
            headers: {
                "Cookie": `__Secure-1PSID=${this.#bard_token}`
            }
        })

        const regex = /"SNlM0e":"(.*?)"/;
        const match = resp.match(regex)?.[1];

        if (match == null) {
            throw new Error("Unable to get the snim0e token");
        } else {
            this.#snim0e = match;
        }
    }

    static async getBard(bard_token: string) {
        let bard = new Bard(bard_token);
        try {
            await bard.getSnim0e();
            return bard;
        } catch (error) {
            console.error(error);
            new Notice(error);
        }
    }
}