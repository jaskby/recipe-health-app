const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
