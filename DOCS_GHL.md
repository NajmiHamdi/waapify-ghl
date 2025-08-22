ok ni info terbaru dari documentations untuk integrations Plugin Waapify x GHL


boleh baca keseluruhan dan tengok apa yg kita salah buat dlm projek kita yg menyebabkan plugin kita xberjaya untuk guna as sms providers. dlm section ni ada documentations yg ajar mcm mana nk replace default sms provider. "SMS (Replace default SMS provider)
Description: This enables a SMS provider to replace the default twilio/LC-Phone provider." so aku rasa benda ni paling penting ko perlukan untuk cek kod kita. sbb kita ada masalah sms provider tak appear tuh.

and then ko study juga api doc lain dibawah kot2 kita punya kod ada salah mana2, seterusnya.


========================================

section ni paling ko kena basa 1 by 1 and take high allert and think hard and learn to solve our problem.

https://marketplace.gohighlevel.com/docs/marketplace-modules/ConversationProviders


Conversation Providers
HighLevel provides conversation providers in marketplace applications for creating custom SMS, Email, and Call providers.

Setting up Custom Providers
Create a Marketplace Application
First you'll need to create a marketplace application:

Navigate to https://marketplace.gohighlevel.com
Go to the Auth section
Add your scopes (see notes below)
Add redirect, client keys, then click save
Scopes
Below are the various scopes necessary to use custom conversation providers. Review all scope documentation here: https://marketplace.gohighlevel.com/docs/oauth/Scopes

Scope	Purpose
conversations/message.write	Conversations Provider Outbound Message Webhook Events, Adding inbound messages. Add external outbound call logs. Upload attachments to conversations. Update message statuses.
conversations.readonly	Query conversations APIs
conversations.write	Create/Update/Delete conversation. One conversationId is maintained per contact.
contacts.readonly, contacts.write	Create/Update contacts
conversations/message.readonly	Recordings/Transcriptions and Outbound Message Webhook Event
Conversation Provider Configuration
After you create your provider you will have an "ID" which is the "conversationProviderId".

SMS (Replace default SMS provider)
Description: This enables a SMS provider to replace the default twilio/LC-Phone provider.

Enter a Name
Type: SMS
Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
NOTE: Do not checkbox "Is this a Custom Conversation Provider"

Add Inbound Message API: Use type "SMS". "conversationProviderId" is not required. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message

Enable The Provider: Navigate to the sub-accounts Settings > Phone Numbers > Advanced Settings > SMS Provider. Click your provider and then click save to save it.

Workflows: Supports standard SMS modules.

Bulk Actions: Supported

SMS (Add new conversation channel)
Description: This adds an additional SMS custom conversation provider.

Enter a Name
Type: SMS
Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
Checkbox "Is this a Custom Conversation Provider"
Conversations Tab - Optional - Checkbox "Always show this Conversation Provider" - If you want a tab in the conversations window to respond on the provider.
Alias - Optional - Changes the name of the provider in the conversations tab
Logo - Optional
Add Inbound Message API: Use type "SMS". "conversationProviderId" is required. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message

Enable The Provider: Enabled upon installation. Visit Settings > Conversation Providers to review installed providers.

Workflows: You can build premium workflow actions in your marketplace application. SMS module is not currently supported.

Email Provider (default)
Description: This enables an Email provider to replace the default mailgun/LC-Email provider.

Enter a Name
Type: Email
Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
NOTE: Do not checkbox "Is this a Custom Conversation Provider"

Add Inbound Message API: Use type "Email". "emailMessageId" in the response is the thread to respond to. "conversationProviderId" is not required. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message

Enable The Provider: Navigate to the sub-accounts Settings > Email Services > Click your provider and then click save to save it.

Workflows: Supports standard Email modules. Triggers are unsupported currently. Use premium workflow actions.

Bulk Actions: Supported

Email Provider (extra)
Description: This adds an additional Email custom conversation provider.

Enter a Name
Type: Email
Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
Checkbox "Is this a Custom Conversation Provider"
Conversations Tab - Optional - Checkbox "Always show this Conversation Provider" - If you want a tab in the conversations window to respond on the provider.
Alias - Optional - Changes the name of the provider in the conversations tab
Logo - Optional
Add Inbound Message API: Use type "Custom". You can also set "altId". When you reply in the UI the conversation provider outbound payload will add "replyToAltId". "conversationProviderId" is required. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message

Enable The Provider: Enabled upon installation. Visit Settings > Conversation Providers to review installed providers.

Workflows: You can build premium workflow actions in your marketplace application. Triggers and Email modules are unsupported currently.

Call Provider
Description: This adds a call provider. It is specifically for adding call logs and can also add attachments like voicemails to a conversation. It is not used to replace the voice/SIP connection.

Enter a Name
Type: Call
Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
Add Inbound Message API: Use type "Call". Supply the call object payload and ensure the "from" phone matches an existing contact. Used for adding inbound call logs. "conversationProviderId" is required. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message

Add an External Outbound Call API: Used to add outbound direction logs. Ensure the "to" phone number matches an existing contact. https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-outbound-message

Webhook Events
Conversations Provider Outbound Message Webhook Events https://marketplace.gohighlevel.com/docs/webhook/ProviderOutboundMessage

Purpose: Outbound events that are distinct from the Outbound Message Event payload.

Outbound Message Events https://marketplace.gohighlevel.com/docs/webhook/OutboundMessage

Purpose: Monitors all outbound messages/channels

Additional Notes
Using Providers
Conversations Screen - Navigate to the conversations screen to send/receive messages if a provider is set as the default or if you have enabled the ability to see the provider.

Bulk Actions - Only supported on default providers at this time.

Workflows - Review notes on currently supported modules.

Mobile Application - Select your custom provider depending on type.

Update Message Status API
Message status updates are only able to be updated by the conversation provider marketplace application tokens. If you have additional marketplace applications installed in your account then they cannot update the message status. https://marketplace.gohighlevel.com/docs/ghl/conversations/update-message-status



===================


https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message/index.html

Add an inbound message
POST
https://services.leadconnectorhq.com/conversations/messages/inbound
Post the necessary fields for the API to add a new inbound message.

Requirements
Scope(s)
conversations/message.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

application/json
Bodyrequired
type
string
required
Message Type

Possible values: [SMS, Email, WhatsApp, GMB, IG, FB, Custom, WebChat, Live_Chat, Call]

Example:SMS
attachments
string[]
Array of attachments

message
string
Message Body

conversationId
string
required
Conversation Id

Example:ve9EPM428h8vShlRW1KT
conversationProviderId
string
required
Conversation Provider Id

Example:61d6d1f9cdac7612faf80753
html
string
HTML Body of Email

subject
string
Subject of the Email

emailFrom
string
Email address to send from. This field is associated with the contact record and cannot be dynamically changed.

Example:sender@company.com
emailTo
string
Recipient email address. This field is associated with the contact record and cannot be dynamically changed.

emailCc
string[]
List of email address to CC

Example:["john1@doe.com","john2@doe.com"]
emailBcc
string[]
List of email address to BCC

Example:["john1@doe.com","john2@doe.com"]
emailMessageId
string
Send the email message id for which this email should be threaded. This is for replying to a specific email

altId
string
external mail provider's message id

Example:61d6d1f9cdac7612faf80753
direction
object
Message direction, if required can be set manually, default is outbound

Default value: outbound
Example:["outbound","inbound"]
date
date-time
Date of the inbound message

call
object
Responses
200
400
401
Created the message
application/json
Schema
Example (auto)
Schema
success
boolean
required
conversationId
string
required
Conversation ID.

Example:ABC12h2F6uBrIkfXYazb
messageId
string
required
This is the main Message ID

