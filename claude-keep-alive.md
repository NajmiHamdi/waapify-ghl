# Claude Keep-Alive Messages

## UNTUK KEEP SESSION ALIVE

Copy dan paste messages ni setiap 10-15 minit untuk keep Claude session active:

### Keep-Alive Message Templates:

#### Message 1:
```
Status check: Session masih active, tengah development. Keep alive ping.
```

#### Message 2: 
```
Progress update: Masih dalam development phase. Auto-commit script running. Keep alive.
```

#### Message 3:
```
Keep alive ping. Development continuing. Session active.
```

#### Message 4:
```
🤖 Auto keep-alive: Session maintenance ping. Development in progress.
```

#### Message 5:
```
Session keep-alive check. Waapify-GHL development ongoing. Status: Active.
```

---

## AUTO MESSAGE SCHEDULER (MacOS)

### Option 1: Simple Timer Reminder
```bash
# Set recurring reminder setiap 10 minit
while true; do
    sleep 600  # 10 minutes
    osascript -e 'display notification "Send keep-alive message to Claude!" with title "Claude Session Keeper"'
done &
```

### Option 2: Auto Clipboard Update
```bash
# Script yang auto update clipboard dengan keep-alive message
messages=(
    "Status check: Session active, keep alive ping."
    "Progress update: Development continuing. Keep alive."
    "🤖 Keep-alive: Session maintenance ping."
    "Session active check. Development ongoing."
    "Keep alive ping. Claude session maintenance."
)

counter=0
while true; do
    message=${messages[$((counter % ${#messages[@]}))]}
    echo "$message" | pbcopy
    osascript -e "display notification \"Message copied to clipboard: $message\" with title \"Claude Keep-Alive\""
    sleep 600  # 10 minutes
    counter=$((counter + 1))
done
```

---

## MANUAL SCHEDULE

Kalau nak manual, set timer dan send message ikut jadual ni:

- **10:00** - Send keep-alive message #1
- **10:10** - Send keep-alive message #2  
- **10:20** - Send keep-alive message #3
- **10:30** - Send keep-alive message #4
- **10:40** - Send keep-alive message #5
- **10:50** - Send keep-alive message #1 (repeat cycle)

Setiap 15 minit auto-commit script akan running juga.