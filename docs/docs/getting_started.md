---
layout: docs
title: Getting Started
permalink: /docs/getting-started/
tabindex: 1
---

## Instalation
```bash
npm i @rebelstack-io/docstrap -g
```

## Usage
```bash
docstrap [-d --dir]
```
if no dir provided will generate documentation webview in docs folder

### Configuration file
For better results is recomended to add a configuration file wich contains
basic information such name of your project, keywords, views sections and more. This file must be in the route where you execute the docstrap command with the name .docstrap.js.

this is not mandatory, it will generate the view eather way without a configuration file, you latter can modify your just generated HTML files with the info for your project.

## Documentation structure
```
.
+-- community
|	+-- index.html
+-- css
|	+-- general.css
|	+-- main.css
|	+-- responsive.css
+-- docs
|	+-- api
|	|	+-- api-reference.md
|	|	+-- index.html
|	+-- examples
|	|	+-- examples.md
|	|	+-- index.html
|	+-- faq
|	|	+-- faq.md
|	|	+-- index.html
|	+-- getting-started
|	|	+-- getting-started.md
|	|	+-- index.html
|	+-- overview
|	|	+-- overview.md
|	|	+-- index.html
+-- img
|	+-- default-logo-white.svg
|	+-- default-logo.svg
+-- js
|	+-- index.js
|	+-- markdown.js
+-- index.html
```

## Notes
Notice that there are some HTML files with .md files, the idea is to keep writing your documentation as you're used to, we then parse every MD file to the web view, all this is done in the server-side, so your HTML files will be fully statics helping with loading time and SEO, so don't forget to build your docstrap when a change to the .md files, or just leave it to Travis, Jenkins or the CI of your choice.