(function () {
  const passwordHash = "ddfe42dda5c02c4b40a9e496ab3ad692f704725b7b8a9538c02a768fd4169118";
  const sessionKey = "planoAcompanhamentoAutorizado";

  document.documentElement.dataset.authLocked = "true";

  const style = document.createElement("style");
  style.textContent = `
    html[data-auth-locked="true"] body > *:not(.auth-screen) {
      visibility: hidden;
    }

    .auth-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #eef3f1;
      color: #15201d;
      font-family: Inter, Arial, Helvetica, sans-serif;
    }

    .auth-box {
      width: min(420px, 100%);
      border: 1px solid #d7e1dd;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 20px 60px rgba(17, 44, 38, 0.12);
      padding: 24px;
    }

    .auth-box h1 {
      margin: 0 0 8px;
      font-size: 1.45rem;
      line-height: 1.15;
    }

    .auth-box p {
      margin: 0 0 18px;
      color: #62716d;
      line-height: 1.5;
    }

    .auth-box label {
      display: grid;
      gap: 8px;
      color: #62716d;
      font-size: 0.92rem;
    }

    .auth-box input {
      width: 100%;
      min-height: 46px;
      border: 1px solid #d7e1dd;
      border-radius: 8px;
      padding: 0 12px;
      font: inherit;
    }

    .auth-box input:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 4px #d9f3ee;
      outline: none;
    }

    .auth-box button {
      width: 100%;
      min-height: 44px;
      margin-top: 14px;
      border: 1px solid #0f766e;
      border-radius: 8px;
      background: #0f766e;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
    }

    .auth-error {
      min-height: 22px;
      margin-top: 10px;
      color: #b42318;
      font-size: 0.9rem;
    }
  `;
  document.head.append(style);

  async function sha256(value) {
    const encoded = new TextEncoder().encode(value);
    const buffer = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function unlock(screen) {
    sessionStorage.setItem(sessionKey, "true");
    document.documentElement.dataset.authLocked = "false";
    document.documentElement.classList.remove("auth-pending");
    screen.remove();
  }

  function buildAuthScreen() {
    const screen = document.createElement("div");
    screen.className = "auth-screen";
    screen.innerHTML = `
      <form class="auth-box">
        <h1>Acesso restrito</h1>
        <p>Informe a senha para acessar o plano de acompanhamento.</p>
        <label>
          Senha
          <input type="password" autocomplete="current-password" autofocus />
        </label>
        <button type="submit">Entrar</button>
        <div class="auth-error" aria-live="polite"></div>
      </form>
    `;

    const form = screen.querySelector("form");
    const input = screen.querySelector("input");
    const error = screen.querySelector(".auth-error");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const typedHash = await sha256(input.value);

      if (typedHash === passwordHash) {
        unlock(screen);
        return;
      }

      error.textContent = "Senha incorreta.";
      input.value = "";
      input.focus();
    });

    return screen;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const screen = buildAuthScreen();
    document.body.append(screen);

    if (sessionStorage.getItem(sessionKey) === "true") {
      unlock(screen);
    }
  });
})();
