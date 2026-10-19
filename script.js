// ======================================
// DRIN SENSI - SCRIPT PRINCIPAL
// ======================================

// Para demonstração local.
// Estes códigos NÃO ficam protegidos contra inspeção do navegador.
const ACCESS_CODE = "DRIN7ff";
const VIP_CODE = "vipdrin7";

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

const loginForm = document.getElementById("loginForm");
const accessCode = document.getElementById("accessCode");
const loginMessage = document.getElementById("loginMessage");

const brand = document.getElementById("brand");
const device = document.getElementById("device");
const playStyle = document.getElementById("playStyle");
const screenFeel = document.getElementById("screenFeel");

const buttonSize = document.getElementById("buttonSize");
const buttonValue = document.getElementById("buttonValue");
const dpi = document.getElementById("dpi");
const dpiValue = document.getElementById("dpiValue");

const results = document.getElementById("results");
const sensiGrid = document.getElementById("sensiGrid");
const resultDescription = document.getElementById("resultDescription");

const resultButton = document.getElementById("resultButton");
const resultDpi = document.getElementById("resultDpi");
const copyBtn = document.getElementById("copyBtn");
const copyMessage = document.getElementById("copyMessage");

const vipForm = document.getElementById("vipForm");
const vipCode = document.getElementById("vipCode");
const vipMessage = document.getElementById("vipMessage");
const vipContent = document.getElementById("vipContent");
const vipPreset = document.getElementById("vipPreset");
const vipGenerateBtn = document.getElementById("vipGenerateBtn");

let currentConfiguration = null;
let vipUnlocked = false;

// ======================================
// ACESSO AO GERADOR
// ======================================

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (accessCode.value === ACCESS_CODE) {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    loginMessage.textContent = "";
    accessCode.value = "";
  } else {
    loginMessage.textContent = "Código incorreto. Tente novamente.";
    accessCode.value = "";
    accessCode.focus();
  }
});

// ======================================
// ATUALIZAR CONTROLES
// ======================================

buttonSize.addEventListener("input", function () {
  buttonValue.textContent = `${buttonSize.value}%`;
});

dpi.addEventListener("input", function () {
  dpiValue.textContent = dpi.value;
});

// ======================================
// BASE DE SENSIBILIDADE
// Valores experimentais de 0 a 200
// Não são configurações oficiais.
// ======================================

const basePresets = {
  capa:       [185, 175, 165, 150, 90, 150],
  equilibrado:[170, 155, 145, 130, 80, 135],
  precisao:   [155, 140, 130, 115, 70, 120],
  rush:       [190, 180, 160, 140, 85, 165]
};

const brandAdjustments = {
  xiaomi: 0,
  samsung: -4,
  oppo: 2,
  iphone: -7,
  motorola: 1,
  realme: 2,
  infinix: 3,
  tecno: 2,
  asus: -2,
  outro: 0
};

const sensitivityNames = [
  "Geral",
  "Ponto Vermelho",
  "Mira 2x",
  "Mira 4x",
  "Mira AWM",
  "Olhadinha"
];

// ======================================
// FUNÇÃO DE LIMITAÇÃO DOS VALORES
// ======================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ======================================
// GERADOR DE SENSIBILIDADE
// ======================================

function generateSensitivity(options = {}) {
  const style = options.style || playStyle.value;
  const feel = options.feel || screenFeel.value;
  const selectedBrand = brand.value;

  let values = [...basePresets[style]];

  // Ajuste leve conforme a marca selecionada.
  const adjustment = brandAdjustments[selectedBrand] ?? 0;

  values = values.map((value, index) => {
    let result = value + adjustment;

    // Ajuste para resposta da tela.
    if (feel === "rapida") {
      result += index < 4 ? 5 : 2;
    }

    if (feel === "suave") {
      result -= index < 4 ? 8 : 4;
    }

    // Ajuste experimental para o botão de tiro.
    const sizeAdjustment = (Number(buttonSize.value) - 48) / 5;

    if (index === 0 || index === 1) {
      result += sizeAdjustment;
    }

    return Math.round(clamp(result, 0, 200));
  });

  const configuration = {
    brand: brand.options[brand.selectedIndex].text,
    device: device.value.trim() || "Modelo não informado",
    style,
    feel,
    values,
    button: Number(buttonSize.value),
    dpi: Number(dpi.value),
    vip: Boolean(options.vip)
  };

  currentConfiguration = configuration;
  renderResults(configuration);

  return configuration;
}

