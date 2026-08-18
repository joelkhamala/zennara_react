import { useEffect } from 'react'

/**
 * SEO component to update document head meta tags dynamically.
 * This is a lightweight alternative to react-helmet-async.
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterSite = '@zennara',
  keywords = 'real estate, luxury, property, investment, nairobi, mombasa, east africa',
}) {
  const baseTitle = 'ZENNARA — Luxury Real Estate & Investment Advisory'
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle

  const baseDescription = 'Discover exceptional properties, development projects and investment opportunities across East Africa.'
  const finalDescription = description || baseDescription

  const baseUrl = window.location.origin
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : window.location.href

  useEffect(() => {
    // Update title
    document.title = fullTitle

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = finalDescription

    // Update canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.href = canonicalUrl

    // OpenGraph
    const ogTags = [
      { property: 'og:title', content: ogTitle || fullTitle },
      { property: 'og:description', content: ogDescription || finalDescription },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: ogImage || 'https://zennara.com/og-default.png' },
      { property: 'og:type', content: 'website' },
    ]

    // Twitter
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:site', content: twitterSite },
      { name: 'twitter:title', content: ogTitle || fullTitle },
      { name: 'twitter:description', content: ogDescription || finalDescription },
      { name: 'twitter:image', content: ogImage || 'https://zennara.com/og-default.png' },
    ]

    // Keywords
    const keywordMeta = document.querySelector('meta[name="keywords"]')
    if (!keywordMeta) {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      document.head.appendChild(meta)
    }
    if (keywordMeta) keywordMeta.content = keywords

    // Apply/update tags
    const applyMeta = (selector, content, isProperty = false) => {
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        if (isProperty) meta.setAttribute('property', selector.split('[')[0])
        else meta.name = selector.split('[')[0]
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    ogTags.forEach(tag => applyMeta(`meta[property="${tag.property}"]`, tag.content, true))
    twitterTags.forEach(tag => applyMeta(`meta[name="${tag.name}"]`, tag.content))

    // Cleanup: revert to defaults on unmount (for SPA)
    return () => {
      document.title = baseTitle
      const defaultDesc = document.querySelector('meta[name="description"]')
      if (defaultDesc) defaultDesc.content = baseDescription
      const defaultCanonical = document.querySelector('link[rel="canonical"]')
      if (defaultCanonical) defaultCanonical.href = baseUrl
    }
  }, [fullTitle, finalDescription, canonicalUrl, ogImage, ogTitle, ogDescription, twitterCard, twitterSite, keywords])

  return null // No UI
}