Example:t22c6DQcTDf3MjRhwf77
message
string
required
contactId
string
dateAdded
date-time
emailMessageId
string
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');
let data = JSON.stringify({
  "type": "SMS",
  "attachments": [
    "string"
  ],
  "message": "string",
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "html": "string",
  "subject": "string",
  "emailFrom": "sender@company.com",
  "emailTo": "string",
  "emailCc": [
    "john1@doe.com",
    "john2@doe.com"
  ],
  "emailBcc": [
    "john1@doe.com",
    "john2@doe.com"
  ],
  "emailMessageId": "string",
  "altId": "61d6d1f9cdac7612faf80753",
  "direction": [
    "outbound",
    "inbound"
  ],
  "date": "2024-07-29T15:51:28.071Z",
  "call": {
    "to": "+15037081210",
    "from": "+15037081210",
    "status": "completed"
  }
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/messages/inbound',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
Version — headerrequired

---
Body
 required
{
  "type": "SMS",
  "attachments": [
    "string"
  ],
  "message": "string",
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "html": "string",
  "subject": "string",
  "emailFrom": "sender@company.com",
  "emailTo": "string",
  "emailCc": [
    "john1@doe.com",
    "john2@doe.com"
  ],
  "emailBcc": [
    "john1@doe.com",
    "john2@doe.com"
  ],
  "emailMessageId": "string",
  "altId": "61d6d1f9cdac7612faf80753",
  "direction": [
    "outbound",
    "inbound"
  ],
  "date": "2024-07-29T15:51:28.071Z",
  "call": {
    "to": "+15037081210",
    "from": "+15037081210",
    "status": "completed"
  }
}
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!


=============================

https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-outbound-message/index.html

Add an external outbound call
POST
https://services.leadconnectorhq.com/conversations/messages/outbound
Post the necessary fields for the API to add a new outbound call.

Requirements
Scope(s)
conversations/message.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

application/json
Bodyrequired
type
string
required
Message Type

Possible values: [Call]

Example:Call
attachments
string[]
Array of attachments

conversationId
string
required
Conversation Id

Example:ve9EPM428h8vShlRW1KT
conversationProviderId
string
required
Conversation Provider Id

Example:61d6d1f9cdac7612faf80753
altId
string
external mail provider's message id

Example:61d6d1f9cdac7612faf80753
date
date-time
Date of the outbound message

call
object
Responses
200
400
401
Created the message
application/json
Schema
Example (auto)
Schema
success
boolean
required
conversationId
string
required
Conversation ID.

Example:ABC12h2F6uBrIkfXYazb
messageId
string
required
This is the main Message ID

Example:t22c6DQcTDf3MjRhwf77
message
string
required
contactId
string
dateAdded
date-time
emailMessageId
string
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');
let data = JSON.stringify({
  "type": "Call",
  "attachments": [
    "string"
  ],
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "altId": "61d6d1f9cdac7612faf80753",
  "date": "2024-07-29T15:51:28.071Z",
  "call": {
    "to": "+15037081210",
    "from": "+15037081210",
    "status": "completed"
  }
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/messages/outbound',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
Version — headerrequired

---
Body
 required
{
  "type": "Call",
  "attachments": [
    "string"
  ],
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "altId": "61d6d1f9cdac7612faf80753",
  "date": "2024-07-29T15:51:28.071Z",
  "call": {
    "to": "+15037081210",
    "from": "+15037081210",
    "status": "completed"
  }
}
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!


==================


https://marketplace.gohighlevel.com/docs/webhook/ProviderOutboundMessage/index.html

Conversation Provider - Outbound Message
Called whenever a user sends a message to a contact and has a custom provider as the default channel in the settings.

Conversation Provider - Outbound Message differs from the structure of our other webhooks which may appear similar upon first glance however, the documentation below is accurate and only what is listed will be necessary for a successful execution.

Channel	Supported Modules
SMS	Web App, Mobile App, Workflows, Bulk Actions
Email	Web App, Mobile App, Workflows, Bulk Actions
Schema
{
  "type": "object",
  "properties": {
    "contactId": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "messageId": {
      "type": "string"
    },
    "emailMessageId": {
      "type": "string"
    },
    "type": {
      "type": "Email/SMS"
    },
    "attachments": {
      "type": "array"
    },
    "message": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "emailTo": {
      "type": "string"
    },
    "emailFrom": {
      "type": "string"
    },
    "html": {
      "type": "string"
    },
    "subject": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    }
  }
}

Example for SMS
{
  "contactId": "GKBhT6BfwY9mjzXAU3sq",
  "locationId": "GKAWb4yu7A4LSc0skQ6g",
  "messageId": "GKJxs4P5L8dWc5CFUITM",
  "type": "SMS",
  "phone": "+15864603685",
  "message": "The text message to be sent to the contact",
  "attachments": ["https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"],
  "userId": "GK56r6wdJDrkUPd0xsmx"
}


Example for Email
{
  "contactId": "GKKFF0QB9gV8fGA6zEbr",
  "locationId": "GKifVDyQeo7nwe27vMP0",
  "messageId": "GK56r6wdJDrkUPd0xsmx",
  "emailMessageId": "GK56r6wdJDrkUPd0xsmx",
  "type": "Email",
  "emailTo": ["abc@gmail.com"],
  "emailFrom": "From Name <email@gmail.com>",
  "attachments": ["https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"],
  "html": "<div style=\"font-family: verdana, geneva; font-size: 11pt;\"><p>Testing an outobund email from custom provider.</p></div>",
  "subject": "Subject from Conversation Page",
  "userId": "GK56r6wdJDrkUPd0xsmx"
}


=================

https://marketplace.gohighlevel.com/docs/webhook/OutboundMessage/index.html

OutboundMessage
Called whenever a user sends a message to a contact.

Channel
Call
Voicemail
SMS
GMB
FB
IG
Email
Live Chat
Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "contentType": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "messageId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    },
    "callDuration": {
      "type": "number"
    },
    "callStatus": {
      "type": "string"
    }
  }
}

Example(Message)
{
  "type": "OutboundMessage",
  "locationId": "l1C08ntBrFjLS0elLIYU",
  "attachments": [],
  "body": "This is a test message",
  "contactId": "cI08i1Bls3iTB9bKgFJh",
  "contentType": "text/plain",
  "conversationId": "fcanlLgpbQgQhderivVs",
  "dateAdded": "2021-04-21T11:31:45.750Z",
  "direction": "inbound",
  "messageType": "SMS",
  "source": "app",
  "status": "delivered",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}

Example(Call and Voicemail)
{
  "type": "OutboundMessage",
  "locationId": "0d48aEf7q67DAu134bpy", 
  "attachments": ["call recording url"],
  "contactId": "gblakL5aYQC4glDtP1r2t3",
  "conversationId": "SGDqZrzmwTr19d10aHkt9F",
  "dateAdded": "2024-05-08T11:57:42.250Z",
  "direction": "outbound",
  "messageType": "CALL",
  "userId": "xsmF1xxhmC92ZpL1lj7aLa",
  "messageId": "tyW42xCD0HQpb3hhfLcx",
  "status": "completed",
  "callDuration": 120,
  "callStatus": "completed"
}

Call Status Details
For outbound calls:

When the call is answered by a person, status will be completed and callStatus will be completed
When the call reaches voicemail, status will be completed and callStatus will be voicemail
The callDuration field indicates the length of the call in seconds
Example(Voicemail send through workflow)
{
  "type": "OutboundMessage",
  "locationId": "0d48aEf7q67DAuXUxbpy",
  "attachments": ["voicemail url"],
  "contactId": "gb7xwL5aYQC4glDtP1r5",
  "conversationId": "SGDqZrzmwTr5P7aHkt9F",
  "dateAdded": "2024-05-08T12:04:55.828Z",
  "direction": "outbound",
  "messageType": "VoiceMail",
  "messageId": "hhYtaQM2I9ym8qhU9CmM",
  "status": "completed"
}

Email Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "emailMessageId": {
      "type": "string"
    },
    "threadId": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "cc": {
      "type": "string"
    },
    "bcc": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    }
  }
}

Example(Email)
{
  "type": "OutboundMessage",
  "locationId": "kF4NJ5gzRyQF2gKFD34G",
  "body": "<div style=\"font-family: verdana, geneva; font-size: 11pt;\">Testing Email Notification</div>",
  "contactId": "3bN9f8LYJFG8F232XMUbfq",
  "conversationId": "yCdNo6pwyTLYKgg6V2gj",
  "dateAdded": "2024-01-12T12:59:04.045Z",
  "direction": "outbound",
  "messageType": "Email",
  "emailMessageId": "sddfDSF3G56GHG",
  "from": "Internal Notify <sample@email.service>",
  "threadId": "sddfDSF3G56GHG",
  "subject": "Order Confirmed",
  "to": ["example@email.com"],
  "source": "app",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}



=============


https://marketplace.gohighlevel.com/docs/ghl/conversations/update-message-status/index.html


Update message status
PUT
https://services.leadconnectorhq.com/conversations/messages/:messageId/status
Post the necessary fields for the API to update message status.

