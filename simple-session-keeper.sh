#!/bin/bash

# Simple Session Keeper - Keep Claude session alive only
# No auto-commit, just session maintenance

echo "💓 Starting Claude Session Keeper..."
echo "⏰ Will send keep-alive notification every 8 minutes"
echo "🛑 Press Ctrl+C to stop"

# Keep-alive messages array
messages=(
    "🤖 Session keep-alive ping #"
    "💓 Keep alive check - session active #"
    "⏰ Session maintenance ping #"
    "🔄 Auto keep-alive status check #"
    "📡 Session alive confirmation #"
)

counter=1

while true; do
    # Wait 8 minutes (480 seconds) - safe margin before 10min timeout
    echo "⏳ Waiting 8 minutes... Next ping at $(date -v+8M)"
    sleep 480
    
    # Select message
    message_index=$((counter % ${#messages[@]}))
    selected_message="${messages[$message_index]}$counter"
    
    # Show notification (macOS)
    osascript -e "display notification \"$selected_message\" with title \"Claude Session Keeper\" sound name \"Ping\""
    
    # Log to file for reference
    echo "$(date): $selected_message" >> .session-alive.log
    
    # Terminal output
    echo "💓 $(date): Sent keep-alive notification #$counter"
    echo "📝 Message: $selected_message"
    
    counter=$((counter + 1))
done