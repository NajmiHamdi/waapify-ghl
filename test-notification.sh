#!/bin/bash

# Quick test for notifications - 30 second intervals

echo "🧪 Testing notifications every 30 seconds..."

# Test first notification
echo "Sending first notification..."
osascript -e 'display notification "🤖 Session keep-alive ping #1" with title "Claude Session Keeper" sound name "Ping"'
echo "$(date): Session keep-alive ping #1" >> .session-alive.log

echo "⏳ Waiting 30 seconds for second notification..."
sleep 30

# Test second notification  
echo "Sending second notification..."
osascript -e 'display notification "💓 Keep alive check - session active #2" with title "Claude Session Keeper" sound name "Ping"'
echo "$(date): Keep alive check - session active #2" >> .session-alive.log

echo "✅ Test completed! Check top-right corner for notifications."
echo "📝 Check log: cat .session-alive.log"