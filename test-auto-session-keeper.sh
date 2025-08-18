#!/bin/bash

# Test Auto Session Keeper Script (Fast version for testing)
# Commits every 60 seconds and sends keep-alive every 30 seconds

echo "🧪 Starting TEST Auto Session Keeper..."
echo "⏰ Will commit every 60 seconds and keep-alive every 30 seconds (TEST MODE)"
echo "🛑 Press Ctrl+C to stop"

# Counter for commits
commit_counter=1

while true; do
    # Wait 30 seconds for testing
    echo "⏳ Waiting 30 seconds... ($(date))"
    sleep 30
    
    # Send keep-alive message (this will show in terminal but not sent to Claude)
    echo "💓 Keep-alive ping #$commit_counter at $(date)"
    
    # Check if it's time to commit (every 60 seconds = every 2 cycles)
    if [ $((commit_counter % 2)) -eq 0 ]; then
        echo "📝 Auto-committing changes..."
        
        # Check if there are any changes (including untracked files)
        if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
            # Update timestamp in a tracking file
            echo "Test auto-commit at $(date)" >> .auto-commits.log
            
            # Add and commit changes
            git add .
            git commit -m "TEST Auto-commit #$((commit_counter/2)): Progress backup at $(date)

- Test auto-backup during development session
- Keeping changes safe every 60 seconds (TEST MODE)
- Session keeper active and working"
            
            # Push to GitHub
            git push origin main
            echo "✅ TEST Auto-commit #$((commit_counter/2)) completed and pushed!"
        else
            echo "ℹ️  No changes to commit at $(date)"
        fi
    fi
    
    commit_counter=$((commit_counter + 1))
done