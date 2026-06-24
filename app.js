(function () {
  "use strict";

  const defaults = {
    apiBaseUrl: "",
    authUser: "",
    authPassword: "",
    deviceId: "official bharath",
    jid: "917207446677@s.whatsapp.net",
    publicApiKey: "",
    useProxy: true
  };

  const state = {
    activeTab: "text",
    settings: loadSettings()
  };

  const el = {
    apiBaseUrl: byId("apiBaseUrl"),
    authUser: byId("authUser"),
    authPassword: byId("authPassword"),
    useProxy: byId("useProxy"),
    publicApiKey: byId("publicApiKey"),
    deviceId: byId("deviceId"),
    jid: byId("jid"),
    phone: byId("phone"),
    recipientType: byId("recipientType"),
    message: byId("message"),
    caption: byId("caption"),
    mediaFile: byId("mediaFile"),
    mediaUrl: byId("mediaUrl"),
    isForwarded: byId("isForwarded"),
    compress: byId("compress"),
    viewOnce: byId("viewOnce"),
    gifPlayback: byId("gifPlayback"),
    replyMessageId: byId("replyMessageId"),
    duration: byId("duration"),
    sendForm: byId("sendForm"),
    sendButton: byId("sendButton"),
    resetForm: byId("resetForm"),
    responseBox: byId("responseBox"),
    clearResponse: byId("clearResponse"),
    saveSettings: byId("saveSettings"),
    checkDevices: byId("checkDevices"),
    statusDot: byId("statusDot"),
    statusTitle: byId("statusTitle"),
    statusDetail: byId("statusDetail"),
    messageBlock: byId("messageBlock"),
    captionBlock: byId("captionBlock"),
    mediaBlock: byId("mediaBlock"),
    mediaFileLabel: byId("mediaFileLabel"),
    mediaUrlLabel: byId("mediaUrlLabel"),
    compressWrap: byId("compressWrap"),
    viewOnceWrap: byId("viewOnceWrap"),
    gifPlaybackWrap: byId("gifPlaybackWrap")
  };

  hydrateSettings();
  bindEvents();
  switchTab("text");
  setStatus("Ready", "Using device: " + state.settings.deviceId, false);

  function byId(id) {
    return document.getElementById(id);
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("gowaTesterSettings") || "{}");
      return Object.assign({}, defaults, saved);
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  function hydrateSettings() {
    el.apiBaseUrl.value = state.settings.apiBaseUrl;
    el.authUser.value = state.settings.authUser;
    el.authPassword.value = state.settings.authPassword;
    el.useProxy.checked = Boolean(state.settings.useProxy);
    el.publicApiKey.value = state.settings.publicApiKey || "";
    el.deviceId.value = state.settings.deviceId;
    el.jid.value = state.settings.jid;
  }

  function readSettings() {
    state.settings = {
      apiBaseUrl: trimSlash(el.apiBaseUrl.value.trim()),
      authUser: el.authUser.value.trim(),
      authPassword: el.authPassword.value,
      useProxy: el.useProxy.checked,
      publicApiKey: el.publicApiKey.value.trim(),
      deviceId: el.deviceId.value.trim(),
      jid: el.jid.value.trim()
    };
    return state.settings;
  }

  function saveSettings() {
    readSettings();
    localStorage.setItem("gowaTesterSettings", JSON.stringify(state.settings));
    setStatus("Settings saved", "Using device: " + state.settings.deviceId, false);
    printResponse({ ok: true, message: "Settings saved in this browser." });
  }

  function bindEvents() {
    document.querySelectorAll(".tab").forEach(function (button) {
      button.addEventListener("click", function () {
        switchTab(button.dataset.tab);
      });
    });

    el.saveSettings.addEventListener("click", saveSettings);
    el.checkDevices.addEventListener("click", checkDevices);
    el.sendForm.addEventListener("submit", handleSubmit);
    el.resetForm.addEventListener("click", resetForm);
    el.clearResponse.addEventListener("click", function () {
      el.responseBox.textContent = "No request sent yet.";
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll(".tab").forEach(function (button) {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    const isText = tab === "text";
    const isFile = tab === "file";
    const isVideo = tab === "video";
    const isMedia = !isText;

    el.messageBlock.classList.toggle("hidden", !isText);
    el.captionBlock.classList.toggle("hidden", isText);
    el.mediaBlock.classList.toggle("hidden", !isMedia);
    el.mediaUrlLabel.classList.toggle("hidden", isFile);
    el.compressWrap.classList.toggle("hidden", isText || isFile);
    el.viewOnceWrap.classList.toggle("hidden", isText || isFile);
    el.gifPlaybackWrap.classList.toggle("hidden", !isVideo);

    if (tab === "image") {
      el.mediaFile.accept = "image/png,image/jpg,image/jpeg,image/webp";
      el.mediaFileLabel.firstChild.textContent = "Select photo";
      el.mediaUrl.placeholder = "https://example.com/photo.jpg";
      el.sendButton.textContent = "Send Photo";
    } else if (tab === "video") {
      el.mediaFile.accept = "video/*";
      el.mediaFileLabel.firstChild.textContent = "Select video";
      el.mediaUrl.placeholder = "https://example.com/video.mp4";
      el.sendButton.textContent = "Send Video";
    } else if (tab === "file") {
      el.mediaFile.accept = "";
      el.mediaFileLabel.firstChild.textContent = "Select file";
      el.sendButton.textContent = "Send File";
    } else {
      el.sendButton.textContent = "Send Text Message";
    }
  }

  function resetForm() {
    el.sendForm.reset();
    switchTab(state.activeTab);
  }

  async function checkDevices() {
    readSettings();
    setBusy(el.checkDevices, true, "Checking");
    try {
      const response = await apiFetch("/devices", { method: "GET" });
      setStatus("Devices loaded", "See response panel for full details", false);
      printResponse(response);
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(el.checkDevices, false, "Check Devices");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    readSettings();

    try {
      validateSettings();
      validatePayload();
      setBusy(el.sendButton, true, "Sending");

      let response;
      if (state.activeTab === "text") {
        response = await sendText();
      } else {
        response = await sendMedia(state.activeTab);
      }

      setStatus("Sent", "WhatsApp API accepted the request", false);
      printResponse(response);
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(el.sendButton, false, buttonLabel());
    }
  }

  function validateSettings() {
    if (!state.settings.useProxy && !state.settings.apiBaseUrl) {
      throw new Error("API base URL is required.");
    }
    if (!state.settings.useProxy && (!state.settings.authUser || !state.settings.authPassword)) {
      throw new Error("Basic auth user and password are required.");
    }
    if (!state.settings.deviceId) {
      throw new Error("Device ID is required.");
    }
  }

  function validatePayload() {
    if (el.recipientType.value !== "status@broadcast" && !el.phone.value.trim()) {
      throw new Error("Recipient phone number is required.");
    }
    if (state.activeTab === "text" && !el.message.value.trim()) {
      throw new Error("Message text is required.");
    }
    if (state.activeTab !== "text" && state.activeTab !== "file") {
      const hasFile = el.mediaFile.files && el.mediaFile.files[0];
      const hasUrl = el.mediaUrl.value.trim();
      if (!hasFile && !hasUrl) {
        throw new Error("Select a media file or enter a media URL.");
      }
    }
    if (state.activeTab === "file" && !(el.mediaFile.files && el.mediaFile.files[0])) {
      throw new Error("Select a file to upload.");
    }
  }

  function recipientJid() {
    const type = el.recipientType.value;
    if (type === "status@broadcast") {
      return type;
    }
    const rawPhone = el.phone.value.trim();
    if (rawPhone.includes("@")) {
      return rawPhone;
    }
    return rawPhone.replace(/\D/g, "") + type;
  }

  async function sendText() {
    const payload = {
      phone: recipientJid(),
      message: el.message.value.trim(),
      is_forwarded: el.isForwarded.checked
    };
    addOptionalJsonFields(payload);
    return apiFetch("/send/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  async function sendMedia(kind) {
    const form = new FormData();
    form.append("phone", recipientJid());
    form.append("caption", el.caption.value.trim());
    form.append("is_forwarded", el.isForwarded.checked ? "true" : "false");
    addOptionalFormFields(form);

    if (kind === "image") {
      form.append("compress", el.compress.checked ? "true" : "false");
      form.append("view_once", el.viewOnce.checked ? "true" : "false");
      appendFileOrUrl(form, "image", "image_url");
      return apiFetch("/send/image", { method: "POST", body: form });
    }

    if (kind === "video") {
      form.append("compress", el.compress.checked ? "true" : "false");
      form.append("view_once", el.viewOnce.checked ? "true" : "false");
      form.append("gif_playback", el.gifPlayback.checked ? "true" : "false");
      appendFileOrUrl(form, "video", "video_url");
      return apiFetch("/send/video", { method: "POST", body: form });
    }

    form.append("file", el.mediaFile.files[0]);
    return apiFetch("/send/file", { method: "POST", body: form });
  }

  function appendFileOrUrl(form, fileField, urlField) {
    if (el.mediaFile.files && el.mediaFile.files[0]) {
      form.append(fileField, el.mediaFile.files[0]);
    }
    if (el.mediaUrl.value.trim()) {
      form.append(urlField, el.mediaUrl.value.trim());
    }
  }

  function addOptionalJsonFields(payload) {
    const replyMessageId = el.replyMessageId.value.trim();
    const duration = Number(el.duration.value || 0);
    if (replyMessageId) {
      payload.reply_message_id = replyMessageId;
    }
    if (duration > 0) {
      payload.duration = duration;
    }
  }

  function addOptionalFormFields(form) {
    const replyMessageId = el.replyMessageId.value.trim();
    const duration = Number(el.duration.value || 0);
    if (replyMessageId) {
      form.append("reply_message_id", replyMessageId);
    }
    if (duration > 0) {
      form.append("duration", String(duration));
    }
  }

  async function apiFetch(path, options) {
    const requestOptions = Object.assign({}, options || {});
    const headers = new Headers(requestOptions.headers || {});
    headers.set("X-Device-Id", state.settings.deviceId);
    if (!state.settings.useProxy) {
      headers.set("Authorization", "Basic " + btoa(state.settings.authUser + ":" + state.settings.authPassword));
    } else if (state.settings.publicApiKey) {
      headers.set("X-Api-Key", state.settings.publicApiKey);
    }
    requestOptions.headers = headers;

    const targetUrl = state.settings.useProxy ? "/api" + path : state.settings.apiBaseUrl + path;
    const response = await fetch(targetUrl, requestOptions);
    const contentType = response.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      const message = body && body.message ? body.message : "Request failed with HTTP " + response.status;
      const error = new Error(message);
      error.response = body;
      error.status = response.status;
      throw error;
    }

    return {
      status: response.status,
      body: body
    };
  }

  function setBusy(button, busy, label) {
    button.disabled = busy;
    button.textContent = label;
  }

  function setStatus(title, detail, isError) {
    el.statusTitle.textContent = title;
    el.statusDetail.textContent = detail;
    el.statusDot.classList.toggle("error", Boolean(isError));
  }

  function printResponse(data) {
    el.responseBox.textContent = JSON.stringify(data, null, 2);
  }

  function handleError(error) {
    const detail = error.status ? "HTTP " + error.status : "Request error";
    setStatus("Failed", detail, true);
    printResponse({
      ok: false,
      message: error.message,
      status: error.status || null,
      response: error.response || null,
      hint: "On Cloudflare Pages, keep proxy mode enabled. For direct mode, the Gowa API must allow Authorization and X-Device-Id in CORS."
    });
  }

  function buttonLabel() {
    if (state.activeTab === "image") {
      return "Send Photo";
    }
    if (state.activeTab === "video") {
      return "Send Video";
    }
    if (state.activeTab === "file") {
      return "Send File";
    }
    return "Send Text Message";
  }

  function trimSlash(value) {
    return value.replace(/\/+$/, "");
  }
})();
