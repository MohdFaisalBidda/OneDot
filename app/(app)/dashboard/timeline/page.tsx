import { getRecentDecisions, getRecentFocus } from '@/actions'
import { Timeline } from '@/app/_components/Timeline'
import React from 'react'

async function page() {
  const [focusEntries, decisionEntries] = await Promise.all([
    getRecentFocus(),
    getRecentDecisions(),
  ])

  return (
    <Timeline focusEntries={focusEntries.data} decisionEntries={decisionEntries.data} />
  )
}

export default page