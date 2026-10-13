/**
 * Bouton Rubber Hose de la thumb zone.
 * variant: 'primary' | 'secondary' | 'success' | 'danger'
 */
export default function CartoonButton({ variant = 'primary', className = '', children, ...props }) {
  const variantClass = variant === 'primary' ? '' : `btn-${variant}`
  return (
    <button type="button" className={`btn-cta ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
