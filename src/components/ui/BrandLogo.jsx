const LOGO_URL = 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png';

const imgSizes = { sm: 'h-7', md: 'h-9', lg: 'h-12' };
const textSizes = { sm: 'text-[15px]', md: 'text-[18px]', lg: 'text-[24px]' };

export function BrandLogo({ size = 'md', theme = 'dark', orientation = 'horizontal' }) {
  const textColor = theme === 'light' ? 'text-white' : 'text-[#13110A]';
  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex items-center gap-3 ${isVertical ? 'flex-col gap-2' : ''}`}>
      <img
        src={LOGO_URL}
        alt="RewardsHub"
        className={`${imgSizes[size]} w-auto object-contain`}
      />
      <span className={`${textSizes[size]} font-bold tracking-tight ${textColor}`}>
        RewardsHub
      </span>
    </div>
  );
}
