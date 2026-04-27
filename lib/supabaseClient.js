import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xncfvqycqicozkcwtxak.supabase.co'
const supabaseKey = 'sb_publishable_p5hg078zG5uC9gOFccfgKQ_q7womhI8'

export const supabase = createClient(supabaseUrl, supabaseKey)