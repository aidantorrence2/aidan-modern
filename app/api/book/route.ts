import { NextResponse } from 'next/server'

function isString(x: unknown): x is string { return typeof x === 'string' }

export async function POST(req: Request){
  try{
    const body = await req.json().catch(()=> ({}))
    const name = body?.name
    const whatsapp = body?.whatsapp
    const date = body?.date
    const time = body?.time
    const session = body?.session
    const location = body?.location
    if(!isString(name) || !isString(whatsapp) || !isString(date) || !isString(time) || !isString(session)){
      return NextResponse.json({ ok:false, error:'Invalid input' }, { status: 400 })
    }
    const payload = {
      name,
      whatsapp,
      date,
      time,
      session,
      location: isString(location) && location.trim() ? location.trim() : undefined,
      notes: isString(body?.notes) ? body.notes : undefined,
      ts: new Date().toISOString()
    }
    console.log('[BOOKING]', payload)

    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if(!webhookUrl){
      console.warn('[BOOKING] Missing SLACK_BOOKING_WEBHOOK env; skipping Slack alert')
    }else{
      try{
        const slackBody = {
          text: `New booking request from ${payload.name}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New booking request*\n*Name:* ${payload.name}\n*WhatsApp:* ${payload.whatsapp}\n*Session:* ${payload.session}\n*Date:* ${payload.date} at ${payload.time}${payload.location ? `\n*Location:* ${payload.location}` : ''}${payload.notes ? `\n*Notes:* ${payload.notes}` : ''}`
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Received ${new Date(payload.ts).toLocaleString('en-US', { timeZone: 'UTC' })} UTC`
                }
              ]
            }
          ]
        }
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackBody)
        })
      }catch(err){
        console.error('[BOOKING] Failed to notify Slack', err)
      }
    }

    return NextResponse.json({ ok:true })
  }catch(err){
    return NextResponse.json({ ok:false }, { status: 500 })
  }
}