Requirements
Scope(s)
conversations/message.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

Path Parameters
messageId
string
required
Message Id

Example: ve9EPM428h8vShlRW1KT
application/json
Bodyrequired
status
string
required
Message status

Possible values: [delivered, failed, pending, read]

Example:read
error
object
emailMessageId
string
Email message Id

Example:ve9EPM428h8vShlRW1KT
recipients
string[]
Email delivery status for additional email recipients.

Responses
200
400
401
Created the message
application/json
Schema
Example (auto)
Schema
conversationId
string
required
Conversation ID.

Example:ABC12h2F6uBrIkfXYazb
emailMessageId
string
This contains the email message id (only for Email type). Use this ID to send inbound replies to GHL to create a threaded email.

Example:rnGyqh2F6uBrIkfhFo9A
messageId
string
required
This is the main Message ID

Example:t22c6DQcTDf3MjRhwf77
messageIds
string[]
When sending via the GMB channel, we will be returning list of messageIds instead of single messageId.

msg
string
Additional response message when sending a workflow message

Example:Message queued successfully.
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');
let data = JSON.stringify({
  "status": "read",
  "error": {
    "code": "1",
    "type": "saas",
    "message": "There was an error from the provider"
  },
  "emailMessageId": "ve9EPM428h8vShlRW1KT",
  "recipients": [
    "string"
  ]
});

let config = {
  method: 'put',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/messages/:messageId/status',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
messageId — pathrequired
Message Id
Version — headerrequired

---
Body
 required
{
  "status": "read",
  "error": {
    "code": "1",
    "type": "saas",
    "message": "There was an error from the provider"
  },
  "emailMessageId": "ve9EPM428h8vShlRW1KT",
  "recipients": [
    "string"
  ]
}
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!


==========

https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide

Webhook Integration Guide
What are Webhooks?
Webhooks are a way for applications to communicate in real-time. Think of them as automatic notifications that are sent to your application when something happens in our platform.

Real-World Example
Imagine you're building an e-commerce app:

When a customer places an order → You get a webhook notification
When the order status changes → You get another webhook notification
When the payment is processed → You get yet another notification
This way, your app stays updated without constantly asking "has anything changed?"

Getting Started
Step 1: Create Your Webhook Endpoint
First, you need a public URL that can receive webhook notifications. Here are some options:

Option A: Use a Cloud Service
Heroku: Deploy a simple web app
AWS Lambda: Serverless function
Google Cloud Functions: Serverless function
Vercel: Easy deployment platform
Option B: Use a Webhook Testing Service
webhook.site: Get a temporary URL for testing
ngrok: Expose your local server to the internet
Option C: Use Your Own Server
Deploy a web application on your server
Ensure it's accessible via HTTPS
Step 2: Create a Simple Webhook Handler
Here's a basic example using Node.js and Express:

const express = require('express')
const app = express()

// Parse JSON requests
app.use(express.json())

// Your webhook endpoint
app.post('/webhooks', (req, res) => {
  console.log('Received webhook:', req.body)

  // Process the webhook data here
  const eventType = req.body.type
  const eventData = req.body.data

  // Handle different event types
  switch (eventType) {
    case 'ContactCreate':
      console.log('New contact created:', eventData)
      // Add your logic here
      break
    case 'ContactUpdate':
      console.log('Contact updated:', eventData)
      // Add your logic here
      break
    default:
      console.log('Unknown event type:', eventType)
  }

  // Always respond with 200 OK
  res.status(200).json({ success: true })
})

// Start your server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`)
})

Step 3: Test Your Endpoint
Before connecting to our platform, test your endpoint:

curl -X POST https://your-app.com/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ContactCreate",
    "timestamp": "2025-01-28T14:35:00.000Z",
    "webhookId": "test-123",
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }'

Available Webhook Events
We offer a comprehensive set of webhook events that cover all major activities in our platform. Here's a quick overview of the main event categories:

Event Categories
Contact Events: Contact creation, updates, deletion, and tag changes
Opportunity Events: Opportunity lifecycle management and status updates
Task Events: Task creation, completion, and deletion
Appointment Events: Calendar appointment scheduling and updates
Invoice Events: Invoice lifecycle from creation to payment
Product Events: Product catalog management
Association Events: Relationship management between records
Location Events: Location creation and updates
User Events: User account management
And many more...
Detailed Event Documentation
For complete details about each webhook event, including:

Exact payload structure for each event
Field descriptions and data types
Sample JSON responses
Event-specific examples
📖 View Complete Webhook Documentation →

This detailed documentation provides comprehensive information about every available webhook event, including exact payload structures, field descriptions, and real-world examples.

Security: Verifying Webhook Authenticity
Why Verification is Important
Webhooks can be spoofed by malicious actors. Always verify that webhooks are coming from our platform.

How to Verify
We use a private key to encrypt our webhooks which can be decrypted using our public key

GHL Public Key:
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAokvo/r9tVgcfZ5DysOSC
Frm602qYV0MaAiNnX9O8KxMbiyRKWeL9JpCpVpt4XHIcBOK4u3cLSqJGOLaPuXw6
dO0t6Q/ZVdAV5Phz+ZtzPL16iCGeK9po6D6JHBpbi989mmzMryUnQJezlYJ3DVfB
csedpinheNnyYeFXolrJvcsjDtfAeRx5ByHQmTnSdFUzuAnC9/GepgLT9SM4nCpv
uxmZMxrJt5Rw+VUaQ9B8JSvbMPpez4peKaJPZHBbU3OdeCVx5klVXXZQGNHOs8gF
3kvoV5rTnXV0IknLBXlcKKAQLZcY/Q9rG6Ifi9c+5vqlvHPCUJFT5XUGG5RKgOKU
J062fRtN+rLYZUV+BjafxQauvC8wSWeYja63VSUruvmNj8xkx2zE/Juc+yjLjTXp
IocmaiFeAO6fUtNjDeFVkhf5LNb59vECyrHD2SQIrhgXpO4Q3dVNA5rw576PwTzN
h/AMfHKIjE4xQA1SZuYJmNnmVZLIZBlQAF9Ntd03rfadZ+yDiOXCCs9FkHibELhC
HULgCsnuDJHcrGNd5/Ddm5hxGQ0ASitgHeMZ0kcIOwKDOzOU53lDza6/Y09T7sYJ
PQe7z0cvj7aE4B+Ax1ZoZGPzpJlZtGXCsu9aTEGEnKzmsFqwcSsnw3JB31IGKAyk
T1hhTiaCeIY/OwwwNUY2yvcCAwEAAQ==
-----END PUBLIC KEY-----

We include a digital signature in the x-wh-signature header. Here's how to verify it:

const crypto = require('crypto');
const publicKey = `<use_the_above_key>`;

function verifySignature(payload, signature) {
  const verifier = crypto.createVerify('SHA256');
  verifier.update(payload);
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
}

// Example usage
const payload = JSON.stringify({
  "timestamp": "2025-01-28T14:35:00Z",
  "webhookId": "abc123xyz",
  ...<add_other_webhook_data>
});

const signature = "<received-x-wh-signature>";
const isValid = verifySignature(payload, signature);
return isValid;

Setting Up Your Integration
1. Create Your OAuth Application
You'll need to create an OAuth application in our marketplace via the dashboard. This will give you:

A webhook URL to receive notifications
Access to specific data based on scopes
Ability to subscribe to specific events
2. Configure Your Webhook URL
After filling in all the mandatory information, head down to the Auth section under the advanced setting.

Select the scope of you application from the drop down

OAuth Scopes Configuration

3. Choose Your Events
After defining the scopes, head to the webhook section under the advanced settings

Turn on and paste your webhook URL against the events you wish to receive a webhook response to

Webhook URL Configuration

Handling Webhooks Reliably
Best Practices
Always Respond Quickly

Process webhooks asynchronously if needed
Return 200 OK immediately
Do heavy processing in the background
Handle Duplicates

Store webhook IDs to prevent duplicate processing
Make your processing idempotent (safe to run multiple times)
Log Everything

Log all incoming webhooks
Log processing results
Log errors for debugging
Example Implementation
const express = require('express')
const crypto = require('crypto')

const app = express()
app.use(express.json())

// Store processed webhook IDs (use a database in production)
const processedWebhooks = new Set()

