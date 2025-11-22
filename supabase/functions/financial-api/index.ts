import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Validation schema for financial data
const financialSchema = z.object({
  category: z.string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999, 'Amount must be less than 1 billion'),
  cash: z.number()
    .min(0, 'Cash must be non-negative')
    .max(999999999, 'Cash must be less than 1 billion')
    .optional(),
  investment: z.number()
    .min(0, 'Investment must be non-negative')
    .max(999999999, 'Investment must be less than 1 billion')
    .optional(),
  current_value: z.number()
    .min(0, 'Current value must be non-negative')
    .max(999999999, 'Current value must be less than 1 billion')
    .optional(),
  month: z.string()
    .trim()
    .max(20, 'Month must be less than 20 characters')
    .optional(),
  month_number: z.number()
    .int('Month number must be an integer')
    .min(1, 'Month number must be between 1 and 12')
    .max(12, 'Month number must be between 1 and 12')
    .optional(),
  year: z.number()
    .int('Year must be an integer')
    .min(1900, 'Year must be 1900 or later')
    .max(2100, 'Year must be 2100 or earlier')
    .optional(),
});

// Partial schema for updates (all fields optional)
const financialUpdateSchema = financialSchema.partial();

// Text sanitization helper
const sanitizeText = (text: string): string => {
  return text.replace(/[<>"']/g, '');
};

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
  try {
    const body = await req.json();

    // Validate input
    const result = financialSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: errors 
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const validatedData = result.data;

    // Sanitize text fields
    const sanitizedCategory = sanitizeText(validatedData.category);
    const sanitizedDescription = validatedData.description 
      ? sanitizeText(validatedData.description) 
      : undefined;
    const sanitizedMonth = validatedData.month 
      ? sanitizeText(validatedData.month) 
      : undefined;

    const { data, error } = await supabase
      .from('financial_particulars')
      .insert({
        user_id: userId,
        category: sanitizedCategory,
        description: sanitizedDescription,
        amount: validatedData.amount,
        cash: validatedData.cash || 0,
        investment: validatedData.investment || 0,
        current_value: validatedData.current_value || 0,
        month: sanitizedMonth,
        month_number: validatedData.month_number,
        year: validatedData.year || new Date().getFullYear(),
      })
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
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to create financial particular',
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
}
async function updateFinancial(
  req: Request,
  supabase: any,
  id: string,
  userId: string,
) {
  try {
    const body = await req.json();

    // Validate input (partial schema for updates)
    const result = financialUpdateSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: errors 
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const validatedData = result.data;

    // Sanitize text fields if they exist
    const updates: any = { ...validatedData };
    if (updates.category) {
      updates.category = sanitizeText(updates.category);
    }
    if (updates.description) {
      updates.description = sanitizeText(updates.description);
    }
    if (updates.month) {
      updates.month = sanitizeText(updates.month);
    }

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
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to update financial particular',
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
