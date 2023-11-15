import { Console } from "console";
import { Bard } from "./BardConnection";
import { url } from "inspector";
import { Notice, RequestUrlParam, request, requestUrl } from "obsidian";
import { join } from "path";
import * as querystring from "querystring";
import { json } from "stream/consumers";


export class DebugBard extends Bard {
    #bard_token: string;
    #bard_token_2: string; //__Secure-1PSIDCC
    #bard_tokne_3: string; //__Secure-1PSIDTS
    #reqid: number;
    #snim0e: string;
    #conversationID: string;
    #responseID: string;
    #choiceId: string;
    #fSid: string;
    #bl: string;

    constructor(bard_token: string, bard_token_2: string, bard_token_3: string) {
        super(bard_token, bard_token_2, bard_token_3);
        this.#bard_token = bard_token;
        this.#bard_token_2 = bard_token_2;
        this.#bard_tokne_3 = bard_token_3;
        this.#reqid = Math.round(Math.random() * 9999);
        this.#conversationID = "";
        this.#responseID = "";
        this.#choiceId = "";
    }

    async deleteConversation(conversationID: string) {
        console.log("DEBUG BARD: Deleting conversation " + conversationID)
    }

    async getConversation(conversationID: string) {

        let result = [{
            "UserMessage": "Please remember the code word lavender",
            "BotResponse": "I will remember the code word \"lavender.\"",
            "responseID": "r_7fd58f4c34784641",
            "choiceId": "rc_1de3369c0219bdf3"
        },
        {
            "UserMessage": "what is the code word?",
            "BotResponse": "The code word is \"lavender.\"",
            "responseID": "r_4f9d38a217087817",
            "choiceId": "rc_361bc099016b4525"
        }]

        return result;
    }

    async getConversations() {
        let jsons = [[
            ['c_e079d823ac905a97', 'Forterro | abas: ERP Software for Mid-Sized Manufacturing', false, false, '', [1699453998, 750035000]],
            ['c_9fe162a28ea02c64', 'Remembering code word "lavender"', false, false, '', [1699356005, 15547000]],
            ['c_43a86bec0da1ee00', 'Code word table request', false, false, '', [1699355935, 93132000]],
            ['c_83efa0bb126b621c', 'Remember code word', false, false, '', [1699355894, 787354000]],
            ['c_e466dfc9cf1ffe23', 'Remembering code words', false, false, '', [1699355562, 86529000]],
            ['c_7bd5c81834a618e5', 'Introducing the code word "char"', false, false, '', [1699355388, 906106000]],
            ['c_c4be49b893dff725', 'Assistant Is Working', false, false, '', [1699354436, 878028000]],
            ['c_0bb40a99b570e07d', 'Remember code word', false, false, '', [1699354419, 578969000]],
            ['c_7815b5d52918ecff', 'Remembering the word "rose"', false, false, '', [1699354295, 549268000]],
            ['c_dee3dbc77a070d31', 'Assistant ready to assist', false, false, '', [1699351414, 504864000]],
            ['c_29a9a2d67fef675e', 'Remembering the code word "tulip"', false, false, '', [1699346862, 940578000]],
            ['c_466fd4891b989e4e', 'Greeting', false, false, '', [1699306111, 95254000]]
        ], 'tCqkBAblK0n83Blerc2Z2zIPwT+RH5VXXEUJ8c5Is+5l+Bw0/m…dErKkyliAliaco7s7VgO7nDARfvmGg943JyQfHzycfKWVJQ==']

        return jsons[0];
    }

    async getResponse(query: string): Promise<string> {

        console.log("DEBUG BARD: Responding to \"" + query + "\"");

        return "DEBUG RESPONSE";
    }

    async makeRequest(method: string, url: string, rpcids: string, data: any, path: string) {
        let params = {
            "_reqid": this.#reqid,
            "bl": this.#bl,
            "f.sid": this.#fSid,
            "source-path": path,
            "rt": "c",
            "rpcids": rpcids
        }
        const requestParams: RequestUrlParam = {
            url: url + querystring.stringify(params),
            method: method,
            throw: true,
            body: new URLSearchParams(data).toString(),
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
            headers: {
                "Cookie": this.getCookies()
            }
        }



        let resp = await request(requestParams);

        this.#reqid += 100000;

        let lines = resp.split('\n').filter(line => line.startsWith('[["wrb.fr'));
        console.log(lines.map(line => JSON.parse(JSON.parse(line)[0][2]))[0]);
        return lines.map(line => JSON.parse(JSON.parse(line)[0][2]))[0];
    }

    getCookies() {
        let cookies = `__Secure-1PSID=${this.#bard_token}`
        if (this.#bard_token_2 != undefined && this.#bard_token_2 != "") { cookies += `;__Secure-1PSIDCC=${this.#bard_token_2}` }
        if (this.#bard_tokne_3 != undefined && this.#bard_tokne_3 != "") { cookies += `;__Secure-1PSIDTS=${this.#bard_tokne_3}` }

        return cookies;
    }

    async getAuthentication() {
        if (this.#bard_token == null || this.#bard_token.charAt(this.#bard_token.length - 1) != ".") {
            throw new Error("__Secure-Ps1d token is either missing or incomplete");
        }
        let resp = await request({
            method: "get",
            url: "https://bard.google.com/",
            headers: {
                "Cookie": this.getCookies()
            }
        })


        // get the at token
        var regex = /"SNlM0e":"(.*?)"/;
        const sn1m0e = resp.match(regex)?.[1];

        // get the fsid token
        regex = /"FdrFJe":"(.*?)"/;
        const fsid = resp.match(regex)?.[1];

        // get the bl value
        regex = /"cfb2h":"(.*?)"/;
        const bl = resp.match(regex)?.[1];

        if (sn1m0e == null) {
            throw new Error("Unable to get the snim0e token");
        } else if (fsid == null) {
            throw new Error("Unable to get the f.sid token");
        } else if (bl == null) {
            throw new Error("Unable to get the bl token");
        } else {
            this.#snim0e = sn1m0e;
            this.#fSid = fsid;
            this.#bl = bl;
        }
    }

    static async getBard(bard_token: string, bard_token_2: string, bard_token_3: string) {
        let bard = new DebugBard(bard_token, bard_token_2, bard_token_3);
        return bard;
    }

    setConversationId(conversationID: string) {
        this.#conversationID = conversationID;
    }
    setResponseId(responseID: string) {
        this.#responseID = responseID;
    }
    setChoiceId(choiceID: string) {
        this.#choiceId = choiceID;
    }
}