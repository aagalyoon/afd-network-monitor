#!/bin/bash

# Script to download OpenStreetMap tiles for the United States and save them locally

# Directory to store tiles
tiles_dir="public/tiles"

# Create directory structure
mkdir -p $tiles_dir

echo "Starting download of US map tiles..."

# Pre-calculated tile ranges for zoom levels 3-8 covering the US
# Format: "zoom minX maxX minY maxY"
tile_ranges=(
  # Expanded ranges for zoom levels 3-5 to cover more area
  "3 0 3 1 4"     # Zoom level 3 (all tiles covering North America)
  "4 1 6 3 8"     # Zoom level 4 (all tiles covering US completely)
  "5 3 12 7 15"   # Zoom level 5
  # Original ranges for higher zoom levels
  "6 8 21 17 28"  # Zoom level 6 (approx. 140 tiles)
  "7 16 42 34 57" # Zoom level 7 (approx. 620 tiles)
  "8 32 85 68 114" # Zoom level 8 (approx. 5000 tiles)
)

# Function to download a tile
download_tile() {
  local zoom=$1
  local x=$2
  local y=$3
  
  # Create directory for zoom level
  mkdir -p "$tiles_dir/$zoom/$x"
  
  # Check if file already exists (to avoid re-downloading)
  if [ -f "$tiles_dir/$zoom/$x/$y.png" ]; then
    echo "Tile already exists: zoom=$zoom, x=$x, y=$y"
    return
  fi
  
  # Save locally - try all subdomains
  for subdomain in a b c; do
    curl -s "https://${subdomain}.tile.openstreetmap.org/$zoom/$x/$y.png" -o "$tiles_dir/$zoom/$x/$y.png" && break
    sleep 0.2  # Be nice to the OSM servers
  done
  
  echo "Downloaded tile: zoom=$zoom, x=$x, y=$y"
}

# Process each zoom level
for range in "${tile_ranges[@]}"; do
  # Extract values from the range
  read zoom min_x max_x min_y max_y <<< $range
  
  total_x=$((max_x - min_x + 1))
  total_y=$((max_y - min_y + 1))
  total_tiles=$((total_x * total_y))
  
  echo "Processing zoom level $zoom: $total_tiles tiles ($total_x x $total_y)"
  
  # Download each tile
  for x in $(seq $min_x $max_x); do
    for y in $(seq $min_y $max_y); do
      download_tile $zoom $x $y
    done
  done
done

echo "Done! US map tiles have been downloaded to $tiles_dir" 