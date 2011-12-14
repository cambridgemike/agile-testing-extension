
// Build the S3 Upload form. Leave placeholders for the createDownload response (from Github API)
form = jQuery('<form id="file-upload" method="post" enctype="multipart/form-data" target="submit-iframe" />')
          .append('<input type="hidden" name="key" />')             // path
          .append('<input type="hidden" name="acl" />')             // acl
          .append('<input type="hidden" name="success_action_status" value="201" />')
          .append('<input type="hidden" name="Filename" />')
          .append('<input type="hidden" name="AWSAccessKeyId" />') // access key ID
          .append('<input type="hidden" name="Policy" /> ')         //policy
          .append('<input type="hidden" name="Signature" />')       // signature
          .append('<input type="hidden" name="Content-Type" />')    // content-type
          .append('<input type="file" name="file" id="file-uploader"/>')              // file


// Append the form and a hidden iFrame to the comment field
jQuery(".comment-form").append(form)
jQuery(".comment-form").append("<iframe id='submit-iframe-target' name='submit-iframe' style='display: none;'/>")

// Handler for when the file field changes
fileChangeHandler = function(){
  fileField = jQuery(this)
  
  // Check if the user is logged in
  chrome.extension.sendRequest({msg: 'check_authorized'}, function(response){
    if(!response.authorized)
    {
      // Reset the file upload field
      fileField.replaceWith(jQuery("<input type='file' name='file' id='file-upload' />"));
      jQuery("form#file-upload #file-uploader").change(fileChangeHandler)
    } 
    else{
      gh = new GitHub(response.authorized); // This will return the access key
    }
  
    // Abort everything else if we don't have a github object
    if(typeof gh == 'undefined')
      return;
    
    // Trim the filename
    filename = getPathSuffix(fileField.val());
    repoName = getRepo();
    
    // Update the S3 Upload for mwith the response from createDownload call to Github API
    // We fake out the file size since we can't get it and no one seems to care
    gh.createDownload(repoName, filename, "2024").success(function(data){
      jQuery("#file-upload").attr('action', data.s3_url)
      jQuery("#file-upload input[name='key']").val(data.path);
      jQuery("#file-upload input[name='acl']").val(data.acl);
      jQuery("#file-upload input[name='Filename']").val(data.name);
      jQuery("#file-upload input[name='AWSAccessKeyId']").val(data.accesskeyid);
      jQuery("#file-upload input[name='Policy']").val(data.policy);
      jQuery("#file-upload input[name='Signature']").val(data.signature);
      jQuery("#file-upload input[name='Content-Type']").val(data.mime_type);
      jQuery("#file-upload").submit();
        
      // Update the comment box
      old_value = jQuery(".comment-form textarea").val()
      jQuery(".comment-form textarea").val(old_value + "\n["+ data.name +"](" + data.html_url + ")")
    });
  });
}          
        
// Monitor the file upload field for a new file
jQuery("form#file-upload #file-uploader").change(fileChangeHandler)        
        
// Helper method to get filename from input field
getPathSuffix = function(path){
  array = path.split("\\")
  return array[array.length - 1]
}

// Submit file to Github API create Download 
getRepo = function(filename){
  repo = window.location.pathname.split("/");
  repo = repo[1] + "/" + repo[2];
  return repo;
};
