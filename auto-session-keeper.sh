#!/bin/bash

# Auto Session Keeper Script
# Keeps Claude Code session alive and auto-commits changes

echo "🤖 Starting Auto Session Keeper..."
echo "⏰ Will commit every 15 minutes and send keep-alive every 10 minutes"
echo "🛑 Press Ctrl+C to stop"

# Counter for commits
commit_counter=1

while true; do
    # Wait 10 minutes (600 seconds)
    echo "⏳ Waiting 10 minutes... ($(date))"
    sleep 600
    
    # Send keep-alive message (this will show in terminal but not sent to Claude)
    echo "💓 Keep-alive ping #$commit_counter at $(date)"
    
    # Check if it's time to commit (every 15 minutes = every 1.5 cycles)
    if [ $((commit_counter % 2)) -eq 0 ]; then
        echo "📝 Auto-committing changes..."
        
        # Check if there are any changes
        if ! git diff --quiet || ! git diff --cached --quiet; then
            # Update timestamp in a tracking file
            echo "Auto-commit at $(date)" >> .auto-commits.log
            
            # Add and commit changes
            git add .
            git commit -m "Auto-commit #$((commit_counter/2)): Progress backup at $(date)

- Auto-backup during development session
- Keeping changes safe every 15 minutes
- Session keeper active"
            
            # Push to GitHub
            git push origin main
            echo "✅ Auto-commit #$((commit_counter/2)) completed and pushed!"
        else
            echo "ℹ️  No changes to commit at $(date)"
        fi
    fi
    
    commit_counter=$((commit_counter + 1))
done