app.post('/webhooks', async (req, res) => {
  try {
    // 1. Verify signature
    const signature = req.headers['x-wh-signature']
    if (!verifyWebhookSignature(req.body, signature)) {
      console.error('Invalid signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // 2. Check for duplicates
    if (processedWebhooks.has(req.body.webhookId)) {
      console.log('Duplicate webhook, skipping:', req.body.webhookId)
      return res.status(200).json({ message: 'Already processed' })
    }

    // 3. Log the webhook
    console.log('Processing webhook:', req.body.type, req.body.webhookId)

    // 4. Process asynchronously (don't block the response)
    setImmediate(() => {
      processWebhookAsync(req.body)
    })

    // 5. Mark as processed
    processedWebhooks.add(req.body.webhookId)

    // 6. Respond immediately
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(200).json({ success: false, error: 'Processing failed' })
  }
})

async function processWebhookAsync(webhook) {
  try {
    switch (webhook.type) {
      case 'ContactCreate':
        await handleNewContact(webhook.data)
        break
      case 'ContactUpdate':
        await handleContactUpdate(webhook.data)
        break
      // Add more cases as needed
    }
    console.log('Successfully processed webhook:', webhook.webhookId)
  } catch (error) {
    console.error('Failed to process webhook:', webhook.webhookId, error)
  }
}

function verifyWebhookSignature(payload, signature) {
  // Implementation from the security section above
}

Error Handling and Retries
How Our Retry System Works
If your webhook endpoint fails, we'll automatically retry:

Retry Triggers: 408 (timeout), 429 (rate limit), 5xx (server errors)
Max Retries: 10 attempts
Backoff Strategy: Exponential backoff with doubling
Minimum backoff: 10 seconds
Jitter: Random 1-10 second delay added to prevent thundering herd
Total retry duration: Up to 7200 seconds (2 hours) or 10 attempts, whichever occurs first
Understanding Jitter
What is Jitter? Jitter is a random delay added to retry attempts to prevent the "thundering herd" problem. When multiple webhooks fail at the same time, without jitter they would all retry at exactly the same time, potentially overwhelming your server.

How it works:

Only the first retry gets a random delay between 1-10 seconds added to the base backoff time
This spreads out the initial retry attempts, reducing server load
Example: If base backoff is 0s, actual delay could be 1-10s
Subsequent retries follow pure exponential backoff without additional jitter
Example retry timeline:

Example with 3s jitter:

First retry: 0s base + 3s jitter = 3s delay
Second retry: 10s base (no jitter) = 13s delay
Third retry: 20s base (no jitter) = 23s delay
Fourth retry: 40s base (no jitter) = 43s delay
And so on... (doubling continues until 10 attempts or 7200s, whichever occurs first)
What You Should Do
Return 200 OK for Success

res.status(200).json({ success: true })

Return 200 OK Even for Processing Errors

try {
  await processWebhook(req.body)
  res.status(200).json({ success: true })
} catch (error) {
  console.error('Processing failed:', error)
  // Still return 200 to acknowledge receipt
  res.status(200).json({ success: false, error: 'Processing failed' })
}

Only Return Error Codes for Real Issues

408: Your server is too slow
429: You're receiving too many requests
5xx: Your server is down or broken
Testing Your Integration
⚠️ Important: webhook.site and ngrok are popular and free tools for webhook testing, but GHL does not recommend using them for production applications.

1. Use a Webhook Testing Service
Start with webhook.site:

Go to webhook.site
Copy the unique URL
Use it as your webhook URL for testing
Watch incoming webhooks in real-time
2. Test Locally with ngrok
# Install ngrok
npm install -g ngrok

# Start your local server
node app.js

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL as your webhook URL
# Example: https://abc123.ngrok.io/webhooks

3. Test with Sample Data
// Test your webhook handler with sample data
const testWebhook = {
  type: 'ContactCreate',
  timestamp: new Date().toISOString(),
  webhookId: 'test-123',
  data: {
    id: 'contact_123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
}

// Send test request
fetch('http://localhost:3000/webhooks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testWebhook)
})

Common Issues and Solutions
Issue: "Invalid signature" errors
Solution: Make sure you're using the correct public key and verifying the entire payload.

Issue: Duplicate webhook processing
Solution: Store webhook IDs and check for duplicates before processing.

Issue: Webhooks timing out
Solution: Process webhooks asynchronously and respond quickly.

Issue: Missing webhook events
Solution: Check that you've subscribed to the correct events in your OAuth app.

Issue: Can't access webhook data
Solution: Ensure your OAuth app has the correct scopes for the data you need.

=========
https://marketplace.gohighlevel.com/docs/webhook/AppInstall


App
Called whenever an app is installed

Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "appId": {
      "type": "string"
    },
    "companyId": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "planId": {
      "type": "string"
    },
    "trial": {
      "type": "object",
      "properties": {
        "onTrial": {
          "type": "boolean"
        },
        "trialDuration": {
          "type": "number"
        },
        "trialStartDate": {
          "type": "Date"
        }
      }
    },
    "isWhitelabelCompany": {
      "type": "boolean"
    },
    "whitelabelDetails": {
      "type": "object",
      "properties": {
        "domain": {
          "type": "string"
        },
        "logoUrl": {
          "type": "string"
        }
      }
    },
    "companyName": {
      "type": "string"
    }
  }
}

Note: The User ID and Company ID may be available when a new token is generated. In case of app installation via future locations, you may not get these fields.
Example
For Location Level App Install if company is whitelabeled
{
  "type": "INSTALL",
  "appId": "ve9EPM428h8vShlRW1KT",
  "locationId": "otg8dTQqGLh3Q6iQI55w",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "userId": "otg8dTQqGLh3Q6iQI55w",
  "planId": "66a0419a0dffa47fb5f8b22f",
  "trial": {
    "onTrial": true,
    "trialDuration": 10,
    "trialStartDate": "2024-07-23T23:54:51.264Z"
  },
  "isWhitelabelCompany": true,
  "whitelabelDetails": {
    "domain": "example.com",
    "logoUrl": "https://example.com/logo.png"
  },
  "companyName": "Example Company"
}

For Location Level App Install if company is non whitelabeled
{
  "type": "INSTALL",
  "appId": "ve9EPM428h8vShlRW1KT",
  "locationId": "otg8dTQqGLh3Q6iQI55w",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "userId": "otg8dTQqGLh3Q6iQI55w",
  "planId": "66a0419a0dffa47fb5f8b22f",
  "trial": {
    "onTrial": true,
    "trialDuration": 10,
    "trialStartDate": "2024-07-23T23:54:51.264Z"
  },
  "isWhitelabelCompany": false,
  "whitelabelDetails": {},
  "companyName": "Example Company"
}

For Agency Level App Install
{
  "type": "INSTALL",
  "appId": "ve9EPM428h8vShlRW1KT",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "planId": "66a0419a0dffa47fb5f8b22f",
  "trial": {
    "onTrial": true,
    "trialDuration": 10,
    "trialStartDate": "2024-07-23T23:54:51.264Z"
  }
}

==========

https://marketplace.gohighlevel.com/docs/webhook/ConversationUnreadWebhook

Conversation
Called whenever a conversations unread status is updated

Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "unreadCount": {
      "type": "number"
    },
    "inbox": {
      "type": "boolean"
    },
    "starred": {
      "type": "boolean"
    },
    "deleted": {
      "type": "boolean"
    }
  }
}

Example
{
  "type": "ConversationUnreadUpdate",
  "locationId": "ADVlSQnPsdq3hinusd6C3",
  "id": "MzKIpg0rEIH2ZUGKf6BS",
  "contactId": "zsYhPBOUsEHtrK508Wm9",
  "deleted": false,
  "inbox": false,
  "starred": true,
  "unreadCount": 0
}

==========
https://marketplace.gohighlevel.com/docs/webhook/ExternalAuthConnected

EXTERNAL_AUTH_CONNECTED
Called whenever external authentication (OAuth2 or Basic) is connected successfully for an app/location/company.

Schema
{
  "type": "object",
  "properties": {
    "type": { "type": "string", "enum": ["EXTERNAL_AUTH_CONNECTED"] },
    "appId": { "type": "string" },
    "locationId": { "type": "string" },
    "companyId": { "type": "string" },
    "authType": { "type": "string", "enum": ["oauth2", "basic"] },
    "scopes": { "type": "string" },
    "isAutoRefreshTokenEnabled": { "type": "boolean" },
    "timestamp": { "type": "string", "format": "date-time" },
    "webhookId": { "type": "string" }
  },
  "required": ["type", "appId", "locationId", "companyId", "authType", "timestamp", "webhookId"]
}


