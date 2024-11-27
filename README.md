# 🫓 Flatbread Tiles

** This project is still under development, details subject to change **

The ''Flatbread'' vector tile scheme intends to provides the full breadth and depth of OpenStreetMap tagging as vector tiles. It applies minimal processing to provide the most flexibility for OpenStreetMap derived maps and to support a broad range of maps from a single vector tiles schema.

Flatbread vector tiles are the opposite of simplified, crafted and optimised vector tiles schemas like [Mapbox Streets](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/), [OpenMapTiles schema](https://openmaptiles.org/schema/) and [Shortbread Tiles](https://shortbread-tiles.org/).

## Copyright

We take the position that this schema is not creative enough to be a copyrightable work.

For the sake of clarity, however, we are releasing it under the CC-0 license. For the avoidance of doubt, using this schema to create your vector tiles will not add any attribution requirements, but if you generate vector tiles from OpenStreetMap data, you will of course have to attribute OpenStreetMap.

## Baking your own Flatbread Vector Tiles

Install dependencies, PostgreSQL, PostGIS, felt/tippecanoe, and project dependencies

    yarn install

Choose a OpenStreetMap extract, for example from https://download.openstreetmap.fr/extracts/ and download it into `data/osm.pbf`.

Setup your PostgreSQL environment.

    createdb flatbread
    psql -c 'CREATE EXTENSION postgis;' flatbread
    psql -c 'CREATE EXTENSION hstore;' flatbread

Load your OpenStreetMap data into PostgreSQL.

    osm2pgsql --create --database flatbread --latlong --prefix osm --hstore-all --extra-attributes --multi-geometry --keep-coastlines --output pgsql --style pgsql.style data/osm.pbf

Export your data into GeoJSON.

    ./bin/pg2geojson.js

Build a PMTiles set of Flatbread Vector Tiles

    tippecanoe --name="Flatbread Vector Tiles" --attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' --description="Flatbread Vector Tiles" --layer=flatbread  --read-parallel --minimum-zoom=10 --maximum-zoom=14 --full-detail=14 -no-tiny-polygon-reduction --visvalingam --no-feature-limit --no-tile-size-limit --no-tile-stats --output=data/tiles.pmtiles --force data/data.geojson 

Or build an MBTiles set of Flatbread Vector Tiles

    tippecanoe --name="Flatbread Vector Tiles" --attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' --description="Flatbread Vector Tiles" --layer=flatbread  --read-parallel --minimum-zoom=10 --maximum-zoom=14 --full-detail=14 -no-tiny-polygon-reduction --visvalingam --no-feature-limit --no-tile-size-limit --no-tile-stats --output=data/tiles.mbtiles --force data/data.geojson 

Preview the MBTiles with mbview

    mbview data/tiles.mbtiles

Preview a map from the PMTiles with

    http-server
    open http://localhost:8080/preview/
