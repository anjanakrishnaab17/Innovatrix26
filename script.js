const app = document.querySelector("#app");
let currentUser = null;
let page = "dashboard";

const suspects = [
  ["10:19", "Unidentified traveller", "Narcotics", "High", "Under review", "?"],
  ["09:08", "Rohit Verma", "Explosives", "Critical", "Escalated", "RV"],
  ["08:43", "A. Dutta", "Narcotics", "Low", "Cleared", "AD"]
];

const movements = [
  ["10:42", "Aarav Sharma", "Entry — Gate 03", "12951 / Mumbai Rajdhani"],
  ["10:31", "Maria Chen", "Entry — Gate 01", "12002 / Bhopal Shatabdi"],
  ["10:19", "Rohit Verma", "Exit — Gate 02", "Unmatched"]
];

function accounts() {
  return JSON.parse(localStorage.getItem("railsecure_accounts") || "[]");
}

function saveAccounts(list) {
  localStorage.setItem("railsecure_accounts", JSON.stringify(list));
}

function notifications() {
  return JSON.parse(localStorage.getItem("railsecure_notifications") || "[]");
}

function saveNotifications(list) {
  localStorage.setItem("railsecure_notifications", JSON.stringify(list));
}

function loginPage() {
  app.innerHTML = `
    <section class="login">
      <div class="login-card">
        <div class="brand">
          <div class="chakra">☸</div>
          <h1>RailSecure<br>Operations Portal</h1>
          <p>Real-Time Detection of Narcotics and Explosives across Indian Railways.</p>
        </div>

        <form class="form" id="loginForm">
          <h2>Secure Sign In</h2>
          <p>Select your user category.</p>

          <div class="field">
            <label>USER TYPE</label>
            <select id="loginRole">
              <option value="station">Station Master</option>
              <option value="master">Master User</option>
              <option value="passenger">Passenger</option>
            </select>
          </div>

          <div class="field">
            <label id="loginIdLabel">EMPLOYEE ID</label>
            <input id="loginId" required>
          </div>

          <div class="field">
            <label>PASSWORD</label>
            <input id="loginPassword" type="password" required>
          </div>

          <div id="otpArea"></div>

          <button class="primary">Sign In</button>

          <div class="links">
            <button type="button" class="text-btn" onclick="signupPage('station')">Employee sign-up</button>
            <button type="button" class="text-btn" onclick="signupPage('passenger')">Passenger registration</button>
            <button type="button" class="text-btn" onclick="signupPage('master')">Master-user sign-up</button>
          </div>

          <p class="note">
            Only approved Station Masters can sign in. Master User accounts are limited to ten.
          </p>
        </form>
      </div>
    </section>
  `;

  const role = document.querySelector("#loginRole");
  const idLabel = document.querySelector("#loginIdLabel");
  const otpArea = document.querySelector("#otpArea");

  function updateLoginFields() {
    idLabel.textContent = role.value === "passenger" ? "USERNAME" : "EMPLOYEE ID";

    otpArea.innerHTML = role.value === "master"
      ? `<div class="field">
           <label>ONE-TIME PASSWORD</label>
           <input required inputmode="numeric" placeholder="OTP sent to registered phone">
         </div>`
      : "";
  }

  updateLoginFields();
  role.onchange = updateLoginFields;

  document.querySelector("#loginForm").onsubmit = event => {
    event.preventDefault();

    const id = document.querySelector("#loginId").value.trim();
    const password = document.querySelector("#loginPassword").value;
    const roleValue = role.value;

    const account = accounts().find(a =>
      a.id === id &&
      a.password === password &&
      a.role === roleValue
    );

    if (!account) {
      alert("Invalid credentials or user is not registered.");
      return;
    }

    if (account.status !== "approved") {
      alert("Your account is awaiting Master User approval.");
      return;
    }

    currentUser = account;
    page = currentUser.role === "passenger" ? "passenger" : "dashboard";
    render();
  };
}

