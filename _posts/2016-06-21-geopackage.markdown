---
layout:       post
title:        "GeoPackage"
description:  "Using GeoPackages in your DICE reports."
date:         2016-06-21 12:03:33
categories:   Example
---

[Download metromap-geopackage.zip][zip] Copy the link and open DICE, or after tapping the link choose "Open in DICE."

![DICe and GeoPackage]({{site.baseurl}}/images/dicegpkg.png)

The DICE iOS and Android apps now support [GeoPackage][geopackage] for offline map tiles. This OGC standard allows you to store multiple sets of tiles, vectors, and features in a single file.

Each GeoPackage is a SQLite database so you can query and update it's data.

Below is an example of how to use a GeoPackage for displaying tiles in a DICE report using [Leaflet][leaflet]. 

{% highlight javascript %}

	L.tileLayer('geopackage/metromap.gpkg?table=metromap&z={z}&x={x}&y={y}', {
	        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="http://cloudmade.com">CloudMade</a>, Icon Map Created by <a href="http://thenounproject.com/term/map/32153/">Simple Icons</a>',
	        maxZoom: 13,
	        minZoom: 11,
	        errorTileUrl: "img/error_tile.png"
	      }).addTo(map);

{% endhighlight %}

If you are interested in incorporating GeoPackage into one of your applications, we have [SDKs available][geopackage-libs] for many platforms.

[geopackage]:		http://www.geopackage.org
[geopackage-libs]: 	http://ngageoint.github.io/GeoPackage/
[leaflet]:			http://leafletjs.com
[zip]:          	https://github.com/ngageoint/disconnected-content-explorer-examples/raw/master/reportzips/geopackage/metromap-geopackage.zip
