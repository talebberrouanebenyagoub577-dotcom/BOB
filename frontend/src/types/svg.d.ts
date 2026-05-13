declare module "*.svg" {
  /** يُحمَّل مسار CDN/hashed ضمن `_next/static` عبر المُحمِّل حتى لا تعتمد على `/public`. */
  const src: string;
  export default src;
}
