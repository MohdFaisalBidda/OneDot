import { getAllDecisions, getAllFocus } from '@/actions'
import { Timeline } from '@/app/_components/Timeline'
import React from 'react'

export const dynamic = 'force-dynamic';

async function page() {
  const [focusEntries, decisionEntries] = await Promise.all([
    getAllFocus(),
    getAllDecisions(),
  ])

  return (
    <Timeline focusEntries={focusEntries.data} decisionEntries={decisionEntries.data} />
  )
}

export default page