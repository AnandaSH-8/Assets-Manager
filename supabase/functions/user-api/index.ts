import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ProfileUpdateRequest {
  name?: string;
  username?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Set user context for RLS
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    switch (action) {
      case 'profile':
        if (req.method === 'GET') {
          return await getProfile(user.id);
        } else if (req.method === 'PUT') {
          return await updateProfile(req, user.id);
        }
        break;

      case 'delete-account':
        if (req.method === 'DELETE') {
          return await deleteAccount(user.id);
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ error: 'Invalid request method' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateProfile(req: Request, userId: string) {
  const updates: ProfileUpdateRequest = await req.json();

  // Validate input
  if (
    updates.username &&
    (updates.username.length < 3 || updates.username.length > 30)
  ) {
    return new Response(
      JSON.stringify({ error: 'Username must be between 3 and 30 characters' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  if (updates.name && (updates.name.length < 1 || updates.name.length > 100)) {
    return new Response(
      JSON.stringify({ error: 'Name must be between 1 and 100 characters' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // Check if username is already taken (if provided)
  if (updates.username) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', updates.username)
      .neq('user_id', userId)
      .maybeSingle();

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username already taken' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      data,
      message: 'Profile updated successfully',
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

async function deleteAccount(userId: string) {
  // First delete the user's profile (cascades should handle the rest)
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
  }

  // Delete all financial particulars
  const { error: financialError } = await supabase
    .from('financial_particulars')
    .delete()
    .eq('user_id', userId);

  if (financialError) {
    console.error('Error deleting financial data:', financialError);
  }

  // Note: User deletion from auth.users requires admin privileges
  // This would typically be handled through Supabase admin API
  // For now, we'll just delete the user's data

  return new Response(
    JSON.stringify({
      message:
        'Account data deleted successfully. Please contact support to fully delete your account.',
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
