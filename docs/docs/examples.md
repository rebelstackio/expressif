---
layout: docs
title: Examples | Tutorials
permalink: /docs/examples/
tabindex: 3
---

# Examples

## How to set your config file

In the root of your generated template, you will see a _config.yml, this file is the main configuration file and should look something like this
```yml
title: Site Name
email: your@emal.com
description: >- # this means to ignore newlines until "baseurl:"
  site description
baseurl: "/" # the subpath of your site, e.g. /blog
url: "" # the base hostname & protocol for your site, e.g. http://example.com
twitter_username: twitter_user
github_username:  github_user
benefits: >-
  bennefits of your project
links: >-
 related links
name: Docstrap
repository: link to your repository
discord: linkto to your discord
stackoverflow: link to stackaoverflow
# Build settings
markdown: kramdown
plugins:
  - jekyll-feed
  - jekyll-seo-tag

```
this file will be parsed to the template with the variable site, so if you want to reference the property title in this file it will be ```site.title```

## How to set this to your Github pages?
The template is made in Jekyll, so you don't need to build every addition to the docs files, the template should be in the branch pointing your Github pages.
Let's say our gh-pages URL is ```gh_user.hithub.io/repo_name/``` our Jekyll template is using relative_url that means the folder structure for your site will be constructed as ```site.baseurl + url```.
By default ```baseurl: "/"``` so you will need to set it to ```baseurl: "/repo_name/"```, it is important to have both slashes at the beginning and end.

