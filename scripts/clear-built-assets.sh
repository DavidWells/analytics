#!/bin/bash

# Script to recursively remove dist and lib folders from packages directory
# This helps clean up built assets across all packages

PACKAGES_DIR="$(dirname "$0")/../packages"

echo "🧹 Cleaning built assets from packages directory..."
echo "Target directory: $PACKAGES_DIR"
echo ""

# Check if packages directory exists
if [ ! -d "$PACKAGES_DIR" ]; then
    echo "❌ Error: Packages directory not found at $PACKAGES_DIR"
    exit 1
fi

# Counter for removed directories
dist_count=0
lib_count=0

# Find and remove dist folders
echo "🔍 Searching for 'dist' folders..."
while IFS= read -r -d '' dir; do
    echo "  Removing: $dir"
    rm -rf "$dir"
    ((dist_count++))
done < <(find "$PACKAGES_DIR" -type d -name "dist" -print0)

# Find and remove lib folders
echo "🔍 Searching for 'lib' folders..."
while IFS= read -r -d '' dir; do
    echo "  Removing: $dir"
    rm -rf "$dir"
    ((lib_count++))
done < <(find "$PACKAGES_DIR" -type d -name "lib" -print0)

echo ""
echo "✅ Cleanup complete!"
echo "   Removed $dist_count 'dist' folders"
echo "   Removed $lib_count 'lib' folders"
echo "   Total removed: $((dist_count + lib_count)) directories"
