// <!-- Copyright Mike Anderson 2011 -->


var GitHub = function(access_token){
  this.access_token = access_token;
  this.endpoint = "https://api.github.com"
  
  // Defaults
  this.orgs = []
  this.repos = {}
  
  this.issueUrl = ""
  this.issueNumber = ""
};

GitHub.prototype.getUser = function(){
  return this.get(this.endpoint + '/user');
};

GitHub.prototype.fetchRepos = function(onComplete){
  var self = this
  
 // Get repos from user
 userRepos = self.get(self.endpoint + '/user/repos').pipe( function(data) {return self.repoPluck(data)} );
 
 // Get repos from orgs
 orgRepos = self.get(self.endpoint + '/user/orgs').pipe(function(orgList){
   
   // For each organization, get it's list of repos
   subRepoQuery = jQuery.map(orgList, function(org){
     return self.get(org.url + '/repos').pipe( function(data) {return self.repoPluck(data)} );
   });
   
   return jQuery.when.apply(jQuery, subRepoQuery)
 });
 
 // Return all of our ajax objects
 jQuery.when.apply(jQuery, [userRepos, orgRepos]).then(function(){console.log("Everything has finished")})
 return jQuery.when.apply(jQuery, [userRepos, orgRepos])
};

GitHub.prototype.repoPluck = function(repoList){
  var self = this
  arr = jQuery.map(repoList, function(repo){
    // Unfortunately we have to make a request to the repo to see if it has issues
    req = self.get(repo.url).pipe(function(repoData){
      if(repoData.has_issues)
      {
        self.repos[repo.owner.login + '/' + repo.name] = {};
        self.repos[repo.owner.login + '/' + repo.name]["url"] = repo.url
        
        return self.get(repo.url + '/contributors').done(function(contribList){
          self.repos[repo.owner.login + '/' + repo.name]["contributors"] = contribList;
        }).then(
          self.get(repo.url + '/milestones').done(function(milestoneList){
            self.repos[repo.owner.login + '/' + repo.name]["milestones"] = milestoneList;
          })
        )
        
      } else {
        // Return null so that pipe doesn't wait on us
        return null;
      }
    })

    
    return req
  });
  
  // Return an aggregate Deferred object
  return jQuery.when.apply(jQuery, arr)
};

GitHub.prototype.newIssue = function(data){
  var self = this
  repoUrl = data.repo
  delete(data.repo)
  return self.post(repoUrl + '/issues', data).pipe(function(data) { 
    self.issueUrl    = data.html_url; 
    self.issueNumber = data.number;
  });
};

GitHub.prototype.commitFiles = function(data){
  repoUrl = data.repo
  
  // Files should be an array of hashes, specifying "path" and "content" for each
  files = data.files
  
  var self = this
  return self.get(repoUrl + '/git/refs/heads/master')
  .pipe(
    function(resp){
      sha_latest_commit = resp.object.sha
      return self.get(repoUrl + '/git/commits/' + sha_latest_commit)
    })
  .pipe(
    function(resp){
      console.log(resp)
      sha_base_tree = resp.tree.sha
      postData = {base_tree: sha_base_tree, tree: files}
      return self.post(repoUrl + '/git/trees', postData)
    })
  .pipe(
    function(resp){
      sha_new_tree = resp.sha
      postData = {parents: [sha_latest_commit], tree: sha_new_tree, message:"new screenshot for issue"}
      return self.post(repoUrl + '/git/commits', postData)
    })
  .pipe(
    function(resp){
      sha_new_commit = resp.sha
      postData = {sha: sha_new_commit, force: true}
      return self.post(repoUrl + '/git/refs/heads/master', postData)
    })
  
}

GitHub.prototype.createDownload = function(repoUrl, filename, filesize){
  var self = this;
  return self.post(self.endpoint + "/repos/" + repoUrl + "/downloads", {name: filename, size: filesize})
}

// Ajax methods

GitHub.prototype.get = function(url){
  return jQuery.ajax({
    url: url + "?access_token=" + this.access_token,
		type: 'get',
		dataType: 'json',
		success: function(){console.log("get complete: " + url)},
    error: function(){}
   });
};

GitHub.prototype.post = function(url, data){
  return jQuery.ajax({
    url: url + "?access_token=" + this.access_token,
		type: 'post',
		data: JSON.stringify(data),
		dataType: 'json',
    error: function(){
      return false;
    }
   });
}

