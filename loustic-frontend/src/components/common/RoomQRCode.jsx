import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * Carte QR code cartoon Rubber Hose pour rejoindre instantanément une salle multi-téléphones.
 * Générée en SVG vectoriel pur (100% local, aucun appel réseau externe, zéro latence).
 */
export default function RoomQRCode({ url, code }) {
  const [showQR, setShowQR] = useState(true)

  return (
    <div
      className="room-qr-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        margin: '10px 0',
        width: '100%',
      }}
    >
      <button
        id="toggle-qr-btn"
        type="button"
        style={{
          background: '#ffffff',
          border: '2px solid #161513',
          borderRadius: '999px',
          padding: '6px 14px',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#161513',
          boxShadow: '2px 2px 0 #161513',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'transform 0.1s ease',
        }}
        onClick={() => setShowQR(s => !s)}
      >
        <span aria-hidden="true">📷</span>
        <span>{showQR ? 'Masquer le QR code' : 'Afficher le QR code'}</span>
      </button>

      {showQR && (
        <div
          id="room-qr-card"
          style={{
            background: '#ffffff',
            padding: '12px',
            borderRadius: '16px',
            border: '3px solid #161513',
            boxShadow: '4px 4px 0 #161513',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ padding: '6px', background: '#ffffff', borderRadius: '10px' }}>
            <QRCodeSVG
              value={url}
              size={155}
              level="M"
              bgColor="#ffffff"
              fgColor="#161513"
            />
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#57606f',
              textAlign: 'center',
              maxWidth: '190px',
              lineHeight: '1.3',
            }}
          >
            Scanne avec ton appareil photo pour rejoindre la salle <strong>{code}</strong> ⚡
          </span>
        </div>
      )}
    </div>
  )
}
