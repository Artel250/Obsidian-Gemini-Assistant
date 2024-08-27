import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import GeminiPlugin from 'main';
import { App, TFile, Vault } from 'obsidian';

export class GeminiChat {
    #API_KEY: string;
    messages: ChatMessage[];
    #model: GenerativeModel;
    app: App;
    chatName: string
    #session: ChatSession;

    constructor(plugin: GeminiPlugin, app: App) {
        this.#API_KEY = plugin.settings.Gemini_Api_Key;
        this.#model = new GoogleGenerativeAI(this.#API_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });
        this.#session = this.#model.startChat()
        this.app = app;
        this.messages = [];
        this.chatName = "Untitled Gemini Chat"
    }

    async sendUserMessage(text: string) {
        const userMessage = new ChatMessage(text, true);
        this.messages.push(userMessage);

        // Send the message to the model and handle the response
        const result = await this.#session.sendMessage(userMessage.text);
        const modelMessage = new ChatMessage(result.response.text(), false);
        this.messages.push(modelMessage);
        return modelMessage;
    }

    compileHistory() {
        let history = this.messages.map(message => {
            return {
                role: message.user ? "user" : "model",
                parts: message.text
            };
        });

        return JSON.stringify(this.messages);
    }

    async saveHistory(chatName: String) {
        const history = JSON.stringify(this.messages);
        const filePath = `ChatHistory/${chatName}.gemini`;
        await this.app.vault.adapter.write(filePath, history);
    }

    async loadHistoryFromFile(file:TFile) {
        try {
            console.log(`Creating chat from: ${file}`)
            let f = file;
            if (f instanceof TFile) {
                this.chatName = f.basename;
            } else {
                throw new Error(`Path Error for: ${file.path}`);
            }

            let history = await this.app.vault.adapter.read(file.path);

            this.messages = JSON.parse(history).map((msg: { text: string; user: boolean }) => new ChatMessage(msg.text, msg.user));

            let h = this.messages.map(message => {
                return {
                    role: message.user ? "user" : "model",
                    parts: [{ text: message.text }]
                };
            });
            this.#session = await this.#model.startChat({ history: h });
        } catch (error) {
            console.log("No previous chat history found, starting fresh.");
            this.messages = [];
        }
    }
}

class ChatMessage {
    text: string;
    user: boolean;

    constructor(text: string, user: boolean) {
        this.text = text;
        this.user = user;
    }
}