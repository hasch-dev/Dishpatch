import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const body = await req.json()

    const {
      dealId,
      amount,
      paymentType,
      description
    } = body

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const externalId =
      `deal_${dealId}_${Date.now()}`

    const response = await fetch(
      "https://api.xendit.co/v2/invoices",
      {
        method: "POST",
        headers: {
          Authorization:
            `Basic ${Buffer.from(
              process.env.XENDIT_SECRET_KEY + ":"
            ).toString("base64")}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          external_id: externalId,

          amount,

          description,

          currency: "PHP",

          success_redirect_url:
            `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,

          failure_redirect_url:
            `${process.env.NEXT_PUBLIC_APP_URL}/payments/failed`,

          payment_methods: [
            "GCASH",
            "PAYMAYA",
            "CARD",
            "QRPH"
          ]
        })
      }
    )

    const invoice =
      await response.json()

    if (!response.ok) {
      console.error(invoice)

      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      )
    }

    await supabase
      .from("payments")
      .insert({
        deal_id: dealId,

        user_id: user.id,

        amount,

        payment_type: paymentType,

        status: "pending",

        provider: "xendit",

        external_id: externalId,

        invoice_id: invoice.id,

        invoice_url: invoice.invoice_url,

        expires_at:
          invoice.expiry_date,

        raw_response: invoice
      })

    return NextResponse.json({
      checkoutUrl:
        invoice.invoice_url
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    )
  }
}