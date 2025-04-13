# Local Map Tiles

This directory contains pre-downloaded map tiles for the United States. These tiles are used by the application to display maps without requiring any network connections to external map services.

## Structure

The tiles follow the standard OSM tile naming convention:

```
/tiles/{z}/{x}/{y}.png
```

Where:
- `{z}` is the zoom level (3-8)
- `{x}` is the x coordinate
- `{y}` is the y coordinate

## Coverage

These tiles cover the continental United States and surrounding areas, with the following boundaries:
- North: 49.5° (Northern US border)
- South: 24.5° (Southern US border including Florida Keys)
- East: -66.0° (Eastern US border)
- West: -125.0° (Western US border)

## Zoom Levels

Tiles are available for zoom levels 3 through 8, providing a good balance between coverage and file size.

## Usage

The application is configured to use these local tiles by referencing them at `/tiles/{z}/{x}/{y}.png`. This ensures that no external network requests are made to map tile servers.

## Regenerating Tiles

If you need to regenerate these tiles or download tiles for a different region, you can use the included `download-tiles.sh` script in the project root.

## Attribution

These tiles were originally sourced from OpenStreetMap. When distributed with this application, they should maintain the OpenStreetMap attribution according to their usage policy. 