// ======================================
// MOSTRAR OS RESULTADOS
// ======================================

function renderResults(configuration) {
  sensiGrid.replaceChildren();

  configuration.values.forEach((value, index) => {
    const card = document.createElement("div");
    card.className = "sensi-item";

    const name = document.createElement("span");
    name.textContent = sensitivityNames[index];

    const number = document.createElement("strong");
    number.textContent = value;

    card.append(name, number);
    sensiGrid.appendChild(card);
  });

  resultDescription.textContent =
    `${configuration.brand} • ${configuration.device} • ` +
    `Perfil: ${configuration.style} • ` +
    `${configuration.vip ? "Preset VIP" : "Preset normal"}`;

  resultButton.textContent = `${configuration.button}%`;
  resultDpi.textContent = configuration.dpi;

  results.classList.remove("hidden");
  copyMessage.textContent = "";

  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// ======================================
// BOTÃO GERAR SENSI NORMAL
// ======================================

document.getElementById("generateBtn").addEventListener("click", function () {
  generateSensitivity();
});

// ======================================
// COPIAR CONFIGURAÇÃO
// ======================================

function formatConfiguration(configuration) {
  return [
    "DRIN SENSI",
    "-------------------------",
    `Celular: ${configuration.brand}`,
    `Modelo: ${configuration.device}`,
    `Perfil: ${configuration.style}`,
    "",
    ...configuration.values.map((value, index) =>
      `${sensitivityNames[index]}: ${value}`
    ),
    "",
    `Botão de tiro: ${configuration.button}%`,
    `DPI de referência: ${configuration.dpi}`,
    "",
    "Configuração experimental para testar no jogo."
  ].join("\n");
}

copyBtn.addEventListener("click", async function () {
  if (!currentConfiguration) {
    copyMessage.textContent = "Gere uma configuração primeiro.";
    return;
  }

  const text = formatConfiguration(currentConfiguration);

  try {
    await navigator.clipboard.writeText(text);
    copyMessage.textContent = "Configuração copiada com sucesso!";
  } catch (error) {
    // Alternativa para ambientes sem Clipboard API.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    copyMessage.textContent = copied
      ? "Configuração copiada com sucesso!"
      : "Não foi possível copiar. Selecione os valores manualmente.";
  }
});

// ======================================
// DESBLOQUEAR PAINEL VIP
// ======================================

vipForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (vipCode.value === VIP_CODE) {
    vipUnlocked = true;

    vipContent.classList.remove("hidden");
    vipMessage.textContent = "Área VIP desbloqueada!";
    vipCode.value = "";
  } else {
    vipMessage.textContent = "Código VIP incorreto.";
    vipCode.value = "";
    vipCode.focus();
  }
});

// ======================================
// GERAR PRESETS VIP
// ======================================

const vipPresets = {
  agressiva: {
    style: "capa",
    feel: "rapida"
  },
  controle: {
    style: "precisao",
    feel: "suave"
  },
  rush: {
    style: "rush",
    feel: "rapida"
  }
};

vipGenerateBtn.addEventListener("click", function () {
  if (!vipUnlocked) {
    vipMessage.textContent = "Desbloqueie o VIP primeiro.";
    return;
  }

  const selectedPreset = vipPresets[vipPreset.value];

  if (!selectedPreset) {
    vipMessage.textContent = "Selecione um preset válido.";
    return;
  }

  generateSensitivity({
    style: selectedPreset.style,
    feel: selectedPreset.feel,
    vip: true
  });
});