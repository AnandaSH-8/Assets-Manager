import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface FinancialParticularRequest {
  category: string
  description?: string
  amount: number
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]
    const id = pathSegments[pathSegments.length - 2]

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Set user context for RLS
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    })

    switch (req.method) {
      case 'GET':
        if (action === 'all') {
          return await getAllFinancials(user.id)
        } else if (action === 'stats') {
          return await getFinancialStats(user.id)
        } else if (id && action !== 'all') {
          return await getFinancial(id, user.id)
        }
        break
      
      case 'POST':
        return await createFinancial(req, user.id)
      
      case 'PUT':
        if (id) {
          return await updateFinancial(req, id, user.id)
        }
        break
      
      case 'DELETE':
        if (id) {
          return await deleteFinancial(id, user.id)
        }
        break
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Financial API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getAllFinancials(userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getFinancial(id: string, userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function createFinancial(req: Request, userId: string) {
  const { category, description, amount }: FinancialParticularRequest = await req.json()

  if (!category || !amount) {
    return new Response(
      JSON.stringify({ error: 'Category and amount are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  const { data, error } = await supabase
    .from('financial_particulars')
    .insert({
      user_id: userId,
      category,
      description,
      amount
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Financial particular created successfully' 
    }),
    { 
      status: 201, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function updateFinancial(req: Request, id: string, userId: string) {
  const updates: Partial<FinancialParticularRequest> = await req.json()

  const { data, error } = await supabase
    .from('financial_particulars')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Financial particular updated successfully' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function deleteFinancial(id: string, userId: string) {
  const { error } = await supabase
    .from('financial_particulars')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Financial particular deleted successfully' }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getFinancialStats(userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('category, amount')
    .eq('user_id', userId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  // Calculate statistics
  const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0)
  const categoryStats = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount)
    return acc
  }, {} as Record<string, number>)

  const stats = {
    total_amount: totalAmount,
    total_entries: data.length,
    category_breakdown: categoryStats,
    average_amount: data.length > 0 ? totalAmount / data.length : 0
  }

  return new Response(
    JSON.stringify({ data: stats }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}