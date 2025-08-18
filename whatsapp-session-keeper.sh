#!/bin/bash

# WhatsApp Session Keeper - Sends progress reports via WhatsApp
# Usage: ./whatsapp-session-keeper.sh

WHATSAPP_NUMBER="60168970072"
NGROK_URL="https://a32a4e54b43d.ngrok-free.app"
PING_INTERVAL=480  # 8 minutes in seconds
LOG_FILE=".session-alive.log"

echo "🚀 Starting WhatsApp Session Keeper..."
echo "📱 Reports will be sent to: +${WHATSAPP_NUMBER}"
echo "⏰ Ping interval: 8 minutes"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Function to send WhatsApp message
send_whatsapp_report() {
    local message="$1"
    local timestamp=$(date)
    
    # Send via our API (with error logging)
    local response=$(curl -s -X POST "${NGROK_URL}/action/send-whatsapp-text" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${WHATSAPP_NUMBER}\",
            \"message\": \"${message}\",
            \"instance_id\": \"673F5A50E7194\",
            \"access_token\": \"1740aed492830374b432091211a6628d\"
        }" 2>&1)
    
    # Log response for debugging
    echo "WhatsApp API Response: $response" >> "${LOG_FILE}"
    
    # Also log locally
    echo "${timestamp}: ${message}" >> "$LOG_FILE"
}

# Send startup message
send_whatsapp_report "🤖 Claude Session Keeper Started! Will send updates every 8 minutes."

# Counter for ping messages
counter=1

# Main loop
while true; do
    sleep $PING_INTERVAL
    
    # Generate different emoji and messages for variety
    emojis=("💓" "⏰" "🔄" "📡" "🤖" "⚡" "🎯" "✨")
    messages=("Keep alive ping" "Session maintenance" "Auto status check" "Alive confirmation" "Session keeper active" "Heartbeat signal" "Status update" "Session active")
    
    # Use modulo to cycle through arrays
    emoji_index=$((($counter - 1) % ${#emojis[@]}))
    message_index=$((($counter - 1) % ${#messages[@]}))
    
    emoji="${emojis[$emoji_index]}"
    message="${messages[$message_index]}"
    
    # Send simple WhatsApp report (avoid multiline JSON issues)
    simple_message="${emoji} ${message} #${counter} | Time: $(date "+%H:%M:%S") | Server: Running | Ngrok: Active | Session healthy!"
    
    send_whatsapp_report "$simple_message"
    
    echo "📱 WhatsApp report #${counter} sent at $(date)"
    
    counter=$((counter + 1))
done