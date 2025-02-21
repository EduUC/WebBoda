const { createClient } = require('@supabase/supabase-js');

// Crear cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

module.exports = supabase;

const dotenv = require('dotenv');
dotenv.config();
