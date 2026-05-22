import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpsbxkwlumcwzxuyaxwl.supabase.co'
const supabaseKey = 'sb_publishable_ESsj2eY63lA1atEyuEU4Gw_j2zxmuQS'

export const supabase = createClient(supabaseUrl, supabaseKey)