---
layout:       post
title:        "Content Creation Guide"
description:  "How to create your own DICE reports"
date:         2015-02-19 12:51:33
categories:    Example
---
[Download ContentCreationGuide.zip][zip] After clicking the link choose "Open in DICE."

![Content Creation Guide Screenshot]({{ site.baseurl }}/images/contentguide.png)

The content creation guide is a kitchen sink of interactive components, and some documentation to show you how to build your reports so you can get the most out of DICE.

If you can display it in a browser using HTML5, CSS, and Javascript, odds are you can take that content offline with DICE, as long as you keep your data local and relatively linked. 

When creating your own content for DICE, you can add a metadata.json file to let the app know how to display your content in the list, tile, and map views. If you do not set a title, the filename minus the extension will be used.

An example metadata.json
{% highlight json %}
{
  "title": "DICE User Guide",
  "description": "A brief overview of this app",
  "thumbnail": "img/thumbnail.png",
  "tile_thumbnail":"img/tilethumb.png",
  "reportID":"userguide1.0",
  "lat": "0.0",
  "lon": "0.0"
}
{% endhighlight %}


Feel free to pull this report out of DICE and poke around in the code.

Resources used to create the user guide: [Bootstrap][bootstrap] for layout, [TwentyTwenty][twentytwenty] for the image comparison, [Leaflet.js][leaflet] for the map, and [Swiper][swiper] for the photo gallery.

[bootstrap]:    http://getbootstrap.com/
[twentytwenty]: http://zurb.com/playground/twentytwenty
[leaflet]:      http://leafletjs.com/
[swiper]:       http://www.idangero.us/sliders/swiper/index.php
[zip]:          https://github.com/ngageoint/disconnected-content-explorer-examples/raw/master/reportzips/ContentCreationGuide.zip
