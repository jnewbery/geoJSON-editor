A geoJSON editor, based on the geoJSON editor by [Björn Sållarp](https://github.com/bjornsallarp), published on his blog [here](http://blog.sallarp.com/google-maps-geojson-editor/). Björn has kindly given me permission to check this into github and make some enhancements. I aim to:

- <del>add a 'clear geoJSON' button</del> **done**
- <del>change from Polygons to LineStings (If you're building a map with contiguous polygons, building them up from LineStrings is desirable - see [my post](http://johnnewbery.com/blog/2013/07/28/mapping-malaysia-2/) for reasons why)</del> **done**
- <del>allow the user to pass latlon/scale parameters in the URL query string and add button to save the curent position of the map</del> **done**
- change from a single MultiLineString feature to a multi-feature containing multiple LineStrings
- allow a second LineString to be started or terminated on the vertex of a previous LineString
- allow user to assign names to each LineString