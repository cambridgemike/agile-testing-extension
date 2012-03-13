// UrbanAirship interface

UrbanAirship = function(initTokens){
  this.payload = {"aps": {}}
  if(initTokens.aliasToken != null)
    this.payload.aliases = [initTokens.aliasToken]

  if(initTokens.deviceToken != null)
    this.payload.device_tokens = [initTokens.deviceToken]
}

UrbanAirship.prototype.setup = function(xhr){
  xhr.setRequestHeader("Accept", "application/json")  
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.setRequestHeader("Authorization", "Basic VFF2bUlta05RVkd2TGFDNlZXYWl5QTpQTDFadFdQOVF4R2lDVnNsU3hCeHBR");
}

UrbanAirship.prototype.sendNotification = function(){
  // Debug output
  console.log("Submitting notification with data: " + JSON.stringify(this.payload))
  
  //post to UrbanAirship
  $.ajax("https://go.urbanairship.com/api/push/", {
    type: "POST",
    data: JSON.stringify(this.payload),
    beforeSend: this.setup,
    error: function(){ $("#errorMsg").show() }
  })
}