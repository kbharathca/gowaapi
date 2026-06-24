# WhatsApp Cloudflare API Documentation

This API is served from Cloudflare Pages and forwards requests securely to the connected Gowa WhatsApp service.

## Base URL

Replace this with your real Cloudflare Pages or custom domain:

```text
https://gowaapi.pages.dev/api
```

If you connect a custom domain, use:

```text
https://api.yourdomain.com/api
```

All examples below use:

```text
BASE_URL=https://gowaapi.pages.dev/api
```

Do not call the Coolify/Gowa URL directly from client apps. Use the Cloudflare API only.

## Authentication

Every request should include the active device:

```text
X-Device-Id: official bharath
```

If `PUBLIC_API_KEY` is configured in Cloudflare Pages, every request must also include:

```text
X-Api-Key: YOUR_PUBLIC_API_KEY
```

## Phone Number Format

Use full WhatsApp JID format in API calls:

```text
919876543210@s.whatsapp.net
```

For normal Indian numbers, remove `+`, spaces, and dashes, then add `@s.whatsapp.net`.

Example:

```text
+91 98765 43210 -> 919876543210@s.whatsapp.net
```

## Main Endpoints

| Purpose | Method | Endpoint |
|---|---:|---|
| Check connected devices | GET | `/devices` |
| Send text message | POST | `/send/message` |
| Send photo/image | POST | `/send/image` |
| Send video | POST | `/send/video` |
| Send file/document | POST | `/send/file` |

## REST API Examples

### Check Devices

```bash
curl "$BASE_URL/devices" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY"
```

### Send Text Message

```bash
curl -X POST "$BASE_URL/send/message" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -d '{
    "phone": "919876543210@s.whatsapp.net",
    "message": "Hello from Cloudflare WhatsApp API",
    "is_forwarded": false
  }'
```

### Send Photo Upload

```bash
curl -X POST "$BASE_URL/send/image" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -F "phone=919876543210@s.whatsapp.net" \
  -F "caption=Photo caption text" \
  -F "compress=false" \
  -F "view_once=false" \
  -F "is_forwarded=false" \
  -F "image=@photo.jpg"
```

### Send Photo From URL

```bash
curl -X POST "$BASE_URL/send/image" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -F "phone=919876543210@s.whatsapp.net" \
  -F "caption=Photo from URL" \
  -F "image_url=https://example.com/photo.jpg"
```

### Send Video Upload

```bash
curl -X POST "$BASE_URL/send/video" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -F "phone=919876543210@s.whatsapp.net" \
  -F "caption=Video caption text" \
  -F "compress=false" \
  -F "view_once=false" \
  -F "gif_playback=false" \
  -F "is_forwarded=false" \
  -F "video=@video.mp4"
```

### Send Video From URL

```bash
curl -X POST "$BASE_URL/send/video" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -F "phone=919876543210@s.whatsapp.net" \
  -F "caption=Video from URL" \
  -F "video_url=https://example.com/video.mp4"
```

### Send File Or Document

```bash
curl -X POST "$BASE_URL/send/file" \
  -H "X-Device-Id: official bharath" \
  -H "X-Api-Key: YOUR_PUBLIC_API_KEY" \
  -F "phone=919876543210@s.whatsapp.net" \
  -F "caption=Document caption text" \
  -F "is_forwarded=false" \
  -F "file=@document.pdf"
```

## JavaScript Browser Fetch

### Send Text

```js
const BASE_URL = "https://gowaapi.pages.dev/api";

const response = await fetch(`${BASE_URL}/send/message`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Device-Id": "official bharath",
    "X-Api-Key": "YOUR_PUBLIC_API_KEY"
  },
  body: JSON.stringify({
    phone: "919876543210@s.whatsapp.net",
    message: "Hello from browser fetch",
    is_forwarded: false
  })
});

const data = await response.json();
console.log(data);
```

### Send Image Upload From HTML Form

```js
const form = new FormData();
form.append("phone", "919876543210@s.whatsapp.net");
form.append("caption", "Image from browser");
form.append("image", document.querySelector("#imageInput").files[0]);
form.append("compress", "false");
form.append("view_once", "false");

const response = await fetch(`${BASE_URL}/send/image`, {
  method: "POST",
  headers: {
    "X-Device-Id": "official bharath",
    "X-Api-Key": "YOUR_PUBLIC_API_KEY"
  },
  body: form
});
```

## Node.js API Usage

Node.js 18+ includes `fetch` and `FormData`.

### Send Text

```js
const BASE_URL = "https://gowaapi.pages.dev/api";

async function sendText() {
  const response = await fetch(`${BASE_URL}/send/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": "official bharath",
      "X-Api-Key": "YOUR_PUBLIC_API_KEY"
    },
    body: JSON.stringify({
      phone: "919876543210@s.whatsapp.net",
      message: "Hello from Node.js",
      is_forwarded: false
    })
  });

  console.log(await response.json());
}

sendText();
```

### Send File

```js
import { readFile } from "node:fs/promises";

