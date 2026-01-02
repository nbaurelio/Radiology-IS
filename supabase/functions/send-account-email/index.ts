// Enable Supabase Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

declare global {
  namespace Deno {
    const env: {
      get(key: string): string | undefined
    }
    const serve: (handler: (req: Request) => Promise<Response>) => void
  }
}

const corsHeaders: { [key: string]: string } = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

// Base64 encode for Gmail SMTP authentication
const base64Encode = (str: string): string => {
  return btoa(str)
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    const { email, userId, name, password } = await req.json()

    if (!email || !userId || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      )
    }

    const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID")
    const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID")
    const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY")

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS credentials not set")
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      )
    }

    // Use EmailJS for sending emails
    const emailjsUrl = "https://api.emailjs.com/api/v1.0/email/send"
    
    const emailData = {
      service_id: Deno.env.get("EMAILJS_SERVICE_ID"),
      template_id: Deno.env.get("EMAILJS_TEMPLATE_ID"),
      user_id: Deno.env.get("EMAILJS_PUBLIC_KEY"),
      template_params: {
        to_email: email,
        to_name: name || "User",
        user_id: userId,
        password: password // Use the password passed from AdminPage
      }
    }

    const emailResponse = await fetch(emailjsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text()
      console.error("EmailJS error:", errorBody)
      return new Response(
        JSON.stringify({ error: "Email send failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (err) {
    console.error("Function error:", err)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    )
  }
})