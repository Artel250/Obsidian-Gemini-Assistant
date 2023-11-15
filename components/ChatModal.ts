import BardPlugin from "main";
import { App, Modal, Notice, MarkdownRenderer } from "obsidian";
import { send } from "process";
import { Bard } from "./BardConnection";
import { type } from "os";
import { DebugBard } from "./DebugBard";
import { Console } from "console";
import { createHash } from "crypto";

export class ChatModal extends Modal {
    #plugin: BardPlugin;
    #chatMessages: HTMLElement;
    #userInput: HTMLInputElement;
    #Bard: Bard;

    #Chat: HTMLElement;
    #Conversations: HTMLElement;


    constructor(app: App, plugin: BardPlugin) {
        super(app);
        this.#plugin = plugin;
        if (!this.#plugin.settings.DeveloperMode) {
            Bard.getBard(plugin.settings.Bard_Token, plugin.settings.Bard_Token_2, plugin.settings.Bard_Token_3).then((result) => {
                if (result) {
                    this.#Bard = result;
                }
                else {
                    new Notice("Something went wrong when trying to create a Bard connection");
                }
            });
        } else {
            console.log("BARD running in Dev mode");
            DebugBard.getBard(plugin.settings.Bard_Token, plugin.settings.Bard_Token_2, plugin.settings.Bard_Token_3).
                then(value => this.#Bard = value);
        }
    }

    onOpen() {
        let { contentEl } = this;

        contentEl.createEl('h3', { text: 'Chat with Bart AI' });
        let root = contentEl.createDiv("chat-modal-content");
        this.#Chat = root.createEl("div", { cls: "chat-interface panel" });

        this.#chatMessages = this.#Chat.createDiv('chat-messages');

        const conversationsButton = this.#Chat.createEl('button', {
            text: 'Conversations',
            cls: 'conversation-button'
        });

        let chatInput = this.#Chat.createDiv('chat-input');
        this.#userInput = chatInput.createEl('input', { type: 'text', placeholder: 'Type your message...' });
        chatInput.createEl('button', {
            text: 'Send'
        }).onClickEvent(() => {
            this.sendMessage();
        });

        this.#userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();

                // Prevents default behavior (newline) when pressing Enter
                event.preventDefault();
            }
        });

        this.#Conversations = root.createDiv({
            cls: 'conversation-list panel hidden' // Initially hidden
        });


        conversationsButton.onClickEvent(() => {
            this.showConversations();
            this.loadConversations();
        });
    }

    showConversations() {
        this.#Chat.classList.add("fadeout")
        this.#Conversations.classList.add("fadein")

        this.#Chat.style.pointerEvents = 'none';
        this.#Conversations.style.pointerEvents = "none"

        this.#Chat.toggleClass("hidden", false);
        this.#Conversations.toggleClass("hidden", false);

        this.#Conversations.style.overflowY = "auto";

        this.#Chat.addEventListener('animationend', () => {
            this.#Conversations.style.pointerEvents = "auto";
            this.#Chat.style.pointerEvents = "none"

            this.#Conversations.removeClass("fadein");
            this.#Chat.removeClass("fadeout");

            this.#Conversations.toggleClass("hidden", false);
            this.#Chat.toggleClass("hidden", true);

        }, { once: true });
    }

    showChat() {
        this.#Chat.addClass("fadein");
        this.#Conversations.addClass("fadeout");

        this.#Chat.style.pointerEvents = "none";
        this.#Conversations.style.pointerEvents = "none"

        this.#Chat.toggleClass("hidden", false);
        this.#Conversations.toggleClass("hidden", false);

        // disable vertical scroll to prevent jittering when changin
        this.#Conversations.style.overflowY = "hidden";

        this.#Conversations.addEventListener('animationend', () => {
            this.#Chat.style.pointerEvents = "auto";
            this.#Conversations.style.pointerEvents = "none";

            this.#Conversations.removeClass("fadeout");
            this.#Chat.removeClass("fadein");

            this.#Conversations.toggleClass("hidden", true);
            this.#Chat.toggleClass("hidden", false);
        }, { once: true });

    }

    clearChat() {
        while (this.#chatMessages.lastChild) {
            this.#chatMessages.lastChild.remove();
        }
        this.#Bard.setConversationId(null);
        this.#Bard.setResponseId(null);
        this.#Bard.setChoiceId(null);
    }

    switchToConversation(conversationId: string) {
        this.clearChat();
        this.#Bard.setConversationId(conversationId);
        this.#Bard.getConversation(conversationId).then((result) => {
            result.forEach((element) => {
                this.displayMessage(element["UserMessage"], true);
                this.displayMessage(element["BotResponse"], false)
            })
            this.#Bard.setResponseId(result[result.length - 1]["responseID"])
            this.#Bard.setChoiceId(result[result.length - 1]["choiceId"])
        });
    }

    loadConversations() {
        if (!this.#Bard) {
            new Notice("Bard not ready");
            return;
        }

        while (this.#Conversations.lastChild) {
            this.#Conversations.lastChild.remove();
        }

        this.#Bard.getConversations().then((result) => {
            //add the new chat button
            const newChatButton = this.#Conversations.createEl("div", {
                cls: "newChatButton",
                text: "New Chat"
            })
            newChatButton.onClickEvent((event) => {
                event.stopPropagation();
                this.showChat();
                this.clearChat();
            })

            //add all the conversations
            result.forEach((conversation: string[]) => {
                const listItem = this.#Conversations.createEl('div', {
                    cls: 'conversation-list-item'
                });

                const label = listItem.createEl('span', {
                    text: conversation[1],
                });

                // Create the delete button and initially hide it
                const deleteButton = listItem.createEl('button', {
                    text: 'Delete',
                    cls: 'delete-button' // Add the 'conversation-button' class for styling
                });
                deleteButton.style.display = 'none'; // Hide button by default

                deleteButton.onClickEvent((event) => {
                    event.stopPropagation();
                    deleteButton.parentElement?.remove();
                    this.#Bard.deleteConversation(conversation[0]);
                })

                listItem.dataset.conversationId = conversation[0];

                // Toggle delete button visibility on hover
                listItem.onmouseenter = () => deleteButton.style.display = 'block';
                listItem.onmouseleave = () => deleteButton.style.display = 'none';

                // Clicking a conversation switches to it
                listItem.onClickEvent(() => {
                    if (listItem.dataset.conversationId != undefined) {
                        this.switchToConversation(listItem.dataset.conversationId);
                        this.showChat();
                    }
                })
            });
        });
    }

    sendMessage() {
        let userMessage = this.#userInput.value;

        if (userMessage == null || userMessage == "") return;

        this.displayMessage(userMessage, true);

        this.#userInput.value = '';

        const botResponseDiv = this.#chatMessages.createEl('div', { cls: 'message bot-message' });
        botResponseDiv.append(this.typingAnimation());

        this.#Bard.getResponse(userMessage).then((response) => {
            botResponseDiv.remove();
            this.displayMessage(response, false);
        });
    }

    displayMessage(text: string, isUser: boolean) {
        let cls = "bot-message";
        if (isUser) {
            cls = "user-message";
        }

        const messageDiv = this.#chatMessages.createEl("div", { cls: "message " + cls });
        MarkdownRenderer.render(this.app, text, messageDiv, "", this.#plugin);
        messageDiv.scrollIntoView({ behavior: "smooth" });
    }

    typingAnimation() {
        const typingAnim = createDiv({ cls: "typing-indicator" })
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())

        return typingAnim;
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty(); // Clear modal content
    }


}
