import { useState } from "react";
import styles from "../styles/ChatBot.module.css";

export default function ChatBot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <div className={styles.botAvatar}><BotIcon /></div>
            <div>
              <p className={styles.botName}>Asistente D'Vita</p>
              <span className={styles.botStatus}><span className={styles.statusDot} />En línea</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.message}>
            <div className={styles.botMsg}>
              <BotIcon size={14} />
              <span>¡Hola! Soy el asistente de Hospedaje D'Vita. ¿En qué puedo ayudarte hoy?</span>
            </div>
          </div>
          <div className={styles.message}>
            <div className={styles.botMsg}>
              <BotIcon size={14} />
              <span>Puedo ayudarte con reservas, información de habitaciones y más. 🏨</span>
            </div>
          </div>
        </div>

        <div className={styles.panelFooter}>
          <input className={styles.chatInput} type="text" placeholder="Escribe un mensaje…" disabled />
          <button className={styles.sendBtn} disabled>
            <SendIcon />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        className={`${styles.fab} ${open ? styles.fabActive : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chatbot"
      >
        <span className={styles.fabInner}>
          {open ? <CloseIcon size={22} /> : <BotIcon size={22} />}
        </span>
        {!open && <span className={styles.fabPing} />}
      </button>
    </>
  );
}

function BotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M12 2a3 3 0 013 3v6H9V5a3 3 0 013-3z"/>
      <path d="M8 11V7M16 11V7M9 16h.01M15 16h.01"/>
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  );
}
