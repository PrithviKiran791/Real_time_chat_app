import { dark } from "@clerk/themes";

/**
 * ChatSphere — Neomorphic Clerk Appearance Configuration
 *
 * Uses Clerk's official `baseTheme: dark` along with custom neomorphic variables and element classes.
 * Dark Blue + White + subtle Blue accents palette:
 *   - Background: #020617
 *   - Card: #071A35
 *   - Inset inputs: #0A2347
 *   - Primary accent: #2563EB (hover #1D4ED8)
 *   - Highlights/Links: #60A5FA (hover #93C5FD)
 *   - Text: #FFFFFF, Muted: #94A3B8, Labels: #CBD5E1
 */
export const clerkAppearance = {
  baseTheme: dark,
  layout: {
    logoPlacement: "none" as const,
    socialButtonsPlacement: "bottom" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#2563EB",
    colorBackground: "#071A35",
    colorInputBackground: "#0A2347",
    colorInput: "#0A2347",
    colorInputText: "#FFFFFF",
    colorInputForeground: "#FFFFFF",
    colorText: "#FFFFFF",
    colorForeground: "#FFFFFF",
    colorTextSecondary: "#94A3B8",
    colorNeutral: "#FFFFFF",
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorDanger: "#EF4444",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    borderRadius: "0.875rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontSize: "15px",
  },
  elements: {
    rootBox: "!w-full !max-w-full !flex !justify-center !p-0 !m-0",
    cardBox: "!w-full !max-w-full !shadow-none !bg-transparent !p-0 !m-0 !border-none",
    card: "!w-full !max-w-full !bg-transparent !text-white !border-none !shadow-none !p-0 !m-0 !rounded-none",
    main: "!w-full !max-w-full !flex !flex-col !items-stretch !p-0 !m-0",
    header: "!w-full !pb-4 !text-center !flex !flex-col !items-center !justify-center",
    headerTitle: "!w-full !text-white font-heading font-bold text-2xl sm:text-[26px] tracking-tight !text-center !mx-auto",
    headerSubtitle: "!w-full !text-[#94A3B8] text-sm sm:text-[14.5px] !mt-1.5 !text-center !mx-auto",
    form: "!w-full !space-y-4 !flex !flex-col !items-stretch",
    formField: "!w-full space-y-1.5",
    formFieldRow: "!w-full space-y-1.5",
    formFieldLabel: "!text-sm !font-medium !text-[#CBD5E1] !block !mb-1",
    formFieldLabelRow: "!flex !items-center !justify-between !w-full !mb-1",
    formFieldAction: "text-xs font-medium text-[#60A5FA] hover:text-[#93C5FD] transition-colors",
    formFieldInput:
      "!w-full !bg-[#0A2347] !text-white text-[15px] !border !border-white/10 rounded-xl px-4 py-3 placeholder:text-[#64748B] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.30),inset_-3px_-3px_8px_rgba(37,99,235,0.04)] transition-all",
    formFieldInputShowPasswordButton: "text-[#94A3B8] hover:text-white transition-colors",
    formButtonPrimary:
      "!w-full !bg-[#2563EB] hover:!bg-[#1D4ED8] !text-white font-semibold text-[15px] rounded-xl py-3 px-4 shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35)] transition-all cursor-pointer",
    socialButtons: "!w-full !flex !flex-col !gap-2.5",
    socialButtonsRoot: "!w-full !flex !flex-col !gap-2.5",
    socialButtonsBlockButton:
      "!w-full !bg-[#0A2347] hover:!bg-[#0F3161] !text-white !border !border-white/10 rounded-xl py-2.5 px-4 hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_12px_rgba(0,0,0,0.25),-2px_-2px_8px_rgba(37,99,235,0.04)] transition-all flex items-center justify-center gap-3 cursor-pointer",
    socialButtonsBlockButtonText: "!text-white font-medium text-sm",
    socialButtonsProviderIcon: "size-5 shrink-0",
    dividerRow: "!w-full my-4 flex items-center justify-center gap-3",
    dividerLine: "h-px !bg-white/10 flex-1",
    dividerText: "!text-[#64748B] text-xs uppercase tracking-wider font-semibold px-2 shrink-0",
    footer: "!w-full bg-transparent border-t border-white/10 pt-4 mt-5 !flex !flex-col !items-center !justify-center !text-center",
    footerAction: "!flex !items-center !justify-center !text-center gap-1.5 text-sm w-full",
    footerActionText: "!text-[#94A3B8]",
    footerActionLink: "!text-[#60A5FA] hover:!text-[#93C5FD] font-semibold transition-colors underline-offset-2 hover:underline",
    footerPages: "!w-full !flex !items-center !justify-center !text-center !pt-2",
    footerPagesLink: "!text-xs !text-[#64748B] hover:!text-[#94A3B8] !transition-colors",
    identityPreview: "!w-full !bg-[#0A2347] !border !border-white/10 rounded-xl p-3 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-between",
    identityPreviewText: "!text-white font-medium text-sm",
    identityPreviewEditButton: "text-xs font-semibold !text-[#60A5FA] hover:!text-[#93C5FD] transition-colors",
    alert: "!w-full !bg-red-500/10 !border !border-red-500/30 !text-red-200 rounded-xl p-3 text-sm flex items-start gap-2",
    alertText: "!text-red-200 text-xs sm:text-sm",
    formFieldErrorText: "!text-red-400 text-xs mt-1",
    formFieldSuccessText: "!text-emerald-400 text-xs mt-1",
    loading: "!text-[#60A5FA]",
    otpCodeFieldInput:
      "!bg-[#0A2347] !text-white !border !border-white/10 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.30)]",
    modalBackdrop: "!bg-[#020617] fixed inset-0 z-[9999] flex items-center justify-center p-4",
    modalContent: "bg-transparent border-none p-0 shadow-none max-w-[420px] w-full flex items-center justify-center",
    modalCloseButton: "text-[#94A3B8] hover:text-white bg-[#0A2347] hover:bg-[#0F3161] border border-white/10 rounded-full p-2 transition-colors",
  },
};

export default clerkAppearance;