function signupPage(selectedRole) {
  app.innerHTML = `
    <section class="login">
      <div class="login-card">
        <div class="brand">
          <div class="chakra">☸</div>
          <h1>Registration &<br>Verification</h1>
          <p>RailSecure personnel and passenger enrolment.</p>
        </div>

        <form class="form" id="signupForm">
          <h2>Create Account</h2>

          <div class="field">
            <label>REGISTRATION TYPE</label>
            <select id="signupRole">
              <option value="station">Station Master</option>
              <option value="passenger">Foreign/NRI Passenger</option>
              <option value="master">Master User</option>
            </select>
          </div>

          <div class="field">
            <label>FULL NAME</label>
            <input id="fullName" required>
          </div>

          <div class="field">
            <label id="identityLabel">EMPLOYEE ID</label>
            <input id="signupId" required>
          </div>

          <div class="field">
            <label>CREATE PASSWORD</label>
            <input id="password" type="password" required>
          </div>

          <div class="field">
            <label>CONFIRM PASSWORD</label>
            <input id="confirmPassword" type="password" required>
          </div>

          <div class="field">
            <label>PHOTO / OFFICIAL ID IMAGE</label>
            <input type="file" accept="image/*">
          </div>

          <div id="roleFields"></div>

          <button class="primary">Submit Registration</button>

          <p><button type="button" class="text-btn" onclick="loginPage()">Back to sign in</button></p>
        </form>
      </div>
    </section>
  `;

  const role = document.querySelector("#signupRole");
  role.value = selectedRole;

  function updateSignupFields() {
    const roleFields = document.querySelector("#roleFields");
    const label = document.querySelector("#identityLabel");

    if (role.value === "station") {
      label.textContent = "EMPLOYEE ID";
      roleFields.innerHTML = `
        <div class="field">
          <label>ASSIGNED STATION</label>
          <input id="station" required placeholder="Station name and code">
        </div>
        <p class="note">Station Master registration must be approved by a Master User.</p>
      `;
    }

    if (role.value === "passenger") {
      label.textContent = "USERNAME";
      roleFields.innerHTML = `
        <div class="field">
          <label>PASSPORT NUMBER / AUTHORISED ID REFERENCE</label>
          <input id="passport" required>
        </div>
        <div class="field">
          <label>NATIONALITY</label>
          <input id="nationality" required>
        </div>
        <p class="note">Foreign/NRI users must renew verification every six months.</p>
      `;
    }

    if (role.value === "master") {
      label.textContent = "EMPLOYEE ID";
      roleFields.innerHTML = `
        <div class="field">
          <label>REGISTERED PHONE NUMBER</label>
          <input id="phone" required>
        </div>
        <p class="note">Master User sign-up does not require approval. Maximum: 10 active Master Users.</p>
      `;
    }
  }

  updateSignupFields();
  role.onchange = updateSignupFields;

  document.querySelector("#signupForm").onsubmit = event => {
    event.preventDefault();

    const id = document.querySelector("#signupId").value.trim();
    const password = document.querySelector("#password").value;
    const confirm = document.querySelector("#confirmPassword").value;
    const roleValue = role.value;
    const list = accounts();

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    if (list.some(a => a.id === id)) {
      alert("This user ID is already registered.");
      return;
    }

    if (roleValue === "master" && list.filter(a => a.role === "master").length >= 10) {
      alert("Maximum Master User limit has been reached.");
      return;
    }

    const account = {
      id,
      name: document.querySelector("#fullName").value,
      password,
      role: roleValue,
      station: document.querySelector("#station")?.value || "",
      status: roleValue === "station" ? "pending" : "approved",
      renewal: roleValue === "passenger" ? "6 months" : "1 year"
    };

    list.push(account);
    saveAccounts(list);

    if (roleValue === "master") {
      const alerts = notifications();
      alerts.push(`${account.name} registered as a new Master User.`);
      saveNotifications(alerts);
    }

    alert(
      roleValue === "station"
        ? "Registration submitted. Await Master User approval."
        : "Registration completed. You may now sign in."
    );

    loginPage();
  };
}

