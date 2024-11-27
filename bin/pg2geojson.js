#!/usr/bin/env node

import yargs from 'yargs/yargs'
import postgres from 'postgres'
import { createWriteStream } from 'fs'

const argv = yargs(process.argv.slice(2)).options({
  n: { type: 'number', alias: 'limit' }
}).parse();

const output = createWriteStream('data/data.geojson')

const sql = postgres({ database: 'flatbread' })

const pointsCountResult = await sql`
  select
    count(*)
  from osm_point
`
const linesCountResult = await sql`
  select
    count(*)
  from osm_line
`
const polygonsCountResult = await sql`
  select
    count(*)
  from osm_polygon
`
const pointsCount = Number(pointsCountResult[0].count)
const linesCount = Number(linesCountResult[0].count)
const polygonsCount = Number(polygonsCountResult[0].count)
const totalCount = pointsCount + linesCount + polygonsCount

const points = sql`
  select
    osm_id,
    hstore_to_json(tags) AS tags,
    ST_AsGeoJSON(way) AS geom
  from osm_point
`.cursor(1)

const lines = sql`
  select
    osm_id,
    hstore_to_json(tags) AS tags,
    ST_AsGeoJSON(way) AS geom
  from osm_line
`.cursor(1)

const polygons = sql`
  select
    osm_id,
    hstore_to_json(tags) AS tags,
    ST_AsGeoJSON(way) AS geom
  from osm_polygon
`.cursor(1)

process.on('SIGINT', function() {
  process.stdout.write('\u001B[?25h') // show cursor
  process.exit()
})
process.stdout.write('\u001B[?25l') // hide cursor

let i = 0
for await (const [row] of points) {
  if (argv.limit && i >= argv.limit) {
    break
  }

  process.stdout.write(`${Number(i / totalCount * 100).toFixed(0)}%\r`)
  i++
  writeFeature(row)
}
for await (const [row] of lines) {
  if (argv.limit && i >= argv.limit) {
    break
  }

  process.stdout.write(`${Number(i / totalCount * 100).toFixed(0)}%\r`)
  i++
  writeFeature(row)
}
for await (const [row] of polygons) {
  if (argv.limit && i >= argv.limit) {
    break
  }

  process.stdout.write(`${Number(i / totalCount * 100).toFixed(0)}%\r`)
  i++
  writeFeature(row)
}

function writeFeature(row) {
  const feature = {
    type: 'Feature',
    id: Number(row.osm_id),
    properties: row.tags,
    geometry: JSON.parse(row.geom)
  }
  output.write(JSON.stringify(feature) + '\n')
}
await sql.end()

process.stdout.write('\u001B[?25h') // show cursor