Note: scopes and isAutoRefreshTokenEnabled are present only for OAuth2 connections.
Example
For OAuth2 External Auth Connection
{
  "type": "EXTERNAL_AUTH_CONNECTED",
  "appId": "6800a826637cd0457e0d11e1",
  "locationId": "76sPakGvkoG3WyTyZkhk",
  "companyId": "zzyG7A4x6bRJl5SlhQhH",
  "authType": "oauth2",
  "scopes": "crm.objects.contacts.write crm.schemas.contacts.write oauth crm.schemas.contacts.read crm.objects.contacts.read",
  "isAutoRefreshTokenEnabled": true,
  "timestamp": "2025-05-19T12:48:50.972Z",
  "webhookId": "42f1d489-dc91-4749-a2a2-8c441989a3b5"
}


For Basic Auth External Auth Connection
{
  "type": "EXTERNAL_AUTH_CONNECTED",
  "appId": "66e96b579245705d69e5ba6a",
  "locationId": "76sPakGvkoG3WyTyZkhk",
  "companyId": "zzyG7A4x6bRJl5SlhQhH",
  "authType": "basic",
  "timestamp": "2025-05-19T15:40:36.811Z",
  "webhookId": "3b12bbc1-0be0-4678-aa76-771e88d27423"
}

Note: The payload always includes type, appId, locationId, companyId, authType, timestamp, and webhookId. For OAuth2, scopes and isAutoRefreshTokenEnabled are also included.


==============

https://marketplace.gohighlevel.com/docs/webhook/InboundMessage

InboundMessage
Called whenever a contact sends a message to the user.

Channel
Call
Voicemail
SMS
GMB
FB
IG
Email
Live Chat
Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "contentType": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "messageId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    },
    "callDuration": {
      "type": "number"
    },
    "callStatus": {
      "type": "string"
    }
  }
}

Example(Message)
{
  "type": "InboundMessage",
  "locationId": "l1C08ntBrFjLS0elLIYU",
  "attachments": [],
  "body": "This is a test message",
  "contactId": "cI08i1Bls3iTB9bKgFJh",
  "contentType": "text/plain",
  "conversationId": "fcanlLgpbQgQhderivVs",
  "dateAdded": "2021-04-21T11:31:45.750Z",
  "direction": "inbound",
  "messageType": "SMS",
  "status": "delivered",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}

Example(Call)
{
  "type": "OutboundMessage",
  "locationId": "0d48aEf7q67DAu134bpy",
  "attachments": ["call recording url"],
  "contactId": "gblakL5aYQC4glDtP1r2t3",
  "conversationId": "SGDqZrzmwTr19d10aHkt9F",
  "dateAdded": "2024-05-08T11:57:42.250Z",
  "direction": "inbound",
  "messageType": "CALL",
  "userId": "xsmF1xxhmC92ZpL1lj7aLa",
  "messageId": "tyW42xCD0HQpb3hhfLcx",
  "status": "completed",
  "callDuration": 120,
  "callStatus": "completed"
}

Example for unattended incoming call going to voicemail -

{
  "type": "InboundMessage",
  "locationId": "0dalah57827q67DAuXUxbpy",
  "attachments": ["voicemail url"],
  "contactId": "gb7laj5aYQC4glDtP1r5",
  "conversationId": "SGDqZrzmwTA5P7LHkt9F",
  "dateAdded": "2024-05-08T12:00:56.193Z",
  "direction": "inbound",
  "messageType": "CALL",
  "messageId": "QkNS0DNje0FjoLQdD5O3",
  "status": "voicemail"
}

Call Status Details
For inbound calls:

When the call is answered by a person, status will be completed and callStatus will be completed
When the call goes to voicemail, status will be voicemail and callStatus will be voicemail
The callDuration field indicates the length of the call in seconds
Email Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "emailMessageId": {
      "type": "string"
    },
    "threadId": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "cc": {
      "type": "string"
    },
    "bcc": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    }
  }
}

Example(Email)
{
  "type": "InboundMessage",
  "locationId": "kF4NJ5gzRyQF2gKFD34G",
  "body": "<div style=\"font-family: verdana, geneva; font-size: 11pt;\">Testing Email Notification</div>",
  "contactId": "3bN9f8LYJFG8F232XMUbfq",
  "conversationId": "yCdNo6pwyTLYKgg6V2gj",
  "dateAdded": "2024-01-12T12:59:04.045Z",
  "direction": "inbound",
  "messageType": "Email",
  "emailMessageId": "sddfDSF3G56GHG",
  "from": "Internal Notify <sample@email.service>",
  "threadId": "sddfDSF3G56GHG",
  "subject": "Order Confirmed",
  "to": ["testprasath95@gmail.com"],
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}


For listening to inbound messages
You need to change the Messaging webhook to -

<https://services.leadconnectorhq.com/conversations/providers/twilio/inbound_message>

You can find it inside your Twilio Account -

Phone Numbers > Active Number > Click on the number > Messaging > A Message comes in

If you want to revert, here's the old messaging webhook url -

<https://services.leadconnectorhq.com/appengine/twilio/incoming_message>

==========

https://marketplace.gohighlevel.com/docs/webhook/OutboundMessage

OutboundMessage
Called whenever a user sends a message to a contact.

Channel
Call
Voicemail
SMS
GMB
FB
IG
Email
Live Chat
Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "contentType": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "messageId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    },
    "callDuration": {
      "type": "number"
    },
    "callStatus": {
      "type": "string"
    }
  }
}

Example(Message)
{
  "type": "OutboundMessage",
  "locationId": "l1C08ntBrFjLS0elLIYU",
  "attachments": [],
  "body": "This is a test message",
  "contactId": "cI08i1Bls3iTB9bKgFJh",
  "contentType": "text/plain",
  "conversationId": "fcanlLgpbQgQhderivVs",
  "dateAdded": "2021-04-21T11:31:45.750Z",
  "direction": "inbound",
  "messageType": "SMS",
  "source": "app",
  "status": "delivered",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}

Example(Call and Voicemail)
{
  "type": "OutboundMessage",
  "locationId": "0d48aEf7q67DAu134bpy", 
  "attachments": ["call recording url"],
  "contactId": "gblakL5aYQC4glDtP1r2t3",
  "conversationId": "SGDqZrzmwTr19d10aHkt9F",
  "dateAdded": "2024-05-08T11:57:42.250Z",
  "direction": "outbound",
  "messageType": "CALL",
  "userId": "xsmF1xxhmC92ZpL1lj7aLa",
  "messageId": "tyW42xCD0HQpb3hhfLcx",
  "status": "completed",
  "callDuration": 120,
  "callStatus": "completed"
}

Call Status Details
For outbound calls:

When the call is answered by a person, status will be completed and callStatus will be completed
When the call reaches voicemail, status will be completed and callStatus will be voicemail
The callDuration field indicates the length of the call in seconds
Example(Voicemail send through workflow)
{
  "type": "OutboundMessage",
  "locationId": "0d48aEf7q67DAuXUxbpy",
  "attachments": ["voicemail url"],
  "contactId": "gb7xwL5aYQC4glDtP1r5",
  "conversationId": "SGDqZrzmwTr5P7aHkt9F",
  "dateAdded": "2024-05-08T12:04:55.828Z",
  "direction": "outbound",
  "messageType": "VoiceMail",
  "messageId": "hhYtaQM2I9ym8qhU9CmM",
  "status": "completed"
}

Email Message Schema
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "conversationId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "direction": {
      "type": "string"
    },
    "messageType": {
      "type": "string"
    },
    "emailMessageId": {
      "type": "string"
    },
    "threadId": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "cc": {
      "type": "string"
    },
    "bcc": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "conversationProviderId": {
      "type": "string"
    }
  }
}

Example(Email)
{
  "type": "OutboundMessage",
  "locationId": "kF4NJ5gzRyQF2gKFD34G",
  "body": "<div style=\"font-family: verdana, geneva; font-size: 11pt;\">Testing Email Notification</div>",
  "contactId": "3bN9f8LYJFG8F232XMUbfq",
  "conversationId": "yCdNo6pwyTLYKgg6V2gj",
  "dateAdded": "2024-01-12T12:59:04.045Z",
  "direction": "outbound",
  "messageType": "Email",
  "emailMessageId": "sddfDSF3G56GHG",
  "from": "Internal Notify <sample@email.service>",
  "threadId": "sddfDSF3G56GHG",
  "subject": "Order Confirmed",
  "to": ["example@email.com"],
  "source": "app",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01"
}


