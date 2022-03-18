
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { compressParams, decompressParams } from '../src'

// test.before.each(ENV.reset);
test.after(() => console.log('tests done'))

test('compressParams', async (context) => {
  const string = compressParams(testObj)
  // console.log('string', string)
  assert.equal(string, result)

  const parsed = decompressParams(string)
  // console.log('parsed', parsed)
  assert.equal(parsed, testObj)
})

test('other', async (context) => {
  const string = compressParams({"Target":"Report","Method":"getStats","fields":["Offer.name","Advertiser.company","Stat.clicks","Stat.conversions","Stat.cpa","Stat.payout","Stat.date","Stat.offer_id","Affiliate.company"],"groups":["Stat.offer_id","Stat.date"],"limit":"9999","filters":{"Stat.affiliate_id":{"conditional":"EQUAL_TO","values":"1831"}}})
  console.log('string', string)
  // assert.equal(string, result)

  const parsed = decompressParams(string)
  console.log('parsed', parsed)
  // assert.equal(parsed, testObj)
})

var testObj = {
  "id": 1296269,
  "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
  "name": "Hello-World",
  "full_name": "octocat/Hello-World",
  "owner": {
    "login": "octocat",
    "id": 1,
    "node_id": "MDQ6VXNlcjE=",
    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
    "gravatar_id": "",
    "url": "https://api.github.com/users/octocat",
    "html_url": "https://github.com/octocat",
    "followers_url": "https://api.github.com/users/octocat/followers",
    "following_url": "https://api.github.com/users/octocat/following{/other_user}",
    "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
    "organizations_url": "https://api.github.com/users/octocat/orgs",
    "repos_url": "https://api.github.com/users/octocat/repos",
    "events_url": "https://api.github.com/users/octocat/events{/privacy}",
    "received_events_url": "https://api.github.com/users/octocat/received_events",
    "type": "User",
    "site_admin": false
  },
  "private": false,
  "html_url": "https://github.com/octocat/Hello-World",
  "description": "This your first repo!",
  "fork": false,
  "url": "https://api.github.com/repos/octocat/Hello-World",
  "archive_url": "https://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
  "assignees_url": "https://api.github.com/repos/octocat/Hello-World/assignees{/user}",
  "blobs_url": "https://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
  "branches_url": "https://api.github.com/repos/octocat/Hello-World/branches{/branch}",
  "collaborators_url": "https://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
  "comments_url": "https://api.github.com/repos/octocat/Hello-World/comments{/number}",
  "commits_url": "https://api.github.com/repos/octocat/Hello-World/commits{/sha}",
  "compare_url": "https://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
  "contents_url": "https://api.github.com/repos/octocat/Hello-World/contents/{+path}",
  "contributors_url": "https://api.github.com/repos/octocat/Hello-World/contributors",
  "deployments_url": "https://api.github.com/repos/octocat/Hello-World/deployments",
  "downloads_url": "https://api.github.com/repos/octocat/Hello-World/downloads",
  "events_url": "https://api.github.com/repos/octocat/Hello-World/events",
  "forks_url": "https://api.github.com/repos/octocat/Hello-World/forks",
  "git_commits_url": "https://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
  "git_refs_url": "https://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
  "git_tags_url": "https://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
  "git_url": "git:github.com/octocat/Hello-World.git",
  "issue_comment_url": "https://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
  "issue_events_url": "https://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
  "issues_url": "https://api.github.com/repos/octocat/Hello-World/issues{/number}",
  "keys_url": "https://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
  "labels_url": "https://api.github.com/repos/octocat/Hello-World/labels{/name}",
  "languages_url": "https://api.github.com/repos/octocat/Hello-World/languages",
  "merges_url": "https://api.github.com/repos/octocat/Hello-World/merges",
  "milestones_url": "https://api.github.com/repos/octocat/Hello-World/milestones{/number}",
  "notifications_url": "https://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
  "pulls_url": "https://api.github.com/repos/octocat/Hello-World/pulls{/number}",
  "releases_url": "https://api.github.com/repos/octocat/Hello-World/releases{/id}",
  "ssh_url": "git@github.com:octocat/Hello-World.git",
  "stargazers_url": "https://api.github.com/repos/octocat/Hello-World/stargazers",
  "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
  "subscribers_url": "https://api.github.com/repos/octocat/Hello-World/subscribers",
  "subscription_url": "https://api.github.com/repos/octocat/Hello-World/subscription",
  "tags_url": "https://api.github.com/repos/octocat/Hello-World/tags",
  "teams_url": "https://api.github.com/repos/octocat/Hello-World/teams",
  "trees_url": "https://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
  "clone_url": "https://github.com/octocat/Hello-World.git",
  "mirror_url": "git:git.example.com/octocat/Hello-World",
  "hooks_url": "https://api.github.com/repos/octocat/Hello-World/hooks",
  "svn_url": "https://svn.github.com/octocat/Hello-World",
  "homepage": "https://github.com",
  "language": null,
  "forks_count": 9,
  "stargazers_count": 80,
  "watchers_count": 80,
  "size": 108,
  "default_branch": "master",
  "open_issues_count": 0,
  "is_template": false,
  "topics": [
    "octocat",
    "atom",
    "electron",
    "api"
  ],
  "has_issues": true,
  "has_projects": true,
  "has_wiki": true,
  "has_pages": false,
  "has_downloads": true,
  "archived": false,
  "disabled": false,
  "visibility": "public",
  "pushed_at": "2011-01-26T19:06:43Z",
  "created_at": "2011-01-26T19:01:12Z",
  "updated_at": "2011-01-26T19:14:43Z",
  "permissions": {
    "admin": false,
    "push": false,
    "pull": true
  },
  "template_repository": null,
  "what": 'null',
  "truething": 'true',
  "falsething": 'false'
}

