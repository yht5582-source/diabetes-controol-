const STORAGE_KEY = "diabetes-controll-evaluation-v1";

const scoreItems = [
  { key: "glucose", label: "血糖改善", weight: 0.35 },
  { key: "behavior", label: "行為改變", weight: 0.25 },
  { key: "follow", label: "追蹤完成", weight: 0.15 },
  { key: "team", label: "跨職類協作", weight: 0.15 },
  { key: "selfCare", label: "病人自我管理", weight: 0.1 },
];

const defaultRoles = [
  { role: "衛教師", focus: "用藥順從性、血糖監測、自我照護" },
  { role: "營養師", focus: "餐次、醣量、外食、點心與飲食紀錄" },
  { role: "醫師／藥師", focus: "治療強度、藥物副作用、共病與影響血糖藥物" },
  { role: "個管師／其他", focus: "回診障礙、家庭支持、心理社會需求" },
];

const options = {
  role: ["衛教師", "營養師", "醫師", "藥師", "個案管理師", "病人／家屬", "社工／心理師", "其他"],
  status: ["未開始", "進行中", "已完成", "暫緩／取消"],
  method: ["門診", "電話", "視訊", "LINE／簡訊", "居家紀錄回傳"],
  change: ["明顯改善", "部分改善", "無明顯改變", "惡化", "資料不足", "需重新評估"],
  achievement: ["達成", "部分達成", "未達成", "需調整目標", "失聯／未追蹤"],
};

const state = {
  patient: {},
  scores: Object.fromEntries(scoreItems.map((item) => [item.key, ""])),
  roles: defaultRoles.map((item) => ({ ...item, person: "", finding: "", suggestion: "", status: "", doctorComment: "", followDate: "", change: "", note: "" })),
  follows: [blankFollow()],
};

function blankFollow() {
  return {
    evalDate: "",
    followDate: "",
    method: "",
    fasting: "",
    postMeal: "",
    a1c: "",
    change: "",
    achievement: "",
    nextStep: "",
    doctorComment: "",
    recorder: "",
  };
}

function el(id) {
  return document.getElementById(id);
}

