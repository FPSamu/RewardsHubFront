const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.552c0-1.636-.145-3.2-.415-4.698H24.48v8.882h12.967c-.559 3.013-2.254 5.567-4.802 7.28v6.05h7.774c4.546-4.19 7.113-10.36 7.113-17.514z" fill="#4285F4" />
    <path d="M24.48 48c6.51 0 11.97-2.16 15.96-5.842l-7.774-6.051c-2.157 1.448-4.913 2.3-8.186 2.3-6.298 0-11.634-4.252-13.541-9.968H2.916v6.244C6.892 42.89 15.108 48 24.48 48z" fill="#34A853" />
    <path d="M10.939 28.439A14.4 14.4 0 0110.198 24c0-1.54.264-3.037.741-4.439v-6.244H2.916A23.976 23.976 0 000 24c0 3.866.93 7.524 2.916 10.683l8.023-6.244z" fill="#FBBC05" />
    <path d="M24.48 9.593c3.547 0 6.733 1.22 9.239 3.62l6.931-6.931C36.444 2.378 30.986 0 24.48 0 15.108 0 6.892 5.11 2.916 13.317l8.023 6.244c1.907-5.716 7.243-9.968 13.541-9.968z" fill="#EA4335" />
  </svg>
);

const providers = {
  google: { label: 'Continuar con Google', Icon: GoogleIcon },
};

export function SocialButton({ provider = 'google', onClick, disabled }) {
  const { label, Icon } = providers[provider];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-[#13110A] bg-white border border-[#EDE3C8] hover:border-[#D9C99C] hover:bg-[#FAFAF6] focus:outline-none focus:ring-[3px] focus:ring-[#FAE5AD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      style={{ boxShadow: '0 1px 4px rgba(20,16,5,0.07)' }}
    >
      <Icon />
      {label}
    </button>
  );
}
