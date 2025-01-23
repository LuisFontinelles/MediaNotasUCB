// Recebe mensagens do popup e envia a resposta com as notas
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.update === "please") {
        // Solicita ao conteúdo que forneça as notas
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, { update: "please" }).then(response => {
                sendResponse(response);
            });
        });
        return true; 
    }
});