function makeOptions(values, current = "") {
  return [`<option value=""></option>`, ...values.map((value) => `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(value)}</option>`)].join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderScores() {
  el("scoreRows").innerHTML = scoreItems
    .map((item) => {
      const value = state.scores[item.key] ?? "";
      const weighted = value === "" ? "" : ((Number(value) / 5) * item.weight * 100).toFixed(1);
      return `
        <div class="score-row">
          <span>${item.label}</span>
          <small>${Math.round(item.weight * 100)}%</small>
          <select data-score="${item.key}">
            ${[0, 1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${String(score) === String(value) ? "selected" : ""}>${score}</option>`).join("")}
            <option value="" ${value === "" ? "selected" : ""}></option>
          </select>
          <strong>${weighted || "-"}</strong>
        </div>
      `;
    })
    .join("");
}

function renderRoles() {
  el("roleBody").innerHTML = state.roles
    .map(
      (row, index) => `
      <tr>
        <td><select data-role-index="${index}" data-field="role">${makeOptions(options.role, row.role)}</select></td>
        <td><input data-role-index="${index}" data-field="person" value="${escapeHtml(row.person)}" /></td>
        <td><textarea data-role-index="${index}" data-field="finding" rows="2">${escapeHtml(row.finding || row.focus || "")}</textarea></td>
        <td><textarea data-role-index="${index}" data-field="suggestion" rows="2">${escapeHtml(row.suggestion)}</textarea></td>
        <td><select data-role-index="${index}" data-field="status">${makeOptions(options.status, row.status)}</select></td>
        <td><textarea data-role-index="${index}" data-field="doctorComment" rows="2">${escapeHtml(row.doctorComment)}</textarea></td>
        <td><input data-role-index="${index}" data-field="followDate" type="date" value="${escapeHtml(row.followDate)}" /></td>
        <td><select data-role-index="${index}" data-field="change">${makeOptions(options.change, row.change)}</select></td>
        <td><button class="icon-button" type="button" data-remove-role="${index}" title="刪除此列">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function renderFollows() {
  el("followBody").innerHTML = state.follows
    .map(
      (row, index) => `
      <tr>
        <td><input data-follow-index="${index}" data-field="evalDate" type="date" value="${escapeHtml(row.evalDate)}" /></td>
        <td><input data-follow-index="${index}" data-field="followDate" type="date" value="${escapeHtml(row.followDate)}" /></td>
        <td><select data-follow-index="${index}" data-field="method">${makeOptions(options.method, row.method)}</select></td>
        <td><input data-follow-index="${index}" data-field="fasting" type="number" step="0.1" value="${escapeHtml(row.fasting)}" /></td>
        <td><input data-follow-index="${index}" data-field="postMeal" type="number" step="0.1" value="${escapeHtml(row.postMeal)}" /></td>
        <td><input data-follow-index="${index}" data-field="a1c" type="number" step="0.1" value="${escapeHtml(row.a1c)}" /></td>
        <td><select data-follow-index="${index}" data-field="change">${makeOptions(options.change, row.change)}</select></td>
        <td><select data-follow-index="${index}" data-field="achievement">${makeOptions(options.achievement, row.achievement)}</select></td>
        <td><textarea data-follow-index="${index}" data-field="nextStep" rows="2">${escapeHtml(row.nextStep)}</textarea></td>
        <td><textarea data-follow-index="${index}" data-field="doctorComment" rows="2">${escapeHtml(row.doctorComment)}</textarea></td>
        <td><input data-follow-index="${index}" data-field="recorder" value="${escapeHtml(row.recorder)}" /></td>
        <td><button class="icon-button" type="button" data-remove-follow="${index}" title="刪除此列">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function bindPatientForm() {
  document.querySelectorAll("#patientForm input, #patientForm textarea").forEach((input) => {
    input.value = state.patient[input.name] ?? "";
    input.addEventListener("input", () => {
      state.patient[input.name] = input.value;
      updateSummary();
    });
  });
}

function updateSummary() {
  const total = scoreItems.reduce((sum, item) => {
    const raw = Number(state.scores[item.key]);
    return Number.isFinite(raw) ? sum + (raw / 5) * item.weight * 100 : sum;
  }, 0);
  const scoredCount = scoreItems.filter((item) => state.scores[item.key] !== "").length;
  const grade = scoredCount === 0 ? "未評分" : total >= 85 ? "A 明顯改善" : total >= 70 ? "B 部分改善" : total >= 60 ? "C 需加強" : "D 需重新評估";
  const latest = [...state.follows].reverse().find((row) => row.change || row.followDate || row.evalDate);
  const planned = state.patient.plannedFollowDate || latest?.followDate || "";

  el("totalScore").textContent = scoredCount === 0 ? "0.0" : total.toFixed(1);
  el("gradeText").textContent = grade;
  el("latestChange").textContent = latest?.change || "無資料";
  el("nextDate").textContent = planned || "未填寫";
  el("decisionText").textContent =
    grade === "未評分"
      ? "請填入各面向評分。"
      : grade.startsWith("A")
        ? "維持計畫，延長追蹤間隔或轉為例行追蹤。"
        : grade.startsWith("B")
          ? "延續有效策略，針對未達成項目微調。"
          : grade.startsWith("C")
            ? "安排密集衛教或營養追蹤，確認主要障礙。"
            : "建議召開跨職類討論，重新設定目標與治療策略。";
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast("已儲存到本機瀏覽器");
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state.patient = saved.patient || state.patient;
    state.scores = { ...state.scores, ...(saved.scores || {}) };
    state.roles = Array.isArray(saved.roles) && saved.roles.length ? saved.roles : state.roles;
    state.follows = Array.isArray(saved.follows) && saved.follows.length ? saved.follows : state.follows;
  } catch {
    showToast("讀取本機資料失敗");
  }
}

function showToast(message) {
  const toast = el("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const rows = [
    ["區段", "病人姓名", "病歷號", "初次評估日期", "後續評估日期", "欄位1", "欄位2", "欄位3", "欄位4", "醫師評論"],
    ["基本資料", state.patient.patientName, state.patient.chartNo, state.patient.initialDate, state.patient.plannedFollowDate, state.patient.baselineA1c, state.patient.targetA1c, state.patient.primaryIssue, state.patient.careGoal, state.patient.doctorInitial],
    ...state.roles.map((row) => ["協作", state.patient.patientName, state.patient.chartNo, "", row.followDate, row.role, row.person, row.status, row.change, row.doctorComment]),
    ...state.follows.map((row) => ["追蹤", state.patient.patientName, state.patient.chartNo, row.evalDate, row.followDate, row.method, row.a1c, row.change, row.nextStep, row.doctorComment]),
    ["評值", state.patient.patientName, state.patient.chartNo, "", "", el("totalScore").textContent, el("gradeText").textContent, "", "", ""],
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `糖尿病控制不良評估_${state.patient.chartNo || "未命名"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function attachEvents() {
  document.addEventListener("input", (event) => {
    const target = event.target;
    const roleIndex = target.dataset.roleIndex;
    const followIndex = target.dataset.followIndex;
    if (roleIndex !== undefined) state.roles[Number(roleIndex)][target.dataset.field] = target.value;
    if (followIndex !== undefined) state.follows[Number(followIndex)][target.dataset.field] = target.value;
    updateSummary();
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.score) {
      state.scores[target.dataset.score] = target.value;
      renderScores();
      updateSummary();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.dataset.removeRole !== undefined) {
      state.roles.splice(Number(target.dataset.removeRole), 1);
      renderRoles();
      updateSummary();
    }
    if (target.dataset.removeFollow !== undefined) {
      state.follows.splice(Number(target.dataset.removeFollow), 1);
      renderFollows();
      updateSummary();
    }
  });

  el("addRoleBtn").addEventListener("click", () => {
    state.roles.push({ role: "", person: "", finding: "", suggestion: "", status: "", doctorComment: "", followDate: "", change: "", note: "" });
    renderRoles();
  });

  el("addFollowBtn").addEventListener("click", () => {
    state.follows.push(blankFollow());
    renderFollows();
  });

  el("saveBtn").addEventListener("click", save);
  el("exportBtn").addEventListener("click", exportCsv);
}

load();
renderScores();
renderRoles();
renderFollows();
bindPatientForm();
attachEvents();
updateSummary();
