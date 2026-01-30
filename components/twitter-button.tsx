'use client'

import React from 'react'

interface TwitterButtonProps {
  label: string
  secondary?: boolean
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  labelWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  labelSize?: 'xs' | 'sm' | 'base' | 'lg'
  fullWidth?: boolean
}

export default function TwitterButton({
  label,
  secondary = false,
  onClick,
  disabled = false,
  type = 'button',
  labelWeight = 'semibold',
  labelSize = 'base',
  fullWidth = false,
}: TwitterButtonProps) {
  const sizePadding = labelSize === 'xs' ? 'px-3 py-1.5' : labelSize === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'
  const sizeText = labelSize === 'xs' ? 'text-xs' : labelSize === 'sm' ? 'text-sm' : labelSize === 'base' ? 'text-base' : labelSize === 'lg' ? 'text-lg' : 'text-base'
  const weightClass = labelWeight === 'light' ? 'font-light' : labelWeight === 'normal' ? 'font-normal' : labelWeight === 'medium' ? 'font-medium' : labelWeight === 'semibold' ? 'font-semibold' : labelWeight === 'bold' ? 'font-bold' : 'font-normal'
  
  const baseStyles = `
    ${fullWidth ? 'w-full' : 'w-fit'}
    rounded-full
    ${sizePadding}
    ${sizeText}
    ${weightClass}
    transition-colors
    cursor-pointer
    outline-none
    active:outline-none
    ${disabled ? 'disabled:cursor-not-allowed opacity-60' : ''}
  `

  const variantStyles = secondary
    ? 'bg-white text-black hover:bg-opacity-80'
    : 'bg-emerald-600 text-white hover:bg-emerald-700'

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`${baseStyles} ${variantStyles}`}
    >
      {label}
    </button>
  )
}
