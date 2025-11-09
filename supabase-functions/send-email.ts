// Supabase Edge Function - Mail Gönderimi
// Bu dosyayı Supabase Dashboard'da Functions kısmında oluşturacaksın

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, message, from = 'noreply@yourdomain.com' } = await req.json()

    // Zoho Mail SMTP ayarları (Environment Variables'dan al)
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('ZOHO_SMTP_HOST') || 'smtp.zoho.com',
        port: Number(Deno.env.get('ZOHO_SMTP_PORT')) || 587,
        tls: true,
        auth: {
          username: Deno.env.get('ZOHO_EMAIL'),
          password: Deno.env.get('ZOHO_PASSWORD'),
        },
      },
    })

    // Toplu mail gönderimi
    if (Array.isArray(to)) {
      for (const recipient of to) {
        await client.send({
          from: from,
          to: recipient,
          subject: subject,
          content: message,
          html: message.replace(/\n/g, '<br>'), // Basit HTML dönüşümü
        })
      }
    } else {
      // Tek mail
      await client.send({
        from: from,
        to: to,
        subject: subject,
        content: message,
        html: message.replace(/\n/g, '<br>'),
      })
    }

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
