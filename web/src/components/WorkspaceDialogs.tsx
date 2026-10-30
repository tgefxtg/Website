import { Download, Check, Asterisk } from "lucide-react";
import type { Preferences } from "../preferences";
import { DotText } from "./DotText";
import { Modal } from "./Modal";
export function SettingsDialog({
  prefs,
  setPrefs,
  systemReduced,
  installed,
  installPrompt,
  setInstallPrompt,
  onClose,
}: {
  prefs: Preferences;
  setPrefs: (prefs: Preferences) => void;
  systemReduced: boolean;
  installed: boolean;
  installPrompt: any;
  setInstallPrompt: (value: any) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Make yourself at home." onClose={onClose}>
      <p className="modal-description">
        A few small adjustments to your thinking space.
      </p>
      <div className="setting-row">
        <div>
          <b>Appearance</b>
          <p>Set the tone for your workspace.</p>
        </div>
        <select
          aria-label="Appearance"
          value={prefs.theme}
          onChange={(e) =>
            setPrefs({
              ...prefs,
              theme: e.target.value as Preferences["theme"],
            })
          }
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>
      <div className="setting-row">
        <div>
          <b>Interface motion</b>
          <p>
            {systemReduced
              ? "Your device requests reduced motion."
              : "Subtle reveals and responsive dots."}
          </p>
        </div>
        <input
          type="checkbox"
          aria-label="Interface motion"
          checked={prefs.motion && !systemReduced}
          disabled={systemReduced}
          onChange={(e) => setPrefs({ ...prefs, motion: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <div>
          <b>Enter to send</b>
          <p>Shift + Enter always adds a new line.</p>
        </div>
        <input
          type="checkbox"
          aria-label="Enter to send"
          checked={prefs.enter}
          onChange={(e) => setPrefs({ ...prefs, enter: e.target.checked })}
        />
      </div>
      <div className="setting-row">
        <div>
          <b>Mock response pace</b>
          <p>Choose a little breathing room.</p>
        </div>
        <select
          aria-label="Response speed"
          value={prefs.speed}
          onChange={(e) =>
            setPrefs({
              ...prefs,
              speed: e.target.value as Preferences["speed"],
            })
          }
        >
          <option value="natural">Natural</option>
          <option value="fast">Fast</option>
        </select>
      </div>
      <div className="install-row">
        <Download size={19} />
        <div>
          <b>Keep DOTLINE close.</b>
          <p>
            {installed
              ? "Installed on this device."
              : installPrompt
                ? "Install this workspace as an app."
                : "Use your browser’s Install app or Add to Home Screen option where supported."}
          </p>
        </div>
        {installPrompt && (
          <button
            className="primary-button"
            onClick={async () => {
              await installPrompt.prompt();
              setInstallPrompt(null);
            }}
          >
            Install
          </button>
        )}
      </div>
      <div className="shortcut-row">
        <span>
          Search <kbd>⌘ / Ctrl K</kbd>
        </span>
        <span>
          New chat <kbd>⌘ / Ctrl ⇧ O</kbd>
        </span>
      </div>
    </Modal>
  );
}
export function AboutDialog({
  onClose,
  browserHistory = false,
  provider = "mock",
}: {
  onClose: () => void;
  browserHistory?: boolean;
  provider?: "mock" | "gemini";
}) {
  return (
    <Modal title="A quieter kind of workspace." onClose={onClose}>
      <DotText text="DOTLINE" className="modal-dot-title" />
      <p className="modal-description">
        An original conversation instrument. A little space for your next big
        idea.
      </p>
      <div className="info-block">
        <b>
          {browserHistory
            ? "Your history stays in this browser."
            : "Your data stays with your server."}
        </b>
        <p>
          {browserHistory
            ? "Conversations are saved on this device. Clearing this website’s browser data deletes them. History does not sync across devices."
            : "Conversation history lives in your private Java server’s database. Appearance preferences stay in this browser."}
        </p>
      </div>
      <div className="info-block">
        <b>
          {provider === "gemini" ? "Powered by Gemini." : "Mock by design."}
        </b>
        <p>
          {provider === "gemini"
            ? "To generate a response, the current conversation is sent through a secure server function to Google Gemini. AI can make mistakes; check important information."
            : "Responses are deterministic simulations. No live AI provider is being used for these responses."}
        </p>
      </div>
      <p className="muted">
        Keyboard shortcuts: Ctrl/⌘ K to search, Ctrl/⌘ Shift O for a new chat.
        Escape closes dialogs.
      </p>
    </Modal>
  );
}
export function ProviderDialog({
  simulateError,
  setSimulateError,
  provider = "mock",
  onClose,
}: {
  provider?: "mock" | "gemini";
  simulateError: boolean;
  setSimulateError: (value: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Meet your thought partner." onClose={onClose}>
      <div className="model-info">
        <Asterisk className="large-star" size={56} />
        <div>
          <h3>{provider === "gemini" ? "Gemini" : "DOTLINE 01"}</h3>
          <span className="eyebrow">
            {provider === "gemini" ? "SERVER-SIDE AI" : "MOCK PROVIDER"}
          </span>
        </div>
        <Check size={19} />
      </div>
      <p className="modal-description">
        {provider === "gemini"
          ? "Gemini is selected on the server. Your conversation is sent to Google to generate responses. Credentials are managed by the site owner and stay on the server."
          : "A simulated conversation experience for exploring the interface. Try a writing prompt, planning question, or Java example. All mock output is clearly labelled."}
      </p>
      {provider === "mock" && (
        <div className="setting-row">
          <div>
            <b>Simulate next response failure</b>
            <p>Test the error state and retry flow.</p>
          </div>
          <input
            type="checkbox"
            aria-label="Simulate next response failure"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
          />
        </div>
      )}
      <p className="muted">
        {provider === "gemini"
          ? "AI responses may be inaccurate. Verify important information."
          : "A site owner can enable Gemini through secure server configuration."}
      </p>
    </Modal>
  );
}
