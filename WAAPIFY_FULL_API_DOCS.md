# 📘 Waapify API Documentation

Base URL: `https://stag.waapify.com/api/`

---

## 🔑 Authentication
Semua endpoint perlukan `access_token` sebagai parameter.

Example:
```
access_token=1740aed492830374b432091211a6628d
```

---

# ⚙️ Instance API

### ▶️ Create Instance
**POST** `/createinstance.php`  
Create a new Instance ID

**Params**
- `access_token`

**Example**
```
https://stag.waapify.com/api/createinstance.php?access_token=1740aed492830374b432091211a6628d
```

---

### 📷 Get QR Code
**POST** `/getqrcode.php`  
Display QR code to login to Whatsapp web.  
Results can also be received via webhook.

**Params**
- `instance_id`
- `access_token`

**Example**
```
https://stag.waapify.com/api/getqrcode.php?instance_id=609ACF283XXXX&access_token=1740aed492830374b432091211a6628d
```

---

### 🌐 Set Receiving Webhook
**POST** `/setwebhook.php`  
Get all return values from Whatsapp (connection status, incoming/outgoing messages, battery change, etc.)

**Params**
- `webhook_url`
- `enable` (true/false)
- `instance_id`
- `access_token`

**Example**
```
https://stag.waapify.com/api/setwebhook.php?webhook_url=https://webhook.site/xxx&enable=true&instance_id=609ACF283XXXX&access_token=1740aed492830374b432091211a6628d
```

---

### 🔄 Reboot Instance
**POST** `/reboot.php`  
Logout Whatsapp web and do a fresh scan.

**Params**
- `instance_id`
- `access_token`

---

### ♻️ Reset Instance
**POST** `/resetinstance.php`  
Logout, change Instance ID, delete all old data.

**Params**
- `instance_id`
- `access_token`

---

### 🔌 Reconnect
**POST** `/reconnect.php`  
Re-initiate connection when lost.

**Params**
- `instance_id`
- `access_token`

---

# 💬 Send Direct Message API

### ✉️ Send Text
**POST** `/send.php`

**Params**
- `number`
- `type=text`
- `message`
- `instance_id`
- `access_token`

---

### 📝 Send Template
**POST** `/send.php`

**Params**
- `number`
- `type=template`
- `message` (Template Name)
- `instance_id`
- `access_token`

---

### 📎 Send Media & File
**POST** `/send.php`

**Params**
- `number`
- `type=media`
- `message`
- `media_url`
- `filename` (optional, only for documents)
- `instance_id`
- `access_token`

---

### 📞 Check Phone
**POST** `/send.php`

**Params**
- `number`
- `type=check_phone`
- `instance_id`
- `access_token`

---

# 👥 Group API

### 💬 Send Text to Group
**POST** `/sendgroupmsg.php`

**Params**
- `group_id`
- `type=text`
- `message`
- `instance_id`
- `access_token`

---

### 📎 Send Media/File to Group
**POST** `/sendgroupmsg.php`

**Params**
- `group_id`
- `type=media`
- `message`
- `media_url`
- `filename` (optional)
- `instance_id`
- `access_token`

---

# 📇 Manage Contact Groups

### ➕ Add Phone
**POST** `/contact_groups.php`

**Params**
- `contact` (phone or group_id)
- `name`
- `type=add`
- `group_id`
- `access_token`

---

### ➖ Remove Phone
**POST** `/contact_groups.php`

**Params**
- `contact`
- `type=remove`
- `group_id`
- `access_token`

---