function nav(key, text) {
  return `<button class="nav ${page === key ? "active" : ""}" onclick="page='${key}';render()">${text}</button>`;
}

function shell(content) {
  const passenger = currentUser.role === "passenger";
  const master = currentUser.role === "master";

  app.innerHTML = `
    <header class="top">
      <div>
        <b>☸ RailSecure</b>
        <small>INDIAN RAILWAYS · SECURITY OPERATIONS</small>
      </div>
      <div>
        <b>${currentUser.name}</b>
        <small>${master ? "Master User" : passenger ? "Passenger" : "Station Master"}</small>
        <button class="text-btn" style="color:white" onclick="loginPage()">Sign out</button>
      </div>
    </header>

    <div class="portal">
      <aside>
        <div class="station">
          <b>${passenger ? "Passenger Services" : master ? "National Operations View" : currentUser.station || "Railway Station"}</b>
          <small>${passenger ? "Private access only" : "Authorised user access"}</small>
        </div>

        ${passenger
          ? nav("passenger", "My Profile & Journey")
          : nav("dashboard", "Profile & Overview") +
            nav("history", "Passenger History") +
            nav("suspect", "Suspect Review") +
            nav("registry", "Passenger Registry") +
            nav("devices", "Device & QR Status")
        }

        ${master ? nav("approvals", "Employee Approvals") : ""}
        ${master ? nav("travellers", "NRI/Foreign Verifications") : ""}
        ${master ? nav("notifications", "Master Notifications") : ""}
      </aside>

      <main>${content}</main>
    </div>
  `;
}

function dashboard() {
  return `
    <div class="heading">
      <div><h1>Profile & Station Overview</h1><p>Railway security operations summary</p></div>
      <span class="badge ok">● Systems operational</span>
    </div>

    <div class="cards">
      <div class="card"><label>PASSENGER ENTRIES</label><b>14,280</b><small>Today</small></div>
      <div class="card"><label>PASSENGER EXITS</label><b>13,946</b><small>Today</small></div>
      <div class="card"><label>OPEN SENSOR ALERTS</label><b>03</b><small>Requires review</small></div>
      <div class="card"><label>HIGH-PRIORITY CASES</label><b>01</b><small>Escalated</small></div>
    </div>

    <div class="grid">
      <section class="panel">
        <h2>Recent Passenger Movement</h2>
        ${movementTable()}
      </section>

      <section class="panel">
        <h2>My e-Smart Card</h2>
        <div class="smart">
          <div>
            <b>${currentUser.name}</b>
            <small>Employee ID: ${currentUser.id}</small>
            <small>QR-enabled official e-card</small>
          </div>
          <div class="qr"></div>
        </div>
      </section>
    </div>
  `;
}

