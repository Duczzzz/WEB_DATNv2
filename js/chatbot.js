import devtools from "https://cdn.jsdelivr.net/npm/devtools-detect@4.0.2/index.js";
const userControl = ["admin", "duc", "luong"];
function checkUser() {
  var check = userControl.includes(user);
  if (!check) {
    return false;
  } else return true;
}
document.getElementById("logout").onclick = function () {
  let text = "Bạn có muốn đăng xuất ?";
  if (confirm(text) == true) {
    localStorage.removeItem("cards");
    let user = localStorage.getItem("username");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  } else {
    return;
  }
};
if (!checkUser() && devtools.isOpen) {
  window.location.href = "home.html";
  document.getElementById("titleofhome").innerText =
    "Hệ thống phát hiện devtools đang mở, vui lòng đóng devtools để sử dụng";
}
setInterval(() => {
  if (!checkUser() && devtools.isOpen) {
    window.location.href = "home.html";
  }
}, 100);
var wifi = localStorage.getItem("wifi") || "";
var pass = localStorage.getItem("pass") || "";
var apikey = localStorage.getItem("apikey") || "";
var tokengh = localStorage.getItem("tokengh") || "";
let client = null;
let octokit = null;
function loadConfig() {
  document.getElementById("SSID").value = wifi;
  document.getElementById("password").value = pass;
  document.getElementById("api-key").value = apikey;
  document.getElementById("token-github").value = tokengh;
  client = new OpenAI({
    apiKey: apikey,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true,
  });
  octokit = new Octokit({
    auth: tokengh,
  });
  document.getElementById("cb-warp").style.display = "flex";
  document.getElementById("system-box").style.display = "none";
  document.getElementById("SW-SYSTEM").checked = false;
}
if (wifi != "" && pass != "" && apikey != "" && tokengh != "") {
  loadConfig();
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  onValue,
  remove,
  onDisconnect,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyBliSd_F2NAl02D4FzMdtY0szkhpHdMf8c",
  authDomain: "doantn-885dc.firebaseapp.com",
  databaseURL: "https://doantn-885dc-default-rtdb.firebaseio.com",
  projectId: "doantn-885dc",
  storageBucket: "doantn-885dc.firebasestorage.app",
  messagingSenderId: "599011961788",
  appId: "1:599011961788:web:008c324dbfc6b3cf6699b9",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
document.getElementById("update-OTA").onclick = function () {
  set(ref(db, "/updateOTA"), 1);
};
function createCode(ssid, pass) {
  var code = `
  // Đây là source trống cho người dùng tự build trên board do Nuke Dashboard phát triển
  // Để có thể sử dụng source code này bạn cần cài danh sách các thư viện sau: 
  // + thư viện Adafruit NeoPixel by Adafruit
  // + thư viện Firebase ESP32 Client by Mobizt
  // + thư viện Adafruit GFX libraray by Adafruit
  // + thư viện Adafruit SSD1306 by Adafruit
  // Tác giả MinhDuc
  // 07/03/2026
  // Led RGB được cấu hình chân DIN ở GPIO9
  // BME280 SDA chân 8
  // BME280 SCL chân 18
  // BMP280 SDA chân 8
  // BMP280 SCL chân 18
  // Oled tft SDA chân 8
  // Oled tft SCL chân 18
  // DHT chân 11
  // Điều khiển driver động cơ chân GPIO16 và GPIO15

  #include <Wire.h>
  #include <FirebaseESP32.h>
  #include <WiFi.h>
  #include <Adafruit_NeoPixel.h>
  #include <Adafruit_GFX.h>
  #include <Adafruit_SSD1306.h>
  #include <HTTPClient.h>
  #include <Update.h>
  #include <Adafruit_Sensor.h>

  const char* ssid = "${wifi}";
  const char* pass = "${pass}";

  #define LED_PIN   9
  #define LED_COUNT 1
  Adafruit_NeoPixel led(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

  #define LED 2

  #define i2c_Address 0x3c
  #define SCREEN_WIDTH 128
  #define SCREEN_HEIGHT 64
  #define OLED_RESET -1
  Adafruit_SSD1306 display = Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

  const char* firmwareUrl = "https://raw.githubusercontent.com/Duczzzz/testOTA/main/firmware.ino.bin";

  #define DATABASE_URL "https://doantn-885dc-default-rtdb.firebaseio.com/"
  #define DATABASE_SECRET "rPb2lv5DjHze997hD9pxnzTzWJsir4wwdP1poStt"
  FirebaseData fbdo;
  FirebaseAuth auth;
  FirebaseConfig config;

  int checkupdate = 0;

  void getupdate()
  {
      display.setTextColor(SSD1306_WHITE);
      Firebase.setInt(fbdo, "/updateOTA",0);  
      Serial.print("Firmware URL: ");
      Serial.println(firmwareUrl);
      HTTPClient http;
      http.begin(firmwareUrl);
      Firebase.setInt(fbdo,"/updateOTA",0);
      int httpCode = http.GET();

      if (httpCode == HTTP_CODE_OK)
      {
        WiFiClient& client = http.getStream();
        int firmwareSize = http.getSize();
        display.clearDisplay();
        display.setTextSize(1);
        Serial.print("Firmware Size: ");
        Serial.println(firmwareSize);
        display.setCursor(0, 0);
        display.printf("Size: %d",firmwareSize);
        display.display();
        if (Update.begin(firmwareSize))
        {
            Update.onProgress([](size_t current, size_t total) {
                int percent = (current * 100) / total;

                Serial.printf("OTA %d%%\n", percent);

                display.clearDisplay();
                display.setCursor(0,0);
                display.print("Updating");

                display.setCursor(0,20);
                display.print(percent);
                display.print("%");
                display.drawRect(0, 30, 120, 10, SSD1306_WHITE);
                display.fillRect(
                      2,
                      32,
                      (percent * 116) / 100,
                      6,
                      SSD1306_WHITE);
                display.display();
            });
            size_t written = Update.writeStream(client);
            display.clearDisplay();
            if (Update.size() == written)
            {
                display.setCursor(0, 10);
                display.print("Update successfully completed");
                Serial.println("Update successfully completed. Rebooting...");
                if (Update.end())
                {
                    Serial.println("Rebooting...");
                    display.setCursor(0, 30);
                    display.printf("Rebooting...");
                    ESP.restart();
                } 
                else 
                {
                    Serial.print("Update failed: ");
                    display.setCursor(0, 30);
                    display.print("Update failed");
                    Serial.println(Update.errorString());
                }
            }
            else
            {
                display.setCursor(0, 30);
                display.print("Not enough space for OTA.");
                Serial.println("Not enough space for OTA.");
            }
        } 
          else
          {
              display.setCursor(0, 10);
              display.print("Failed to begin OTA update.");
              Serial.println("Failed to begin OTA update.");
          }
      }
      else
      {
          display.setCursor(0, 10);
          display.print("Failed to download firmware. HTTP code: ");
          display.println(httpCode);
          Serial.print("Failed to download firmware. HTTP code: ");
          Serial.println(httpCode);
      }
      display.display();
      delay(400);
      http.end();
  }

  void setup() {
    /*
      Người dùng build code tại đây
    */
    Wire.begin(8,18);
    led.begin();
    led.setBrightness(50);
    led.setPixelColor(0, led.Color(255, 0, 255));
    led.show();  
    if (!display.begin(SSD1306_SWITCHCAPVCC, i2c_Address)) {
      led.setPixelColor(0, led.Color(255, 0, 0));
      led.show();
      Serial.println("OLED fail!");
      while (1);
    }
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.printf("He thong dang \nkhoi dong...");
    display.display();
    delay(1000);
    pinMode(LED,OUTPUT);
    digitalWrite(LED,0);
    Serial.begin(115200);
    Serial.println("He thong dang khoi dong...");
    display.display();
    display.clearDisplay();
    WiFi.begin(ssid,pass);
    while (WiFi.status() != WL_CONNECTED) {
      led.setPixelColor(0, led.Color(255, 0, 255));
      led.show();
      Serial.println("dang khoi dong WiFi...");
      display.setCursor(0,0);
      display.print("Conecting WiFi");
      if(demwf < 80) {
        display.setCursor(demwf,10);
        display.print(".");
        Serial0.println(".");
      }
      else if(demwf > 80) {
        display.clearDisplay();
        demwf = 0;
      }
      demwf+=5;
      display.display();
      digitalWrite(LED,1);
      delay(300);
    }
    digitalWrite(LED,0);
    Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
    config.database_url = DATABASE_URL;
    config.signer.tokens.legacy_token = DATABASE_SECRET;
    Firebase.reconnectWiFi(true);
    fbdo.setBSSLBufferSize(512, 512);
    Firebase.begin(&config, &auth);
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 30);
    display.println("XIN CHAO CAC BAN");
    display.display();
    delay(300);
    display.clearDisplay();
    led.setPixelColor(0, led.Color(0, 255, 0));
    led.show();
  }

  void loop() {
    if(Firebase.getInt(fbdo, "/updateOTA")) checkupdate = fbdo.intData();
    if(checkupdate == 1) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print("UPDATE OTA");
      display.display();
      getupdate();
    }
    /*
      Xây dựng cơ chế xử lý của bạn tại đây
    */
  }
`;
  return code;
}

import OpenAI from "https://esm.sh/openai";
import { Octokit } from "https://esm.sh/@octokit/core";

async function chatinit() {
  const chat = await client.chat.completions.create({
    model: "groq/compound-mini",
    messages: [
      {
        role: "system",
        content:
          "Bạn là một lập trình viên nhúng siêu cấp và bạn chỉ được sử dụng tiếng việt, phục vụ riêng cho nền tảng nukedashboard.",
      },
      {
        role: "user",
        content:
          "Bạn giúp tôi trả lời các câu hỏi về lập trình nhúng, đặc biệt là về nền tảng nukedashboard. Hãy trả lời một cách ngắn gọn, dễ hiểu và chỉ tập trung vào giải quyết vấn đề của tôi.",
      },
    ],
  });
  document.getElementById("Welcome").textContent =
    chat.choices[0].message.content;
  console.log(chat.usage);
}
//chatinit();
async function chat(text) {
  // LLM Chatbot
  const code = createCode(wifi, pass);
  const chat = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
        Bạn là một lập trình viên nhúng siêu cấp và bạn chỉ được sử dụng tiếng việt, phục vụ riêng cho nền tảng nukedashboard.
        + Những bắt buộc khi trả lời:
        + Chỉ trả lời code, không giải thích, không markdown.
        + Code được bạn viết tích hợp vào ${code} tại hai vị trí này nha:
        1/ trong hàm setup chỉ được viết đè lên phần     /*
                                                            Người dùng build code tại đây
                                                          */
        2/ trong hàm loop chỉ được viết đè lên phần     /*
                                                            Xây dựng cơ chế xử lý của bạn tại đây
                                                          */
        + Nội dung là trả lời phiên cho người dùng là phiên bản code hoàn thiện giữ nguyên cấu trúc và code của ${code} nhưng được bạn viết lại phần code trong hai hàm setup và loop theo yêu cầu của người dùng.
        `,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  addMsg(chat.choices[0].message.content, "bot");
  const encoded = btoa(
    unescape(encodeURIComponent(chat.choices[0].message.content)),
  );
  const old = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "Duczzzz",
      repo: "testOTA",
      path: "bme280_ssd1306_boardLuong/bme280_ssd1306_boardLuong.ino",
    },
  );
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: "Duczzzz",
    repo: "testOTA",
    path: "bme280_ssd1306_boardLuong/bme280_ssd1306_boardLuong.ino",
    message: "test commit from chatbot",
    committer: {
      name: "Minh Duc",
      email: "ducpt423ac@gmail.com",
    },
    content: encoded,
    headers: {
      "X-GitHub-Api-Version": "2026-03-10",
    },
    sha: old.data.sha,
  });

  // Chatbot MCP

  // const chat = await client.chat.completions.create({
  //   // model: "openai/gpt-oss-120b",
  //   model: "groq/compound-mini",
  //   messages: [
  //     {
  //       role: "system",
  //       content: `
  //         Bạn là AI điều khiển ESP32 MCP Server.

  //         Chỉ trả về JSON hợp lệ.
  //         Không markdown.
  //         Không giải thích.

  //         Các tools hiện có:

  //         1. led
  //         arguments:
  //         {
  //           "on": boolean
  //         }

  //         2. red_led
  //         arguments:
  //         {
  //           "on": boolean
  //         }

  //         3. green_led
  //         arguments:
  //         {
  //           "on": boolean
  //         }

  //         4. blue_led
  //         arguments:
  //         {
  //           "on": boolean
  //         }

  //         Format bắt buộc:
  //         {
  //           "jsonrpc":"2.0",
  //           "id":1,
  //           "method":"tools/call",
  //           "params":{
  //             "name":"tool_name",
  //             "arguments":{}
  //           }
  //         }
  //         `,
  //     },
  //     {
  //       role: "user",
  //       content: text,
  //     },
  //   ],
  // });

  // const aiText = chat.choices[0].message.content;

  // console.log(aiText);

  // const mcpCommand = JSON.parse(aiText);

  // const res = await fetch("http://192.168.2.11:8000/mcp", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(mcpCommand),
  // });

  // const result = await res.json();

  // console.log(result);

  // addMsg(JSON.stringify(result, null, 2), "bot");
}
function getTime() {
  const now = new Date();
  return (
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0")
  );
}
function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
function addMsg(text, role) {
  const box = document.getElementById("cb-messages");
  const div = document.createElement("div");
  div.className = "msg " + role;
  const av = document.createElement("div");
  av.className = "msg-avatar " + role;
  av.textContent = role === "bot" ? "AI" : "B";
  const inner = document.createElement("div");
  inner.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div><p class="msg-time">${getTime()}</p>`;
  div.appendChild(av);
  div.appendChild(inner);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function showTyping() {
  const box = document.getElementById("cb-messages");
  const div = document.createElement("div");
  div.className = "msg bot";
  div.id = "typing-indicator";
  div.innerHTML = `<div class="msg-avatar bot">AI</div><div><div class="msg-bubble typing-bubble"><span></span><span></span><span></span></div></div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

async function sendMessage(text) {
  if (!text) return;
  addMsg(text, "user");
  showTyping();
  var rep = await chat(text);
  hideTyping();
}

document.getElementById("send-btn").onclick = function () {
  var text = document.getElementById("cb-input").value.trim();
  if (text == "") return;
  else {
    sendMessage(text);
    document.getElementById("cb-input").value = "";
  }
};
document.addEventListener("change", function (e) {
  if (e.target.id === "SW-SYSTEM") {
    if (e.target.checked) {
      document.getElementById("cb-warp").style.display = "none";
      document.getElementById("system-box").style.display = "flex";
    } else {
      document.getElementById("cb-warp").style.display = "flex";
      document.getElementById("system-box").style.display = "none";
    }
  }
});

document.getElementById("save-config").onclick = function () {
  wifi = document.getElementById("SSID").value.trim();
  pass = document.getElementById("password").value.trim();
  apikey = document.getElementById("api-key").value.trim();
  tokengh = document.getElementById("token-github").value.trim();
  localStorage.setItem("wifi", wifi);
  localStorage.setItem("pass", pass);
  localStorage.setItem("apikey", apikey);
  localStorage.setItem("tokengh", tokengh);
  client = new OpenAI({
    apiKey: apikey,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true,
  });
  octokit = new Octokit({
    auth: tokengh,
  });
  alert("Cấu hình đã được lưu. Bạn có thể bắt đầu trò chuyện với chatbot.");
  document.getElementById("SW-SYSTEM").checked = false;
};
