import { DISCORD_PATH, ICONS } from '../icons.js'

export function Icon({ name, size = 20, className = '' }) {
  if (name === 'discord') {
    return (
      <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
        <path d={DISCORD_PATH} />
      </svg>
    )
  }
  return (
    <svg
      className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }}
    />
  )
}