function movementTable() {
  return `
    <table>
      <thead><tr><th>Time</th><th>Passenger</th><th>Movement</th><th>Train</th></tr></thead>
      <tbody>
        ${movements.map(x => `
          <tr>
            <td>${x[0]}</td>
            <td><span class="avatar">${x[1].split(" ").map(a => a[0]).join("")}</span>${x[1]}</td>
            <td>${x[2]}</td>
            <td>${x[3]}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function history() {
  return `
    <div class="heading"><div><h1>Passenger Entry & Exit History</h1><p>Date and time-based records.</p></div></div>
    <section class="panel">${movementTable()}</section>
  `;
}

function suspect() {
  return `
    <div class="heading"><div><h1>Suspect Review Queue</h1><p>Narcotics and explosives classification.</p></div><span class="badge warn">1 critical case</span></div>
    <div class="notice">Authorised officers must verify sensor indications before operational action.</div>
    <section class="panel">
      <table>
        <thead><tr><th>Time</th><th>Person</th><th>Category</th><th>Risk</th><th>Status</th></tr></thead>
        <tbody>
          ${suspects.map(x => `
            <tr>
              <td>${x[0]}</td>
              <td><span class="avatar alert">${x[5]}</span>${x[1]}</td>
              <td>${x[2]}</td>
              <td><span class="badge ${x[3] === "Critical" ? "danger" : x[3] === "Low" ? "ok" : "warn"}">${x[3]}</span></td>
              <td>${x[4]}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function registry() {
  return `
    <div class="heading"><div><h1>Passenger Registration</h1><p>Foreign/NRI registration and periodic verification.</p></div></div>
    <div class="notice">Real Aadhaar, passport, facial images, and train data must be handled only by approved encrypted backend services.</div>
    <section class="panel"><h2>Registration Assistance</h2><p>Station Masters can assist foreign/NRI passengers with consent-based registration or six-month verification.</p></section>
  `;
}

function devices() {
  return `
    <div class="heading"><div><h1>Device & QR Status</h1><p>Connected handheld/mobile devices.</p></div><button class="action" onclick="addDevice()">+ Add Device</button></div>
    <div class="cards">
      <div class="card"><label>CONNECTED DEVICES</label><b>06 / 07</b></div>
      <div class="card"><label>QR VALIDATIONS</label><b>8,932</b></div>
      <div class="card"><label>DEVICE EVENTS</label><b>34</b></div>
      <div class="card"><label>LAST SYNC</label><b>10:44</b></div>
    </div>
    <section class="panel">
      <h2>Face Scan / QR Scan</h2>
      <p>Scanning must use an authorised device API and a legally approved, consent-based identity service.</p>
      <button class="action" onclick="alert('Connect an approved device API before enabling face scan.')">Connect Scanner</button>
    </section>
  `;
}

function addDevice() {
  const device = prompt("Enter device name or device ID:");
  if (device) alert(`${device} has been submitted for authorised device registration.`);
}

function passenger() {
  return `
    <div class="heading"><div><h1>My Profile & Journey</h1><p>Private passenger account.</p></div><span class="badge ok">Verification current</span></div>
    <section class="panel">
      <h2>My Train Details</h2>
      <p><b>Train:</b> 12951 / Mumbai Rajdhani</p>
      <p><b>Journey:</b> New Delhi → Mumbai Central</p>
      <p><b>Ticket:</b> Reserved · AC 3 Tier</p>
      <p><button class="text-btn" onclick="alert('Verification request submitted.')">Request six-month verification</button></p>
    </section>
  `;
}

function approvals() {
  const pending = accounts().filter(a => a.role === "station" && a.status === "pending");

  return `
    <div class="heading"><div><h1>Employee Approvals</h1><p>Verify and approve new or annual employee verification requests.</p></div></div>
    <section class="panel">
      ${pending.length ? pending.map(a => `
        <p>
          <b>${a.name}</b> — ${a.id} — ${a.station}
          <button class="action" onclick="approveEmployee('${a.id}')">Approve</button>
        </p>
      `).join("") : "<p>No pending employee approvals.</p>"}
    </section>
  `;
}

function approveEmployee(id) {
  const list = accounts();
  const account = list.find(a => a.id === id);
  account.status = "approved";
  saveAccounts(list);
  alert("Employee approved.");
  render();
}

function travellers() {
  const list = accounts().filter(a => a.role === "passenger");

  return `
    <div class="heading"><div><h1>NRI/Foreign Verifications</h1><p>Review six-month passenger verification requests.</p></div></div>
    <section class="panel">
      ${list.length ? list.map(a => `<p><b>${a.name}</b> — ${a.id} — Verification cycle: ${a.renewal}</p>`).join("") : "<p>No registered foreign/NRI passengers.</p>"}
    </section>
  `;
}

function notificationPage() {
  const list = notifications();

  return `
    <div class="heading"><div><h1>Master Notifications</h1><p>New Master User registration alerts.</p></div></div>
    <section class="panel">
      ${list.length ? list.map(n => `<p>• ${n}</p>`).join("") : "<p>No notifications.</p>"}
    </section>
  `;
}

function render() {
  const views = {
    dashboard, history, suspect, registry, devices,
    passenger, approvals, travellers, notifications: notificationPage
  };

  shell(views[page]());
}

loginPage();