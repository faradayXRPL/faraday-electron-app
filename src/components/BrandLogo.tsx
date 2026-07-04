import { BRAND_ASSETS } from '../lib/brandAssets'

type Props = {
  variant?: 'logo' | 'icon'
  className?: string
}

export function BrandLogo({ variant = 'logo', className = '' }: Props) {
  const isIcon = variant === 'icon'
  return (
    <img
      src={isIcon ? BRAND_ASSETS.icon : BRAND_ASSETS.logo}
      alt="Faraday"
      className={`brand-logo ${isIcon ? 'brand-logo--icon' : 'brand-logo--full'} ${className}`.trim()}
      decoding="async"
      draggable={false}
    />
  )
}
