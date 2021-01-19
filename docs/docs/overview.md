---
layout: docs
title: Overview
permalink: /docs/overview/
tabindex: 0
---

# Wath is Expressif?

[![Build Status](https://travis-ci.com/rebelstackio/expressif.svg?branch=develop)](https://travis-ci.com/rebelstackio/expressif)

expressif is an opinionated wrapper and bootstrap for the express framework(https://expressjs.com/en/guide/routing.html) that vastly simplifies creating self-documenting RESTful web services. It borrows (overtly) heavily from [ayEs](https://github.com/rebelstackio/ayEs) but opines further for the sake of simplifying the construction of RESTful APIs.
<br/>
<br/>
The request flow goes through `authorize` -> `validate request structure` -> `validate request parameters` -> `controller middleware` -> `response`.
<br/><br/>

![Service Request Flow]({% link /assets/img/ServiceRequestFlow.svg %})