==========

https://marketplace.gohighlevel.com/docs/webhook/ProviderOutboundMessage

Conversation Provider - Outbound Message
Called whenever a user sends a message to a contact and has a custom provider as the default channel in the settings.

Conversation Provider - Outbound Message differs from the structure of our other webhooks which may appear similar upon first glance however, the documentation below is accurate and only what is listed will be necessary for a successful execution.

Channel	Supported Modules
SMS	Web App, Mobile App, Workflows, Bulk Actions
Email	Web App, Mobile App, Workflows, Bulk Actions
Schema
{
  "type": "object",
  "properties": {
    "contactId": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "messageId": {
      "type": "string"
    },
    "emailMessageId": {
      "type": "string"
    },
    "type": {
      "type": "Email/SMS"
    },
    "attachments": {
      "type": "array"
    },
    "message": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "emailTo": {
      "type": "string"
    },
    "emailFrom": {
      "type": "string"
    },
    "html": {
      "type": "string"
    },
    "subject": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    }
  }
}

Example for SMS
{
  "contactId": "GKBhT6BfwY9mjzXAU3sq",
  "locationId": "GKAWb4yu7A4LSc0skQ6g",
  "messageId": "GKJxs4P5L8dWc5CFUITM",
  "type": "SMS",
  "phone": "+15864603685",
  "message": "The text message to be sent to the contact",
  "attachments": ["https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"],
  "userId": "GK56r6wdJDrkUPd0xsmx"
}


Example for Email
{
  "contactId": "GKKFF0QB9gV8fGA6zEbr",
  "locationId": "GKifVDyQeo7nwe27vMP0",
  "messageId": "GK56r6wdJDrkUPd0xsmx",
  "emailMessageId": "GK56r6wdJDrkUPd0xsmx",
  "type": "Email",
  "emailTo": ["abc@gmail.com"],
  "emailFrom": "From Name <email@gmail.com>",
  "attachments": ["https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"],
  "html": "<div style=\"font-family: verdana, geneva; font-size: 11pt;\"><p>Testing an outobund email from custom provider.</p></div>",
  "subject": "Subject from Conversation Page",
  "userId": "GK56r6wdJDrkUPd0xsmx"
}

==============

https://marketplace.gohighlevel.com/docs/marketplace-modules/WorkflowActionsAndTriggers


GoHighLevel Marketplace Workflow Triggers & Actions
GoHighLevel's Marketplace empowers developers to create custom Workflow Triggers and Workflow Actions, facilitating seamless integration with external applications and APIs. These tools are part of the LC Premium Triggers & Actions suite, which operates on a pay-per-execution model.

Prerequisites
Before creating a Marketplace Workflow Trigger or Action:

Enable Required Scope: Ensure the workflows.readonly scope is activated to access actions and triggers.
Install the App: The sub-account must have the relevant app installed from the Marketplace to utilize its triggers.
drawing

Creating a Marketplace Workflow Trigger
Video Walkthrough on How to create Marketplace Workflow Trigger

Access the Developer Portal
Sign in to the GoHighLevel Developer Portal.
Create a New Trigger
Navigate to the "Marketplace Workflow Triggers" section.
Click on "Create Trigger" to initiate the process.
drawing

Define Trigger Information
Name: Provide a descriptive name for your trigger.
Key: Assign a unique identifier (e.g., mycustomtrigger). This key is immutable and used to reference the trigger within workflows.
Icon: Select an icon to represent the trigger visually in the workflow builder.
Short Description: Write a brief explanation of what the trigger does.
Summary: Provide detailed information about the trigger's functionality and use cases.
drawing

Configure Trigger Data
Input a sample JSON payload that represents the data structure the trigger will handle. This sample is used to configure filters and custom variables.
drawing

Manage Filters
Filters allow users to define conditions under which the trigger activates.
drawing

Create New Filter:

Name: Enter a name for the filter.
Type: Choose from the following field types:
String (Simple text matching)
Select / Multi-Select
Dynamic
Required: Specify if the filter is mandatory.
Reference: Map the filter to a key in the sample trigger data.
Alters Dynamic Filter: If enabled, any changes made to this filter value will trigger/re-trigger loading the dynamic filters in the workflow trigger configuration UI.
drawing

Type: Select / Multi Select

drawing

Option Type is applicable only for Select and Multi Select field types.

Select one of the following option types:

Constants Load options by adding custom Label-Value constants
drawing

Internal Reference Load options from HighLevel Internal Modules. Select one of the HighLevel Modules to load options list.
drawing

Supported HighLevel Modules

drawing

External API Load option from external API endpoint
drawing

URL (GET) Provide a URL to support GET method and send a valid response as per the sample response structure shared below.

Headers Add headers as per your requirement

Sample Response Data

{
"options": [
  { "label": "Afghanistan", "value": "AF" },
  { "label": "Åland Islands", "value": "AX" },
  { "label": "Albania", "value": "AL" },
  { "label": "Algeria", "value": "DZ" },
  { "label": "American Samoa", "value": "AS" }
]
}

Type: Dynamic

Dynamic filters are used to build custom filters from an API call. The API call should return the below response structure to construct the filters in the Workflow trigger configuration form UI. Only one Dynamic type can be created per trigger.

drawing

URL (POST) Enter your API endpoint URL. When executed data is sent to this API endpoint via POST method in the below mentioned payload format and a valid response is expected as per the sample response structure shared below.

Headers Add headers as per your requirement

Sample Payload: The form data is sent as payload to the dynamic field API

{
  "data": {
    "name": "John Doe",
    "age": "29",
    "gender": "male",
    "hobbies": ["sports", "music"],
    "address": "My Address",
    "country": "US",
    "profileType": "public"
  },
  "extras": {
    "locationId": "xyz",
    "contactId": "abc",
    "workflowId": "def"
  },
  "meta": {
    "key": "custom_trigger_key",
    "version": "1.0"
  }
}

Sample Response Structure:

{
  "filters": [
    { "field": "name", "title": "Name", "fieldType": "string", "required": true },
    { "field": "gender", "title": "Gender", "fieldType": "select", "required": true,
      "options": [
        { "label": "Male", "value": "male" },
        { "label": "Female", "value": "female" }
      ]
    }
  ]
}

Sample structure for each Filter Type

String

{ "field": "name", "title": "Name", "fieldType": "string", "required": true }

Select

{
  "field": "gender",
  "title": "Gender",
  "fieldType": "select",
  "required": true,
  "options": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" }
  ]
}

Multiple Select

{
  "field": "hobbies",
  "title": "Hobbies",
  "fieldType": "multiselect",
  "required": true,
  "options": [
    { "label": "Sport", "value": "sport" },
    { "label": "Music", "value": "music" }
  ]
}

Manage Custom Variables
Custom variables allow users to map data from the trigger payload to variables used within the workflow.
drawing

Add Custom Variable:

Name: Enter a label for the variable.
Reference: Select a key from the sample trigger data to bind to this variable.
Set Up Subscription URL
The Subscription URL is an API endpoint that receives trigger configuration details whenever the trigger is created, updated, or deleted in a workflow.
drawing

URL (POST): Enter your API endpoint URL.
Headers: Add any required headers for the API call.
Payload Format: The payload sent to this endpoint will include trigger data, metadata, and additional information such as location ID, workflow ID, and company ID.
Trigger "CREATED" in workflow
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [],
    "eventType": "CREATED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}


Trigger "UPDATED" in workflow
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [
      {
        "field": "country",
        "id": "country",
        "operator": "==",
        "title": "Country",
        "type": "select",
        "value": "USA"
      }
    ],
    "eventType": "UPDATED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}


Trigger "DELETED" in workflow
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [
      {
        "field": "country",
        "id": "country",
        "operator": "==",
        "title": "Country",
        "type": "select",
        "value": "USA"
      }
    ],
    "eventType": "DELETED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}


Submit for Review
Once the trigger is configured:

drawing

Click on "Submit for Review."
drawing

Provide changelog information for the submitted version.
Upon approval, the trigger becomes available to all sub-accounts.
drawing

