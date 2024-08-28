# Gemini AI Assistant

This plugin allows you to chat with Google's [Gemini AI](https://gemini.google.com/app) directly from Obsidian, completely for free.

Please note that this is my first Obsidian plugin, so mistakes are bound to happen. Feel free to report any issues you encounter on GitHub.

## Setup

To use this plugin, you need your Google Gemini API key. Here's how to get it:

1. Go to https://ai.google.dev/gemini-api.
2. Click "Get API key in Google AI Studio" and log in with your Google account.
3. Click "Get API Key," and the key should appear in the table below.
4. Copy the key and paste it into the plugin's settings.

> [!warning] Information for EU Residents
> If you are trying to obtain your API key from the EU or UK, Google will require you to set up a billing account with a credit card. You will receive a free trial of €300 for three months. You will not be automatically charged after the trial unless you manually enable payments. [Learn more](https://ai.google.dev/gemini-api/docs/billing#is-Gemini-free-in-EEA-UK-CH)

## How to Use

After setting up your API key, you can use the command "New Gemini Chat" to create a new chat. Alternatively, the plugin will add a ribbon on the right side that also creates a new chat.

**Chats are saved locally**  
Since Google does not store your chat history through their API, your chats are stored locally with the `.gemini` extension. This means your chats are files in your vault—just open the file like any other Obsidian note and continue where you left off.

**Default folder for new chats**  
By default, all your new chats are created in the "Gemini Chats" folder to avoid cluttering your vault. You can change the default folder in the plugin settings.

**Gemini in the sidebar**  
If you want to chat in the sidebar, simply create a new chat and drag and drop it into the sidebar.

**Copy and paste**  
Gemini uses Markdown for its responses. You can use the clipboard icon at the top of each message to copy it and paste it directly into any Obsidian note while preserving all formatting.

## Information about Billing

You can find all information about Gemini's free and paid tiers [here](https://ai.google.dev/pricing). This plugin uses Gemini 1.5 Flash, which falls into the free tier category. However, if you set up a billing account, enable payments, and exceed the free usage limits, you **will be charged**.

You can find more information about Gemini billing [here](https://ai.google.dev/gemini-api/docs/billing).

**Development Plan**

- [x] General chat capabilities
- [ ] Ability to change the model
- [ ] Usage visualizer
- [ ] Prompt templates
- [ ] Generate entire notes with Google Gemini
- [ ] *(**MAYBE**: Feature to generate a vault with Gemini, needs more research)*

Thank you for using my plugin. Please feel free to reach out to me on [GitHub](https://github.com/Artel250/Obsidian-Talk-with-Bard) with *ANY* thoughts about the plugin.