const BASE_URL = "https://gowaapi.pages.dev/api";

const fileBuffer = await readFile("./document.pdf");
const form = new FormData();
form.append("phone", "919876543210@s.whatsapp.net");
form.append("caption", "PDF from Node.js");
form.append("file", new Blob([fileBuffer]), "document.pdf");

const response = await fetch(`${BASE_URL}/send/file`, {
  method: "POST",
  headers: {
    "X-Device-Id": "official bharath",
    "X-Api-Key": "YOUR_PUBLIC_API_KEY"
  },
  body: form
});

console.log(await response.json());
```

## Python API Usage

Install requests:

```bash
pip install requests
```

### Send Text

```python
import requests

BASE_URL = "https://gowaapi.pages.dev/api"
HEADERS = {
    "X-Device-Id": "official bharath",
    "X-Api-Key": "YOUR_PUBLIC_API_KEY",
}

payload = {
    "phone": "919876543210@s.whatsapp.net",
    "message": "Hello from Python",
    "is_forwarded": False,
}

response = requests.post(f"{BASE_URL}/send/message", json=payload, headers=HEADERS)
print(response.status_code)
print(response.json())
```

### Send Photo

```python
import requests

BASE_URL = "https://gowaapi.pages.dev/api"
HEADERS = {
    "X-Device-Id": "official bharath",
    "X-Api-Key": "YOUR_PUBLIC_API_KEY",
}

data = {
    "phone": "919876543210@s.whatsapp.net",
    "caption": "Photo from Python",
    "compress": "false",
    "view_once": "false",
}

with open("photo.jpg", "rb") as photo:
    files = {"image": ("photo.jpg", photo, "image/jpeg")}
    response = requests.post(f"{BASE_URL}/send/image", data=data, files=files, headers=HEADERS)

print(response.status_code)
print(response.json())
```

## PHP API Usage

### Send Text With cURL

```php
<?php
$baseUrl = "https://gowaapi.pages.dev/api";

$payload = [
    "phone" => "919876543210@s.whatsapp.net",
    "message" => "Hello from PHP",
    "is_forwarded" => false,
];

$ch = curl_init("$baseUrl/send/message");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-Device-Id: official bharath",
        "X-Api-Key: YOUR_PUBLIC_API_KEY",
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo $status . PHP_EOL;
echo $response . PHP_EOL;
```

### Send File With cURL

```php
<?php
$baseUrl = "https://gowaapi.pages.dev/api";

$postFields = [
    "phone" => "919876543210@s.whatsapp.net",
    "caption" => "PDF from PHP",
    "is_forwarded" => "false",
    "file" => new CURLFile(__DIR__ . "/document.pdf", "application/pdf", "document.pdf"),
];

$ch = curl_init("$baseUrl/send/file");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "X-Device-Id: official bharath",
        "X-Api-Key: YOUR_PUBLIC_API_KEY",
    ],
    CURLOPT_POSTFIELDS => $postFields,
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo $status . PHP_EOL;
echo $response . PHP_EOL;
```

## Postman Usage

1. Set request URL to `https://gowaapi.pages.dev/api/send/message`.
2. Set method to `POST`.
3. Add headers:
   - `Content-Type: application/json`
   - `X-Device-Id: official bharath`
   - `X-Api-Key: YOUR_PUBLIC_API_KEY`
4. Select Body -> raw -> JSON.
5. Use:

```json
{
  "phone": "919876543210@s.whatsapp.net",
  "message": "Hello from Postman",
  "is_forwarded": false
}
```

For image/video/file APIs, select Body -> form-data and add the correct file field:

```text
image  for /send/image
video  for /send/video
file   for /send/file
```

## Optional Fields

These optional fields can be included when supported by the endpoint:

| Field | Type | Applies To | Description |
|---|---|---|---|
| `reply_message_id` | string | text, image, video, file | Reply to a previous WhatsApp message |
| `duration` | number | text, image, video, file | Disappearing duration in seconds |
| `is_forwarded` | boolean/string | text, image, video, file | Mark message/media as forwarded |
| `compress` | boolean/string | image, video | Compress media |
| `view_once` | boolean/string | image, video | Enable WhatsApp view-once media |
| `gif_playback` | boolean/string | video | Play video as GIF-style media |

## Response Format

Successful responses usually look like:

```json
{
  "status": 200,
  "body": {
    "code": "SUCCESS",
    "message": "Message sent",
    "results": {}
  }
}
```

Errors usually include:

```json
{
  "code": "ERROR",
  "message": "Reason for failure"
}
```

## CORS

The Cloudflare API is browser-friendly and allows:

```text
Content-Type
Accept
X-Device-Id
X-Api-Key
```

Use the Cloudflare API base URL in frontend websites to avoid the direct Gowa CORS error.

## Important Limits

Cloudflare request upload limits depend on your Cloudflare plan. For very large videos or files, use a media URL when possible:

```text
video_url=https://example.com/video.mp4
image_url=https://example.com/photo.jpg
```
