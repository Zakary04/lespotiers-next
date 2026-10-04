// N'accepte qu'un chemin interne ("/compte", "/admin?x=1").
// Refuse les URL absolues, "//domaine", "/\domaine" et "@domaine", qui
// permettraient de rediriger l'utilisateur vers un site externe.
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