var result = '?id=1296269&node_id=MDEwOlJlcG9zaXRvcnkxMjk2MjY5&name=Hello-World&full_name=octocat%2FHello-World&owner=~(login~-octocat~id~1~node_id~-MDQ6VXNlcjE*3d~avatar_url~-https*3a*2f*2fgithub.com*2fimages*2ferror*2foctocat_happy.gif~gravatar_id~-~url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat~html_url~-https*3a*2f*2fgithub.com*2foctocat~followers_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2ffollowers~following_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2ffollowing*7b*2fother_user*7d~gists_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2fgists*7b*2fgist_id*7d~starred_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2fstarred*7b*2fowner*7d*7b*2frepo*7d~subscriptions_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2fsubscriptions~organizations_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2forgs~repos_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2frepos~events_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2fevents*7b*2fprivacy*7d~received_events_url~-https*3a*2f*2fapi.github.com*2fusers*2foctocat*2freceived_events~type~-User~site_admin~false)&private=false&html_url=https%3A%2F%2Fgithub.com%2Foctocat%2FHello-World&description=This%20your%20first%20repo!&fork=false&url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World&archive_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2F%7Barchive_format%7D%7B%2Fref%7D&assignees_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fassignees%7B%2Fuser%7D&blobs_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fgit%2Fblobs%7B%2Fsha%7D&branches_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fbranches%7B%2Fbranch%7D&collaborators_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcollaborators%7B%2Fcollaborator%7D&comments_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcomments%7B%2Fnumber%7D&commits_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcommits%7B%2Fsha%7D&compare_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcompare%2F%7Bbase%7D...%7Bhead%7D&contents_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcontents%2F%7B%2Bpath%7D&contributors_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fcontributors&deployments_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fdeployments&downloads_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fdownloads&events_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fevents&forks_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fforks&git_commits_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fgit%2Fcommits%7B%2Fsha%7D&git_refs_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fgit%2Frefs%7B%2Fsha%7D&git_tags_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fgit%2Ftags%7B%2Fsha%7D&git_url=git%3Agithub.com%2Foctocat%2FHello-World.git&issue_comment_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fissues%2Fcomments%7B%2Fnumber%7D&issue_events_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fissues%2Fevents%7B%2Fnumber%7D&issues_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fissues%7B%2Fnumber%7D&keys_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fkeys%7B%2Fkey_id%7D&labels_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Flabels%7B%2Fname%7D&languages_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Flanguages&merges_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fmerges&milestones_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fmilestones%7B%2Fnumber%7D&notifications_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fnotifications%7B%3Fsince%2Call%2Cparticipating%7D&pulls_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fpulls%7B%2Fnumber%7D&releases_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Freleases%7B%2Fid%7D&ssh_url=git%40github.com%3Aoctocat%2FHello-World.git&stargazers_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fstargazers&statuses_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fstatuses%2F%7Bsha%7D&subscribers_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fsubscribers&subscription_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fsubscription&tags_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Ftags&teams_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fteams&trees_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fgit%2Ftrees%7B%2Fsha%7D&clone_url=https%3A%2F%2Fgithub.com%2Foctocat%2FHello-World.git&mirror_url=git%3Agit.example.com%2Foctocat%2FHello-World&hooks_url=https%3A%2F%2Fapi.github.com%2Frepos%2Foctocat%2FHello-World%2Fhooks&svn_url=https%3A%2F%2Fsvn.github.com%2Foctocat%2FHello-World&homepage=https%3A%2F%2Fgithub.com&language=_null&forks_count=9&stargazers_count=80&watchers_count=80&size=108&default_branch=master&open_issues_count=0&is_template=false&topics=~(~-octocat~-atom~-electron~-api)&has_issues=true&has_projects=true&has_wiki=true&has_pages=false&has_downloads=true&archived=false&disabled=false&visibility=public&pushed_at=2011-01-26T19%3A06%3A43Z&created_at=2011-01-26T19%3A01%3A12Z&updated_at=2011-01-26T19%3A14%3A43Z&permissions=~(admin~false~push~false~pull~true)&template_repository=_null&what=null&truething=_true&falsething=_false'

test.run()
