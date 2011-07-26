// <!-- Copyright Mike Anderson 2011 -->


console.log("Content script loaded");
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "get_page_source")
      sendResponse({source: document.getElementsByTagName('html')[0].innerHTML, url: document.location.href});
    else
      sendResponse({}); // snub them.
  });