Version Management
Create New Version: Click on "+ New Version" to create a new draft version of the trigger. This version will prefill all previously published data.
drawing

Submit for Review: Each new version must be submitted for review and approved before it becomes live.
drawing

Delete Trigger
drawing

To delete a trigger, enter the trigger name to confirm deletion.
drawing

Once deleted, the trigger is permanently removed and cannot be restored.
Any workflows using the deleted trigger will skip its execution.
Can Workflows Execute Without Contact?
Workflow can run contactless without any Contact data dependency so you can send any payload data via Marketplace Triggers and use it in workflow.
You can proceed without contact and use actions that are not dependent on contact information. Custom Webhook, Google Sheet, Slack, ChatGPT and all Internal Tools can be executed without contact.
If necessary, you can use the Create/Update or Find Contact actions to retrieve the contact data to the workflow.
Examples:

Send order data to trigger and add the order information to google sheet, use if/else to categorize based on order value and send a slack notification.
Retrieve the contact with Contact ID using Find contact action
Creating a Marketplace Workflow Action
Access the Developer Portal
Sign in to the GoHighLevel Developer Portal.
Create a New Action
Navigate to the "Marketplace Workflow Actions" section.
Click on "Create Action" to initiate the process.
Define Action Information
Name: Provide a descriptive name for your action.
drawing

Key: Assign a unique identifier (e.g., mycustomaction). This key is immutable and used to reference the action within workflows.
Icon: Select an icon to represent the action visually in the workflow builder.
Short Description: Write a brief explanation of what the action does.
Summary: Provide detailed information about the action's functionality and use cases.
drawing

Action Configuration
Manage Fields
Construct form to collect the data required for sending to API

drawing

Create New Field
drawing

drawing

Name
Enter Field Name
Type
Select one of the following field types:
String, Numerical, Textarea, Select, Multiple Select, Radio, Toggle, Checkbox, Attachment, Rich Text Editor, Hidden, Dynamic
Required
Enable if this is a required field in workflow.
Reference
Enter unique reference key. The value of this field will be bind to the provided key. Example: action_a_name
Default Value
Enter or map a value. The value provided will be used as default value for this field when loaded in workflow.
Alters Dynamic Field
If enabled, any changes made to this field value will trigger/ re-trigger loading the dynamic fields to the workflow action configuration UI.
Validation Rules Validation Rules let you protect data quality by checking the value a user types into a form field, table cell, or configuration input before it is saved or passed downstream.
If the value fails the check, HighLevel blocks the save/submit action and shows a custom error message that you configure.
Typical use-cases
Scenario	Example
Lead-capture form	Require a properly-formatted US phone number
Web-hook payload	Ensure a “status” field matches one of allowed strings
Custom action param	Block users from entering Handlebar syntax in plain text
Field Types: Select / Multi Select / Radio
drawing

Option Type is applicable only for Select, Multi Select and Radio field types.

Select one of the following option types:

Constants
Load options by adding custom Label-Value constants
drawing

Internal Reference
Load options from HighLevel Internal Modules
drawing

Supported HighLevel Modules
drawing

External API
Load option from external API endpoint
drawing

URL (GET)
Provide a URL to support GET method and send a valid response as per the sample response structure shared below.

Headers
Add headers as per your requirement

Sample Response Data

{
  "options": [
    { "label": "Afghanistan", "value": "AF" },
    { "label": "Åland Islands", "value": "AX" },
    { "label": "Albania", "value": "AL" },
    { "label": "Algeria", "value": "DZ" },
    { "label": "American Samoa", "value": "AS" }
  ]
}

Field Type: Hidden
It will be hidden in the action configuration and the mapped data will be sent in the payload. Used to collect essential information such as company_id, customerid, etc., from system data or from your custom triggers.

drawing

Field Type: Dynamic
Dynamic fields are used to build custom fields from an API call. The API call should return the below response structure to construct the fields in the Workflow action configuration form UI. Only one Dynamic type can be created per action.

drawing

URL (POST)
Enter your API endpoint URL. When executed data is sent to this API endpoint via POST method.

Headers
Add headers as per your requirement

Sample Payload:

{
  "data": {
    "name": "John Doe",
    "age": "29",
    "gender": "male",
    "hobbies": ["sports", "music"],
    "address": "My Address",
    "country": "US",
    "profileType": "public",
    "dataShare": true,
    "tems": true
  },
  "extras": {
    "locationId": "xyz",
    "contactId": "abc",
    "workflowId": "def"
  },
  "meta": {
    "key": "custom_action_key",
    "version": "1.0"
  }
}

Sample Response Structure:
Sections are used to group the fields in UI

{
  "inputs": [
    {
      "section": "Personal Info",
      "fields": [
        { "field": "name", "title": "Name", "fieldType": "string", "required": true },
        { "field": "age", "title": "Age", "fieldType": "numerical", "required": true },
        { "field": "gender", "title": "Gender", "fieldType": "select", "required": true,
          "options": [
            { "label": "Male", "value": "male" },
            { "label": "Female", "value": "female" }
          ]
        }
      ]
    },
    {
      "section": "Location Info",
      "fields": [
        { "field": "village", "title": "Village", "fieldType": "string", "required": true },
        { "field": "city", "title": "City", "fieldType": "string", "required": true },
        { "field": "fullAddress", "title": "Your Full Address", "fieldType": "textarea", "required": true }
      ]
    }
  ]
}


Sample structure for each Field Types
String

{ "field": "name", "title": "Name", "fieldType": "string", "required": true }

Numeric

{ "field": "name", "title": "Name", "fieldType": "numeric", "required": true }

Textarea

{ "field": "description", "title": "Description", "fieldType": "textarea", "required": true }


Select

{
  "field": "gender",
  "title": "Gender",
  "fieldType": "select",
  "required": true,
  "options": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" }
  ]
}

Multiple Select

{
  "field": "hobbies",
  "title": "Hobbies",
  "fieldType": "multiselect",
  "required": true,
  "options": [
    { "label": "Sport", "value": "sport" },
    { "label": "Music", "value": "music" }
  ]
}

Radio

{
  "field": "profileType",
  "title": "Profile Type",
  "fieldType": "radio",
  "required": true,
  "options": [
    { "label": "Public", "value": "public" },
    { "label": "Private", "value": "private" }
  ]
}

Toggle

{ "field": "dataShare", "title": "Allow my data to be stored", "fieldType": "toggle", "required": true }


Checkbox

{ "field": "terms", "title": "Terms & conditions", "fieldType": "checkbox", "required": true }


Validation Rules (Types)
The Validation Rules feature helps app developers ensure data integrity by enforcing input checks on form fields. Developers can choose from three flexible validation methods:

drawing

Pre-defined Rules
Easily apply common validations such as email, phone number, URL, numerical values, and handlebar syntax checks.
drawing

Regex Support
Use custom regular expressions to validate inputs against specific patterns.
drawing

Arrow Function
Write custom arrow functions that receive the input value and return true or false based on whether the validation passes or fails.
drawing

For every validation rule, a custom error message must be provided to display meaningful feedback when validation fails.

Multi-branch
The Multi-Branch Feature enables the creation of branches that can dynamically adjust based on various predefined conditions. By allowing multiple branches within a workflow, each contact can be directed down the appropriate path based on their interactions or status.

Branch Section: Defines the name or identifier for the specific branch section.
Branch Section Description: Provides a brief description or details about the branch section.
Branch Name Label: Specifies the label that will be displayed for the branch name.
Branch Name Helptext: Offers additional information related to the branch name.
Delete Branch Title: Sets the title or label used when deleting a branch.
Delete Branch Description: Describes when a branch is deleted.

Options:

Allow New Branches: Enables users to add new branches within the action.
Is Predefined Branches Editable: Allows users to edit predefined branches within the action.
Show Branches Section: Displays the branch section details to the user.
Disabled Allow new branch
Sample payload for branches
{
  "data": {
    "name": "John Doe",
    "age": "29",
    "gender": "male",
    "hobbies": [ "sports", "music" ],
    "address": "My Address",
    "country": "US",
    "profileType": "public",
    "dataShare": true,
    "tems": true,
    "branches": [
      {
        "id": "a8d14b13-d7cc-4241-bd2c-53180f0ec278",
        "name": "Branch name",
        "fields": {
          "branchFieldKey": "branchFieldValue"
        }
      }
    ]
  },
  "extras": {
    "locationId": "xyz",
    "contactId": "abc",
    "workflowId": "def"
  },
  "meta": {
    "key": "custom_action_key",
    "version": "1.0"
  }
}

