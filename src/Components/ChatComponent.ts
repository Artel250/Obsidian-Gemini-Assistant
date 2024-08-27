import { App, Plugin } from "obsidian";
import { ChatMessageComponent } from "./ChatMessageComponent"
import { GeminiChat } from "../GeminiChat";
import GeminiPlugin from "main";

type MessageListener = (message: string) => void;

export class ChatComponent {
    private chatInput: HTMLInputElement;
    private chatDisplay: HTMLElement;
    private parentElement: HTMLElement;
    private messagesContainer: HTMLElement;
    private sendButton: HTMLButtonElement;

    GeminiChat: GeminiChat;
    private App: App;
    private Plugin: GeminiPlugin;
    newMessageListeners: MessageListener[] = [];

    constructor(parentElement: HTMLElement, App: App, Plugin: GeminiPlugin) {
        this.parentElement = parentElement;
        this.GeminiChat = new GeminiChat(Plugin, App);
        this.App = App;
        this.Plugin = Plugin;
        this.initializeChatUI();
    }

    private initializeChatUI() {

        // Chat display within the container, taking up all available space
        this.chatDisplay = this.parentElement.createDiv({ cls: 'gemini-chat-display' });

        // Create a container for the chat messages
        this.messagesContainer = this.chatDisplay.createDiv({ cls: 'messages-container' });

        const inputContainer = this.chatDisplay.createDiv({ cls: 'input-container' });

        this.chatInput = inputContainer.createEl('input', {
            type: 'text',
            cls: 'gemini-chat-input'
        });
        this.chatInput.placeholder = 'Ask Gemini...';

        // Send button
        this.sendButton = inputContainer.createEl('button', {
            text: 'Send',
            cls: 'send-button'
        });
        this.sendButton.addEventListener('click', () => this.handleChatInput());

        this.chatInput.placeholder = 'Ask Gemini...';
        this.chatInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.handleChatInput();
            }
        });
    }

    public loadChat(GeminiChat: GeminiChat) {
        this.GeminiChat = GeminiChat;

        //Load previous messages
        GeminiChat.messages.forEach(element => {
            this.displayMessage(element.text, element.user)
        });
    }

    private async handleChatInput() {
        const userInput = this.chatInput.value;
        if (userInput == "") return;
        this.displayMessage(userInput, true);
        this.chatInput.value = '';
        this.showTypingAnimation();

        const aiResponse = await this.GeminiChat.sendUserMessage(userInput);

        this.displayMessage(aiResponse.text, false);
        this.hideTypingAnimation();
    }

    private showTypingAnimation() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = "typing-indicator";

        this.messagesContainer.prepend(typingIndicator)

        typingIndicator.createSpan({});
        typingIndicator.createSpan({});
        typingIndicator.createSpan({});
    }

    private hideTypingAnimation() {
        const typingIndicator = this.chatDisplay.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    private displayMessage(text: string, user: boolean) {
        new ChatMessageComponent(text, user, this.messagesContainer, this.App, this.Plugin);
        this.notifyMessageListeners();
    }

    private scrollToBottom() {
        // Ensure the latest messages are visible
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    public focusInput(){
        this.scrollToBottom();
        this.chatInput.focus();
    }

    addListener(listener: MessageListener) {
        this.newMessageListeners.push(listener);
    }

    private notifyMessageListeners() {
        this.newMessageListeners.forEach((listener) => listener(this.GeminiChat.compileHistory()))
    }

    reset(){
        this.messagesContainer.empty();
    }
}

