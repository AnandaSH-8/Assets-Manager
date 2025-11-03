import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];
    const id = pathSegments[pathSegments.length - 2];
    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'No authorization header',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    // Create authenticated Supabase client for this request
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid token',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }
    switch (req.method) {
      case 'GET':
        if (action === 'all') {
          return await getAllFinancials(supabase, user.id);
        } else if (action === 'stats') {
          return await getFinancialStats(supabase, user.id);
        } else if (action === 'titles') {
          return await getUniqueTitles(supabase, user.id);
        } else if (id && action !== 'all' && action !== 'titles') {
          return await getFinancial(supabase, id, user.id);
        }
        break;
      case 'POST':
        return await createFinancial(req, supabase, user.id);
      case 'PUT':
        if (id) {
          return await updateFinancial(req, supabase, id, user.id);
        }
        break;
      case 'DELETE':
        if (action === 'clear-all') {
          return await clearAllFinancials(supabase, user.id);
        } else if (id) {
          return await deleteFinancial(supabase, id, user.id);
        }
        break;
    }
    return new Response(
      JSON.stringify({
        error: 'Invalid request',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Financial API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
async function getAllFinancials(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', {
      ascending: false,
    });
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      data,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function getFinancial(supabase: any, id: string, userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      data,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function createFinancial(req: Request, supabase: any, userId: string) {
  const {
    category,
    description,
    amount,
    cash,
    investment,
    current_value,
    month,
    year,
  } = await req.json();
  if (!category || !amount) {
    return new Response(
      JSON.stringify({
        error: 'Category and amount are required',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  const { data, error } = await supabase
    .from('financial_particulars')
    .insert({
      user_id: userId,
      category,
      description,
      amount,
      cash: cash || 0,
      investment: investment || 0,
      current_value: current_value || 0,
      month,
      year: year || new Date().getFullYear(),
    })
    .select()
    .single();
  if (error) {
    console.error('Create financial error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      data,
      message: 'Financial particular created successfully',
    }),
    {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function updateFinancial(
  req: Request,
  supabase: any,
  id: string,
  userId: string,
) {
  const updates = await req.json();
  const { data, error } = await supabase
    .from('financial_particulars')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      data,
      message: 'Financial particular updated successfully',
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function deleteFinancial(supabase: any, id: string, userId: string) {
  const { error } = await supabase
    .from('financial_particulars')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      message: 'Financial particular deleted successfully',
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function getFinancialStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('category, amount, cash, investment')
    .eq('user_id', userId);
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  // Calculate statistics
  const totalAmount = data.reduce(
    (sum: number, item: any) => sum + Number(item.amount),
    0,
  );
  const totalCash = data.reduce(
    (sum: number, item: any) => sum + Number(item.cash || 0),
    0,
  );
  const totalInvestment = data.reduce(
    (sum: number, item: any) => sum + Number(item.investment || 0),
    0,
  );
  const categoryStats = data.reduce((acc: any, item: any) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});
  const stats = {
    total_amount: totalAmount,
    total_cash: totalCash,
    total_investment: totalInvestment,
    total_entries: data.length,
    category_breakdown: categoryStats,
    average_amount: data.length > 0 ? totalAmount / data.length : 0,
  };
  return new Response(
    JSON.stringify({
      data: stats,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function clearAllFinancials(supabase: any, userId: string) {
  const { error } = await supabase
    .from('financial_particulars')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error('Clear all financials error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      message: 'All financial data cleared successfully',
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
async function getUniqueTitles(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('financial_particulars')
    .select('description')
    .eq('user_id', userId)
    .not('description', 'is', null);
  if (error) {
    console.error('Get unique titles error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  // Extract unique non-empty titles
  const uniqueTitles = [
    ...new Set(data.map((item: any) => item.description).filter(Boolean)),
  ];
  return new Response(
    JSON.stringify({
      data: uniqueTitles,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