Action Execution
Allows you to choose between an API or a custom code.

API
URL (POST)
Enter your API endpoint URL. When this action is executed data is sent to this API endpoint via POST method.

Headers
Add required header data that has to be included while sending data to the API endpoint

Sample Payload:

{
  "data": {
    "name": "John Doe",
    "age": "29",
    "gender": "male",
    "hobbies": ["sports", "music"],
    "address": "My Address",
    "country": "US",
    "profileType": "public",
    "dataShare": true,
    "tems": true
  },
  "extras": {
    "locationId": "xyz",
    "contactId": "abc",
    "workflowId": "def"
  },
  "meta": {
    "key": "custom_action_key",
    "version": "1.0"
  }
}

Custom code
Custom Code allows users to create custom logic they want to achieve. This provides flexibility and control beyond the pre-built APIs, enabling users to automate complex tasks and integrate with various services not supported by API.

Code Editor

You can write the code in the Code Editor
You can input HTTP requests like Get, Put, Post, Delete etc via the button.
You can also use custom values using the picker.
Output should be a JavaScript Object or Array of Objects.
Test and format your Code

Testing the code is a mandatory step, if the test is not done then user will not be able to use the output of the code in the subsequent steps.
To test the code click on the "Test Code" button.
Post clicking on Run test button, if there are no errors in the code them it will show "Test Result Success" and if there is an error in code then the result will be "Test Result Failed" and you would have to recheck the code to remove the error.
You can also format the code using "Format code" button.
Pause Execution
This toggle is used the contact will be held at this action unless resume webhook is requested.
If this toggle is true then provided extras object needs to be passed as body payload for resume workflow endpoint.

Show API details button shows a sample response to be passed onto to the webhook for Success Execution and Failed Execution.

Sync: When the pause execution is turned off along with branching support, the contact will be moved to provided branch using branchId property from API response or from Custom Code using return statement. The branchId here will be the branch through with the contact will move forward.
Async: When the pause execution is turned off, the branch ID needs to be sent to the webhook for resuming which is present in "show API details" button. More info present in Pause functionality.
Response Data
Add sample response data to configure custom variables.

Enter a valid sample response JSON structure that will be sent as a response to the Send Data API endpoint.

Arrays are supported in response data. This data can be utilized in custom variables based on references and is available for use in Array Functions, Custom Code, and Custom Webhooks.

Manage Custom Variables
Add Custom variables using sample response data, for users to use in workflows.

drawing

Add Custom Variable
drawing

Name
Enter label name
Reference
Select a reference key from the sample response saved to Response Data.
Submit for Review
drawing

The action version will be in draft state by default. After updating the action information and configuration the action version should be submitted for review.

Click on Submit for review and add required changelog information for the submitted version.
drawing

Once approved the version submitted for review will be published live to all Sub-accounts.
drawing

Create New Version
Click on + New Version to create a new version for the action.

drawing

On clicking + New Version It will create a new draft version with all the previously published data prefilled.

drawing

Delete Action
Once an Action is deleted, it will be deleted permanently and cannot be restored. The deleted action will be removed from Marketplace App and Workflow Action list. If a deleted action is part of any workflow the action execution will be skipped.

drawing

Enter action name to confirm delete

drawing

*** drawing mean section tuh adalah images, so xleh paste sini gambar huhu

==============
https://marketplace.gohighlevel.com/docs/ghl/conversations/get-conversation

Get Conversation
GET
https://services.leadconnectorhq.com/conversations/:conversationId
Get the conversation details based on the conversation ID

Requirements
Scope(s)
conversations.readonly
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

Path Parameters
conversationId
string
required
Conversation ID as string

Example: tDtDnQdgm2LXpyiqYvZ6
Responses
200
400
401
Successful response
application/json
Schema
Example (auto)
Schema
contactId
string
required
Unique identifier of the contact associated with this conversation

Example:ve9EPM428kjkvShlRW1KT
locationId
string
required
Unique identifier of the business location where this conversation takes place

Example:ve9EPM428kjkvShlRW1KT
deleted
boolean
required
Flag indicating if this conversation has been moved to trash/deleted

Example:false
inbox
boolean
required
Flag indicating if this conversation is currently in the main inbox view

Example:true
type
number
required
Communication channel type for this conversation: 1 (Phone), 2 (Email), 3 (Facebook Messenger), 4 (Review), 5 (Group SMS), 6 (Internal Chat - coming soon)

unreadCount
number
required
Number of messages in this conversation that have not been read by the user

Example:1
assignedTo
string
Unique identifier of the team member currently responsible for handling this conversation

Example:ve9EPM428kjkvShlRW1KT
id
string
required
Unique identifier for this specific conversation thread

Example:ve9EPM428kjkvShlRW1KT
starred
boolean
Flag indicating if this conversation has been marked as important/starred by the user

Example:true
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/:conversationId',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
conversationId — pathrequired
Conversation ID as string
Version — headerrequired

---
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!

=============

https://marketplace.gohighlevel.com/docs/ghl/conversations/update-conversation


Update Conversation
PUT
https://services.leadconnectorhq.com/conversations/:conversationId
Update the conversation details based on the conversation ID

Requirements
Scope(s)
conversations.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

Path Parameters
conversationId
string
required
Conversation ID as string

Example: tDtDnQdgm2LXpyiqYvZ6
application/json
Bodyrequired
locationId
string
required
Location ID as string

Example:tDtDnQdgm2LXpyiqYvZ6
unreadCount
number
Count of unread messages in the conversation

Example:1
starred
boolean
Starred status of the conversation.

Example:true
feedback
object
Responses
200
400
401
Successful response
application/json
Schema
Example (auto)
Schema
success
boolean
required
Boolean value as the API response.

Example:true
conversation
object
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');
let data = JSON.stringify({
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "unreadCount": 1,
  "starred": true,
  "feedback": {}
});

let config = {
  method: 'put',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/:conversationId',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
conversationId — pathrequired
Conversation ID as string
Version — headerrequired

---
Body
 required
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "unreadCount": 1,
  "starred": true,
  "feedback": {}
}
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!


==========

https://marketplace.gohighlevel.com/docs/ghl/conversations/delete-conversation

Delete Conversation
DELETE
https://services.leadconnectorhq.com/conversations/:conversationId
Delete the conversation details based on the conversation ID

Requirements
Scope(s)
conversations.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

Path Parameters
conversationId
string
required
Conversation ID as string

Example: tDtDnQdgm2LXpyiqYvZ6
Responses
200
400
401
Successful response
application/json
Schema
Example (auto)
Schema
success
boolean
required
Boolean value as the API response.

Example:true
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');

let config = {
  method: 'delete',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/:conversationId',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
conversationId — pathrequired
Conversation ID as string
Version — headerrequired

---
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!


========

https://marketplace.gohighlevel.com/docs/ghl/conversations/create-conversation


Create Conversation
POST
https://services.leadconnectorhq.com/conversations/
Creates a new conversation with the data provided

Requirements
Scope(s)
conversations.write
Auth Method(s)
OAuth Access Token
Private Integration Token
Token Type(s)
Sub-Account Token
Request
Header Parameters
Version
string
required
Possible values: [2021-04-15]

API Version

application/json
Bodyrequired
locationId
string
required
Location ID as string

Example:tDtDnQdgm2LXpyiqYvZ6
contactId
string
required
Contact ID as string

Example:tDtDnQdgm2LXpyiqYvZ6
Responses
201
400
401
Successful response
application/json
Schema
Example (auto)
Schema
success
boolean
required
Indicates whether the API request was successful.

Example:true
conversation
object
Authorization: Authorization
curl
nodejs
python
php
java
go
ruby
powershell
AXIOS
NATIVE
REQUEST
UNIREST
const axios = require('axios');
let data = JSON.stringify({
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "contactId": "tDtDnQdgm2LXpyiqYvZ6"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://services.leadconnectorhq.com/conversations/',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


Request
Collapse all
Base URL
https://services.leadconnectorhq.com
Auth
Bearer Token
Bearer Token
Parameters
Version — headerrequired

---
Body
 required
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "contactId": "tDtDnQdgm2LXpyiqYvZ6"
}
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!



