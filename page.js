
function validatePhoneNumber(elementValue){  
  var phoneNumberPattern = /\(?(\d{3}\)?[- ]?\d{3}[- ]?\d{4})/g;  
  return elementValue.match(phoneNumberPattern);  
}


url = window.location.href
setBadge = false;

// TODO: return object with schema: {title:..., url:..., phones:..., maps:....}

var data = {}
data.phones = validatePhoneNumber(document.body.innerText)

if(data.phones != null){
  setBadge = true;
}


// data.html = document.body.innerText



if(/itunes.apple.com\/.+\/app\//.test(document.body.innerHTML)){
  // GROSS regex
  setBadge = true;
  
  // TODO: make this more relaxed. for instance, there can be subdomains
  // Breaks when there is a dash in the app name
  data.appstoreUrl = document.body.innerHTML.match(/(\w*\.?itunes.apple.com\/.+\/app\/[\w\/-]+)/)[0]
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.action == "start"){
      if(/maps.google/.test(url)){
        data.url = document.getElementById("link").href
      }
      
      sendResponse(data);
    } else if(request.action == "setBadge"){
      sendResponse({setBadge: setBadge})
    }
  });