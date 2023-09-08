chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("foreupsoftware.com")) {
      const splitParams = tab.url.split("/");
    //   const urlParameters = new URLSearchParams(queryParameters);
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        pageID: splitParams[6]
      });
    }
  });