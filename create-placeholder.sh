#!/bin/bash

# Create the tiles directory if it doesn't exist
mkdir -p public/tiles

# Download a simple placeholder image (a gray tile with text)
curl -s https://via.placeholder.com/256x256/EEEEEE/999999?text=No+Tile -o public/tiles/placeholder.png

echo "Created placeholder tile at public/tiles/placeholder.png" 