import { App, FuzzySuggestModal, SuggestModal, TFile } from "obsidian";

export class OpenChatModal extends FuzzySuggestModal<TFile> {

    constructor(app: App, protected onSelected: (file: TFile) => void) {
        super(app);
    }
    getItems(): TFile[] {
        return app.vault.getFiles().filter(file => file.extension == "gemini")
    }
    getItemText(item: TFile): string {
        return item.path.replace(".gemini", "");
    }
    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.onSelected(item);
    }
}