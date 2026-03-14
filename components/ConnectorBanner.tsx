import TruoraIcon from './icons/TruoraIcon'

export default function ConnectorBanner() {
  return (
    <div className="connector-banner">
      <div className="connector-logo connector-logo--text">
        Jira
      </div>
      <div className="connector-line connector-line--left" />
      <div className="connector-pill">Semantic</div>
      <div className="connector-line connector-line--right" />
      <div className="connector-logo">
        <TruoraIcon />
      </div>
    </div>
  )
}
