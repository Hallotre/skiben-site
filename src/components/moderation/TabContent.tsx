'use client'

import { ReactNode } from 'react'

interface TabContentProps {
  value: string
  selectedTab: string
  children: ReactNode
}

export default function TabContent({ value, selectedTab, children }: TabContentProps) {
  return (
    <div style={{ display: value === selectedTab ? 'block' : 'none' }}>
      {children}
    </div>
  )
}

