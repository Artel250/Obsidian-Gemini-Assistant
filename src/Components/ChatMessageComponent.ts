import { App, MarkdownRenderer, Plugin} from "obsidian";

export class ChatMessageComponent {
    #text: string;
    #UserMessage: boolean;
    #ParentElement: HTMLElement;
    #App: App;
    #Plugin: Plugin;

    constructor(text: string, user: boolean, parent: HTMLElement, app:App, plugin:Plugin) {
        this.#text = text;
        this.#UserMessage = user;
        this.#ParentElement = parent;
        this.#App = app
        this.#Plugin = plugin;

        // Create the message 
        const message = document.createElement("div");

        // Create the button panel
        const buttonPanel = document.createElement("div");
        buttonPanel.addClass("message-button-panel")
        buttonPanel.style.opacity = "0";
        /*
        buttonPanel.style.position = "absolute";
        buttonPanel.style.top = "0";
        buttonPanel.style.right = "0";
        buttonPanel.style.padding = "5px";
        buttonPanel.style.display = "flex";
        buttonPanel.style.gap = "5px";
        buttonPanel.style.opacity = "0";
        buttonPanel.style.transition = "opacity 0.3s ease-in-out";
        */


        // Create the copy button
        const copyButton = document.createElement("button");
        copyButton.addClass("message-button")
        copyButton.innerHTML = '<span class="clipboard-icon">📋</span>';
        /*
        copyButton.style.position = "relative";
        copyButton.style.zIndex = "10";
        */
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(this.#text).then(() => {
                copyButton.innerHTML = '<span class="checkmark-icon">✔️</span>';
                setTimeout(() => {
                    copyButton.innerHTML = '<span class="clipboard-icon">📋</span>';
                }, 3000);
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        });

        buttonPanel.append(copyButton);

        // Create the content element
        const content = document.createElement("div");
        MarkdownRenderer.render(this.#App, text, content, "", this.#Plugin);

        message.classList.add("chat-message");
        if (user)
            message.classList.add("user-message");
        else
            message.classList.add("ai-message");

        // Style the message container
        message.style.position = "relative";
        message.style.padding = "10px"; // Add padding to avoid overlap with the button

        // Append the button panel and content to the message
        message.appendChild(buttonPanel);
        message.appendChild(content);

        // Prepend the message to the parent element
        parent.prepend(message);

        // Show the button panel on hover
        message.addEventListener("mouseenter", () => {
            buttonPanel.style.opacity = "1";
        });
        message.addEventListener("mouseleave", () => {
            buttonPanel.style.opacity = "0";
        });
    }
}