export interface IRegisterRequest {
  full_name: string;
  email: string;
  password: string;
  /// Confirmation only — never sent to Supabase.
  confirm: string;
}
