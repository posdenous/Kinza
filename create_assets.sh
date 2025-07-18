
#!/bin/bash

# Create a simple icon
convert -size 1024x1024 xc:white -fill "#4A90E2" -gravity center -pointsize 200 -font Arial -annotate 0 "KB" /Users/brianwilliams/Documents/GitHub/Kinza/assets/icon.png

# Create a simple splash screen
convert -size 1242x2436 xc:white -fill "#4A90E2" -gravity center -pointsize 100 -font Arial -annotate 0 "Kinza Berlin" /Users/brianwilliams/Documents/GitHub/Kinza/assets/splash.png

# Create adaptive icon foreground
convert -size 1024x1024 xc:white -fill "#4A90E2" -gravity center -pointsize 200 -font Arial -annotate 0 "KB" /Users/brianwilliams/Documents/GitHub/Kinza/assets/adaptive-icon.png

# Create favicon
convert -size 64x64 xc:white -fill "#4A90E2" -gravity center -pointsize 20 -font Arial -annotate 0 "KB" /Users/brianwilliams/Documents/GitHub/Kinza/assets/favicon.png

