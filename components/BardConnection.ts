import { url } from "inspector";
import { Notice, RequestUrlParam, request, requestUrl } from "obsidian";
import { join } from "path";
import * as querystring from "querystring";
import { json } from "stream/consumers";


export class Bard {
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
        this.#bard_token = bard_token;
        this.#bard_token_2 = bard_token_2;
        this.#bard_tokne_3 = bard_token_3;
        this.#reqid = Math.round(Math.random() * 9999);
        this.#conversationID = "";
        this.#responseID = "";
        this.#choiceId = "";
    }

    async deleteConversation(conversationID: string) {
        const input_text_struct = [
            [["GzXR5e", `["${conversationID}", 10]`, null, "generic"]]
        ];
        const data = {
            "f.req": JSON.stringify(input_text_struct),
            "at": this.#snim0e
        }

        await this.makeRequest("post", "https://bard.google.com/_/BardChatUi/data/batchexecute?", "GzXR5e", data, "/chat");
    }

    async getConversation(conversationID: string) {
        const input_text_struct = [
            [["hNvQHb", `["${conversationID}", 10]`, null, "generic"]]
        ];

        const data = {
            "f.req": JSON.stringify(input_text_struct),
            "at": this.#snim0e,
        };

        let jsons = await this.makeRequest("post", "https://bard.google.com/_/BardChatUi/data/batchexecute?", "hNvQHb", data, "/chat/" + conversationID)
        var result = new Array();


        jsons[0].forEach((element: any[][]) => {
            let userMessage = element[2][0][0];
            let botResponse = "Bot response"
            let responseId = "";
            let choiceId = ""

            for (let index = 0; index < element[3][0].length; index++) {
                if (element[3][0][index][0] == element[3][3]) {
                    botResponse = element[3][0][index][1][0]
                    choiceId = element[3][3];
                }
            }
            responseId = element[0][1];
            result.unshift({ "UserMessage": userMessage, "BotResponse": botResponse, "responseID": responseId, "choiceId": choiceId });
        });
        return result;
    }

    async getConversations() {
        const input_text_struct = [
            [["MaZiqc", "[13,null,[0]]", null, "generic"]]
        ];

        const data = {
            "f.req": JSON.stringify(input_text_struct),
            "at": this.#snim0e
        }

        let jsons = await this.makeRequest("post", "https://bard.google.com/_/BardChatUi/data/batchexecute?", "MaZiqc", data, "/chat");

        return jsons[0];
    }

    async getResponse(query: string): Promise<string> {
        const input_text_struct = [
            [query, 0, null, [], null, null, 0],
            null,
            [this.#conversationID, this.#responseID, this.#choiceId] /*, null, null, []],
            null, null, null, [1], 0, [], [], 1, 0,*/
        ]

        const data = {
            "f.req": JSON.stringify([null, JSON.stringify(input_text_struct)]),
            "at": this.#snim0e,
        }

        let jsons = await this.makeRequest("post", "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?", "", data, "");


        this.#conversationID = jsons[1][0]
        this.#responseID = jsons[1][1]
        this.#choiceId = jsons[4][0][0]

        console.log(this.#conversationID + " / " + this.#responseID + " / " + this.#choiceId)


        return jsons[4][0][1][0]
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
        let bard = new Bard(bard_token, bard_token_2, bard_token_3);
        try {
            await bard.getAuthentication();
            return bard;
        } catch (error) {
            console.error(error);
            new Notice(error);
        }
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