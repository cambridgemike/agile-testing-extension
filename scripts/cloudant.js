var Cloudant = {
  setup: function(xhr){
    xhr.setRequestHeader("Accept", "application/json")  
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Authorization", "Basic aGVtYW5kc29ybHlpbmNlbmNlcmhhc3VyOlRtdGZmMzRhTXZ2QzVRSGgxU2tLclMzeQ==");
  },

  create: function(data, successFn){
    return $.ajax("https://pushmobile.cloudant.com/notifications", {
      data: JSON.stringify(data), 
      type: "POST",
      beforeSend: this.setup,
      success: successFn,
      error: function(){ $("#errorMsg").show() }
    })
  },

  get:  function(key, callbackFn){
    return $.ajax("https://pushmobile.cloudant.com/notifications/" + key + "/", {
      dataType: "jsonp", 
      success: callbackFn,
      type: "GET",
      beforeSend: function(xhr){
        xhr.setRequestHeader("Authorization", "Basic aGVtYW5kc29ybHlpbmNlbmNlcmhhc3VyOlRtdGZmMzRhTXZ2QzVRSGgxU2tLclMzeQ==");
      }
    });
  }
}